from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU
from sklearn.preprocessing import MinMaxScaler
import keras
import json
from bs4 import BeautifulSoup
import re
from keras_preprocessing.sequence import pad_sequences
from keras_preprocessing.text import Tokenizer
from keras.layers import Dense, BatchNormalization, Embedding, LSTM

app = Flask(__name__)
socketio = SocketIO(app)


@socketio.on("train/time_series")
def train_model_time_series(message):
    data = json.loads(message).get("dataset")
    filter = json.loads(message).get("y_feauture")
    df = pd.DataFrame(data)
    data = df[filter]

    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)

    time_step = 30  # to pasowało by dać do zmiennej
    x_train = []
    y_train = []
    for i in range(time_step, len(scaled_data)):
        x_train.append(scaled_data[i - time_step : i, :])
        y_train.append(scaled_data[i, :])

    x_train, y_train = np.array(x_train), np.array(y_train)

    model = Sequential()
    model.add(
        GRU(128, return_sequences=True, input_shape=(x_train.shape[1], len(filter)))
    )  # input_shape=(time_step, features) 30,1
    model.add(GRU(64, return_sequences=False))  # przy true jest błąd
    # model.add(Dense(25))
    model.add(Dense(len(filter)))

    class EpochLogger(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            epoch_info = {"epoch": epoch, "loss": logs["loss"]}
            print("TAK")
            emit("epoch_update", json.dumps(epoch_info))

    model.compile(optimizer="adam", loss="mean_squared_error", metrics=["accuracy"])

    model.fit(
        x_train,
        y_train,
        # validation_data=(x_test, y_test),
        batch_size=64,
        epochs=2,
        callbacks=[EpochLogger()],
    )
    emit("training_completed", "Model trained successfully!")


def cleanText(text):
    text = BeautifulSoup(str(text), "lxml").text
    text = re.sub(r"http\S+", r"<URL>", text)
    text = text.lower()
    return text


@socketio.on("train/text_classification")
def train_model_text_classification(message):
    data = json.loads(message).get("dataset")
    category = json.loads(message).get("category")
    text = json.loads(message).get("text")
    num_words = json.loads(message).get("num_words")
    max_text_len = json.loads(message).get("max_text_len")

    df = pd.DataFrame(data)
    df[text] = df[text].apply(cleanText)
    df[category] = pd.factorize(df[category])[0]

    texts = df[text]
    labels = df[category]

    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    X = pad_sequences(sequences, maxlen=max_text_len)
    y = labels.copy()

    num_categories = df[category].nunique()
    print("Liczba kategorii:", num_categories)

    model = Sequential()
    model.add(Embedding(num_words, 64, input_length=max_text_len))
    model.add(LSTM(3, return_sequences=True))
    model.add(LSTM(5, return_sequences=True))
    model.add(BatchNormalization())
    model.add(LSTM(12))
    model.add(Dense(1, activation="sigmoid"))
    # model.add(Dense(num_categories, activation="softmax"))

    class EpochLogger(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            epoch_info = {
                "epoch": epoch,
                "loss": logs["loss"],
                "accuracy": logs["Accuracy"],
            }
            emit("epoch_update", json.dumps(epoch_info))

    model.compile(metrics=["Accuracy"], loss="binary_crossentropy", optimizer="Adam")

    model.fit(
        X,
        y,
        batch_size=50,
        epochs=10,
        validation_split=0.2,
        callbacks=[EpochLogger()],
    )


if __name__ == "__main__":
    socketio.run(app, debug=False)
