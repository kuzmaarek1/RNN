from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM, GRU, SimpleRNN
from sklearn.preprocessing import MinMaxScaler
import keras
import json
from bs4 import BeautifulSoup
import re
from keras_preprocessing.sequence import pad_sequences
from keras_preprocessing.text import Tokenizer
from keras.layers import Dense, BatchNormalization, Embedding, LSTM
import tensorflow as tf
from sklearn import metrics
import uuid
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)


@socketio.on("train/time_series")
def train_model_time_series(message):
    data = json.loads(message).get("dataset")
    filter = json.loads(message).get("y_feauture")
    layers_config = json.loads(message).get("models")

    time_step = int(json.loads(message).get("time_step"))  # 30
    batch_size = int(json.loads(message).get("batch_size"))  # 64
    epochs = int(json.loads(message).get("epochs"))  # 2

    print(time_step)
    print(batch_size)
    print(epochs)
    df = pd.DataFrame(data)
    data = df[filter]
    print(data)
    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)

    x_train = []
    y_train = []
    for i in range(time_step, len(scaled_data)):
        x_train.append(scaled_data[i - time_step : i, :])
        y_train.append(scaled_data[i, :])

    x_train, y_train = np.array(x_train), np.array(y_train)

    model = Sequential()

    for idx, config in enumerate(layers_config):
        units = int(config["units"])
        return_sequences = config["returnSequences"]

        layer_mapping = {"GRU": GRU, "LSTM": LSTM, "RNN": SimpleRNN}

        layer_type = layer_mapping.get(config["layers"])

        if idx == 0:
            model.add(
                layer_type(
                    units,
                    return_sequences=return_sequences,
                    input_shape=(x_train.shape[1], len(filter)),
                )
            )
        else:
            model.add(layer_type(units, return_sequences=return_sequences))
    """
    model.add(
        GRU(128, return_sequences=True, input_shape=(x_train.shape[1], len(filter)))
    )  # input_shape=(time_step, features) 30,1
    model.add(GRU(64, return_sequences=False))  # przy true jest błąd
    """
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
        batch_size=batch_size,
        epochs=epochs,
        callbacks=[EpochLogger()],
    )
    print(model.summary())

    model_name = f"model_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    path_to_save = f"../files/models/{model_name}.keras"
    model.save(path_to_save)

    emit(
        "training_completed",
        json.dumps(
            {
                "path": model_name,
                "filter": filter,
                "time_step": time_step,
                "data_min": scaler.data_min_.tolist(),
                "data_max": scaler.data_max_.tolist(),
            }
        ),
    )


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
    num_words = int(json.loads(message).get("num_words"))
    max_text_len = int(json.loads(message).get("max_text_len"))

    layers_config = json.loads(message).get("models")

    batch_size = int(json.loads(message).get("batch_size"))  # 64
    epochs = int(json.loads(message).get("epochs"))  # 2

    df = pd.DataFrame(data)
    df[text] = df[text].apply(cleanText)
    df[category] = pd.factorize(df[category])[0]

    # Pierwszy element krotki to zmapowane wartości numeryczne: [0, 1, 2, 0, 1].
    # Drugi element to indeks pandasowy Index(['A', 'B', 'C'], dtype='object'), który zawiera unikalne etykiety z kolumny 'category'.

    texts = df[text]
    labels = df[category]
    print(texts)
    tokenizer = Tokenizer(
        num_words=num_words
    )  # Przetwarzanie tekstu na sekwencję liczb
    tokenizer.fit_on_texts(texts)  # słownik słów
    print(tokenizer)
    sequences = tokenizer.texts_to_sequences(
        texts
    )  # konwersaja tekstu na sekwencje czasową

    X = pad_sequences(sequences, maxlen=max_text_len)  # stała wartośc sekwencji
    y = labels.copy()

    print(X)
    print(y)

    num_categories = df[category].nunique()
    print("Liczba kategorii:", num_categories)

    model = Sequential()
    model.add(Embedding(num_words, 64, input_length=max_text_len))

    for idx, config in enumerate(layers_config):
        units = int(config["units"])
        return_sequences = config["returnSequences"]

        layer_mapping = {"GRU": GRU, "LSTM": LSTM, "RNN": SimpleRNN}

        layer_type = layer_mapping.get(config["layers"])

        model.add(layer_type(units, return_sequences=return_sequences))

    """
    model.add(LSTM(3, return_sequences=True))
    model.add(LSTM(5, return_sequences=True))
    model.add(BatchNormalization())
    model.add(LSTM(12))
    """
    model.add(Dense(1, activation="sigmoid"))
    # model.add(Dense(num_categories, activation="softmax"))

    print(model.summary())

    class EpochLogger(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            epoch_info = {
                "epoch": epoch,
                "loss": logs["loss"],
                "accuracy": logs["Accuracy"],
            }
            emit("epoch_update/text_classification", json.dumps(epoch_info))

    model.compile(metrics=["Accuracy"], loss="binary_crossentropy", optimizer="Adam")

    model.fit(
        X,
        y,
        batch_size=batch_size,
        epochs=epochs,
        validation_split=0.2,
        callbacks=[EpochLogger()],
    )

    model_name = f"model_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    path_to_save = f"../files/models/{model_name}.keras"
    model.save(path_to_save)

    emit(
        "training_completed/text_classification",
        json.dumps(
            {
                "path": model_name,
                "num_words": num_words,
                "max_text_len": max_text_len,
                "texts": texts.tolist(),
            }
        ),
    )


@app.route("/evaluate/time_series", methods=["POST"])
def evaluate_time_series():
    request_data = request.get_json()
    path = request_data["path"]
    print(path)
    # y_test = request_data["y_test"]
    filter = request_data["filter"]
    data = request_data["y_test"]

    # path_to_save = "./model.keras"
    model = tf.keras.models.load_model(f"../files/models/{path}.keras")
    df = pd.DataFrame(data)
    # df = pd.read_csv("C:/Users/akuzm/OneDrive/Pulpit/praca/GOOG.csv")
    data = df[filter]

    dataTrainMax = request_data["data_max"]
    dataTrainMin = request_data["data_min"]

    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scalar_data_min_max = scaler.fit_transform([dataTrainMax, dataTrainMin])
    print(scalar_data_min_max)

    scaled_data = scaler.transform(dataset)
    scaled_data = scaled_data[1220:1258, :]  # do komentarza

    time_step = request_data["time_step"]  # to pasowało by dać do zmiennej
    x_test = []
    y_test = []
    for i in range(time_step, len(scaled_data)):
        x_test.append(scaled_data[i - time_step : i, :])
        y_test.append(scaled_data[i, :])

    x_test, y_test = np.array(x_test), np.array(y_test)
    print(x_test)
    predictions = model.predict(x_test)
    print(predictions)
    print(y_test)
    predictions = scaler.inverse_transform(predictions)
    y_test = scaler.inverse_transform(y_test)
    results = []

    def calculate_errors(y_true, y_pred):
        absolute_errors = np.abs(y_pred - y_true)
        mean_absolute_error = np.mean(absolute_errors)
        mean_squared_error = metrics.mean_squared_error(y_true, y_pred)
        root_mean_squared_error = np.sqrt(mean_squared_error)
        r2_score = metrics.r2_score(y_true, y_pred)
        mean_percentage_error = np.mean((absolute_errors / np.abs(y_true)) * 100)

        return {
            "mean_absolute_error": mean_absolute_error,
            "mean_squared_error": mean_squared_error,
            "root_mean_squared_error": root_mean_squared_error,
            "r2_score": r2_score,
            "mean_percentage_error": mean_percentage_error,
        }

    for idx, feature_name in enumerate(filter):
        errors = calculate_errors(y_test[:, idx], predictions[:, idx])
        result = {
            "feature": feature_name,
            "y_test": y_test[:, idx].tolist(),
            "predictions": predictions[:, idx].tolist(),
            "mean_absolute_error": errors["mean_absolute_error"],
            "mean_squared_error": errors["mean_squared_error"],
            "root_mean_squared_error": errors["root_mean_squared_error"],
            "r2_score": errors["r2_score"],
            "mean_percentage_error": errors["mean_percentage_error"],
        }
        results.append(result)

    return jsonify(
        {
            "predictions": predictions.tolist(),
            "actual_values": y_test.tolist(),
            "results": results,
        }
    )


@app.route("/predict/time_series", methods=["POST"])
def predict_time_series():
    request_data = request.get_json()
    path = request_data["path"]
    filter = request_data["filter"]
    data = request_data["y_test"]
    model = tf.keras.models.load_model(f"../files/models/{path}.keras")
    df = pd.DataFrame(data)
    data = df[filter]

    dataTrainMax = request_data["data_max"]
    dataTrainMin = request_data["data_min"]

    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scalar_data_min_max = scaler.fit_transform([dataTrainMax, dataTrainMin])
    print(scalar_data_min_max)

    time_step = request_data["time_step"]
    scaled_data = scaler.transform(dataset)
    scaled_data = scaled_data[-time_step:, :]  # do komentarza

    # to pasowało by dać do zmiennej
    next_time_steps = 10
    predictions = []
    current_data = []
    current_data.append(scaled_data)
    current_data = np.array(current_data)
    print(current_data)
    for _ in range(next_time_steps):
        prediction = model.predict(current_data)
        predictions.append(prediction[0])
        # Aktualizacja danych wejściowych dla kolejnego kroku czasowego
        current_data = np.roll(current_data, -1, axis=1)
        current_data[0, -1, :] = prediction[0]
        print("---")
        print(current_data)

    predictions = scaler.inverse_transform(predictions)
    results = []
    for idx, feature_name in enumerate(filter):
        result = {"feature": feature_name, "predictions": predictions[:, idx].tolist()}
        results.append(result)

    return jsonify(
        {
            "results": results,
        },
    )


if __name__ == "__main__":
    socketio.run(app, debug=False)
