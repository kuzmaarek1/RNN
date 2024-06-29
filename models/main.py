from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import confusion_matrix, classification_report
import json
from bs4 import BeautifulSoup
import re

# from tensorflow.keras_preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.sequence import pad_sequences

# from tensorflow.keras_preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.utils import to_categorical
import tensorflow as tf
from sklearn import metrics
import uuid
import time
from tensorflow.keras.layers import (
    Embedding,
    Dense,
    LSTM,
    GRU,
    SimpleRNN,
    Bidirectional,
    ConvLSTM2D,
    Flatten,
    RepeatVector,
)

app = Flask(__name__)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    max_http_buffer_size=1e8,
    max_websocket_data_size=1e8,
)
CORS(app)


@socketio.on("train/time_series")
def train_model_time_series(message):
    data = json.loads(message).get("dataset")
    filter = json.loads(message).get("y_feauture")
    layers_config = json.loads(message).get("models")

    time_step = int(json.loads(message).get("time_step"))
    batch_size = int(json.loads(message).get("batch_size"))
    epochs = int(json.loads(message).get("epochs"))
    forecast_steps = int(json.loads(message).get("forecast_steps"))
    df = pd.DataFrame(data)
    data = df[filter]
    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(dataset)

    x_train = []
    y_train = []

    for i in range(time_step, len(scaled_data) - forecast_steps + 1):
        x_train.append(scaled_data[i - time_step : i, :])
        y_train.append(scaled_data[i : i + forecast_steps, :])

    x_train, y_train = np.array(x_train), np.array(y_train)

    split_index = int(len(x_train) * 0.8)
    x_train, x_val = x_train[:split_index], x_train[split_index:]
    y_train, y_val = y_train[:split_index], y_train[split_index:]

    y_train = y_train.reshape(y_train.shape[0], -1)
    y_val = y_val.reshape(y_val.shape[0], -1)

    is_convLSTM2D = False
    model = Sequential()

    for idx, config in enumerate(layers_config):
        units = int(config["units"])
        return_sequences = config["returnSequences"]

        layer_mapping = {
            "GRU": GRU,
            "LSTM": LSTM,
            "RNN": SimpleRNN,
            "ConvLSTM2D": ConvLSTM2D,
            "Dense": Dense,
        }

        layer_type = layer_mapping.get(config["layers"])

        if config["layers"] == "Dense":
            if idx == 0:
                model.add(Flatten())
            layer = Dense(units)

        elif config["layers"] != "ConvLSTM2D":
            layer = layer_type(
                units,
                return_sequences=return_sequences,
            )
            if idx == 0:
                layer = layer_type(
                    units,
                    return_sequences=return_sequences,
                    input_shape=(x_train.shape[1], len(filter)),
                )

        else:
            is_convLSTM2D = True
            x_train = x_train.reshape((x_train.shape[0], time_step, 1, len(filter), 1))
            x_val = x_val.reshape((x_val.shape[0], time_step, 1, len(filter), 1))

            layer = layer_type(
                filters=units,
                padding="same",
                kernel_size=(1, len(filter)),
                return_sequences=return_sequences,
            )
            if idx == 0:
                layer = layer_type(
                    filters=units,
                    padding="same",
                    kernel_size=(1, len(filter)),
                    return_sequences=return_sequences,
                    input_shape=(time_step, 1, len(filter), 1),
                )

        if config["bidirectional"]:
            layer = Bidirectional(layer)

        model.add(layer)

    if is_convLSTM2D == True:
        model.add(Flatten())

    model.add(Dense(len(filter) * forecast_steps))

    class EpochLogger(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            epoch_info = {
                "epoch": epoch,
                "loss": logs["loss"],
                "val_loss": logs["val_loss"],
            }
            emit("epoch_update", json.dumps(epoch_info))

    model.compile(
        optimizer="adam", loss="mean_squared_error", metrics=["mean_absolute_error"]
    )

    history = model.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        batch_size=batch_size,
        epochs=epochs,
        callbacks=[EpochLogger()],
    )

    model_name = f"model_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    path_to_save = f"../files/models/{model_name}.keras"
    model.save(path_to_save)

    history_data = history.history
    serialized_history = {}
    for key, value in history_data.items():
        serialized_history[key] = [float(val) for val in value]

    emit(
        "training_completed",
        json.dumps(
            {
                "path": model_name,
                "history": serialized_history,
                "filter": filter,
                "time_step": time_step,
                "data_min": scaler.data_min_.tolist(),
                "data_max": scaler.data_max_.tolist(),
                "is_convLSTM2D": is_convLSTM2D,
                "forecast_steps": forecast_steps,
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

    batch_size = int(json.loads(message).get("batch_size"))
    epochs = int(json.loads(message).get("epochs"))

    df = pd.DataFrame(data)
    df[text] = df[text].apply(cleanText)
    category_to_number = pd.factorize(df[category])
    df[category] = category_to_number[0]
    texts = df[text]
    labels = df[category]
    texts = [str(text) for text in texts]
    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)

    X = pad_sequences(sequences, maxlen=max_text_len)
    y = to_categorical(labels.copy())
    split_index = int(len(X) * 0.8)
    X_train, X_val = X[:split_index], X[split_index:]
    y_train, y_val = y[:split_index], y[split_index:]

    num_categories = df[category].nunique()
    model = Sequential()
    model.add(Embedding(num_words, 64, input_length=max_text_len))

    for idx, config in enumerate(layers_config):
        units = int(config["units"])
        return_sequences = config["returnSequences"]

        layer_mapping = {
            "GRU": GRU,
            "LSTM": LSTM,
            "RNN": SimpleRNN,
            "Dense": Dense,
            "RepeatVector": RepeatVector,
        }
        layer_type = layer_mapping.get(config["layers"])

        if config["layers"] == "Dense":
            if idx == 0:
                model.add(Flatten())
            layer_type = Dense(units)
            model.add(layer_type)
        elif config["layers"] == "RepeatVector":
            model.add(RepeatVector(units))
        elif config["bidirectional"] == True:
            model.add(
                Bidirectional(layer_type(units, return_sequences=return_sequences))
            )
        else:
            model.add(layer_type(units, return_sequences=return_sequences))

    model.add(Dense(num_categories, activation="softmax"))

    class EpochLogger(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            epoch_info = {
                "epoch": epoch,
                "loss": logs["loss"],
                "accuracy": logs["Accuracy"],
                "val_loss": logs["val_loss"],
                "val_accuracy": logs["val_Accuracy"],
            }
            emit("epoch_update/text_classification", json.dumps(epoch_info))

    model.compile(metrics=["Accuracy"], loss="binary_crossentropy", optimizer="Adam")

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        batch_size=batch_size,
        epochs=epochs,
        callbacks=[EpochLogger()],
    )

    model_name = f"model_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    path_to_save = f"../files/models/{model_name}.keras"
    model.save(path_to_save)

    history_data = history.history
    serialized_history = {}
    for key, value in history_data.items():
        serialized_history[key] = [float(val) for val in value]

    emit(
        "training_completed/text_classification",
        json.dumps(
            {
                "path": model_name,
                "history": serialized_history,
                "num_words": num_words,
                "max_text_len": max_text_len,
                "category": category,
                "text": text,
                "texts": texts,
                "y_labels": category_to_number[1].tolist(),
            }
        ),
    )


@app.route("/evaluate/time_series", methods=["POST"])
def evaluate_time_series():
    request_data = request.get_json()
    path = request_data["path"]
    filter = request_data["filter"]
    data = request_data["y_test"]
    is_convLSTM2D = False
    if "is_convLSTM2D" in request_data:
        is_convLSTM2D = request_data["is_convLSTM2D"]

    model = tf.keras.models.load_model(f"../files/models/{path}.keras")
    df = pd.DataFrame(data)
    data = df[filter]

    dataTrainMax = request_data["data_max"]
    dataTrainMin = request_data["data_min"]

    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scalar_data_min_max = scaler.fit_transform([dataTrainMax, dataTrainMin])

    scaled_data = scaler.transform(dataset)
    time_step = request_data["time_step"]
    forecast_steps = request_data.get("forecast_steps", 1)

    x_test = []
    y_test = []

    for i in range(time_step, len(scaled_data) - forecast_steps + 1):
        x_test.append(scaled_data[i - time_step : i, :])
        y_test.append(scaler.inverse_transform(scaled_data[i : i + forecast_steps, :]))

    x_test, y_test = np.array(x_test), np.array(y_test)

    split_index = int(len(x_test) * 0.8)
    x_test = x_test[split_index:]
    y_test = y_test[split_index:]

    y_test = y_test.reshape(y_test.shape[0], -1)

    if is_convLSTM2D:
        x_test = x_test.reshape((x_test.shape[0], time_step, 1, len(filter), 1))

    predictions = model.predict(x_test)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scalar_data_min_max = scaler.fit_transform(
        [
            np.repeat([dataTrainMax], forecast_steps).flatten(),
            np.repeat([dataTrainMin], forecast_steps).flatten(),
        ]
    )
    predictions = scaler.inverse_transform(predictions)
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
        errors = calculate_errors(
            y_test[:, idx : idx + forecast_steps : forecast_steps].flatten(),
            predictions[:, idx : idx + forecast_steps : forecast_steps].flatten(),
        )

        result = {
            "feature": feature_name,
            "y_test": y_test[:, idx : idx + forecast_steps : forecast_steps]
            .flatten()
            .tolist(),
            "predictions": predictions[:, idx : idx + forecast_steps : forecast_steps]
            .flatten()
            .tolist(),
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
    is_convLSTM2D = False
    if "is_convLSTM2D" in request_data:
        is_convLSTM2D = request_data["is_convLSTM2D"]

    dataset = data.values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scalar_data_min_max = scaler.fit_transform([dataTrainMax, dataTrainMin])

    time_step = request_data["time_step"]
    scaled_data = scaler.transform(dataset)
    forecast_steps = request_data.get("forecast_steps", 1)
    x_test = []
    y_test = []

    for i in range(time_step, len(scaled_data) - forecast_steps + 1):
        x_test.append(scaled_data[i - time_step : i, :])
        y_test.append(scaler.inverse_transform(scaled_data[i : i + forecast_steps, :]))

    x_test, y_test = np.array(x_test), np.array(y_test)
    split_index = int(len(x_test) * 0.8)
    scaled_data = x_test[split_index:]
    y_test = y_test.reshape(y_test.shape[0], -1)
    next_time_steps = int(request_data["next_time_steps"])
    predictions = []
    current_data = []
    current_data.append(scaled_data[0])
    current_data = np.array(current_data)
    if is_convLSTM2D:
        current_data = current_data.reshape(
            (current_data.shape[0], time_step, 1, len(filter), 1)
        )
    predictions = [[0] * len(filter) for _ in range(forecast_steps * next_time_steps)]
    for i in range(next_time_steps):
        prediction = model.predict(current_data)
        for idx, feature_name in enumerate(filter):
            for j in range(forecast_steps):
                predictions[i * forecast_steps + j][idx] = prediction[
                    0, idx * forecast_steps + j
                ]
                current_data = np.roll(current_data, -1, axis=1)
                if is_convLSTM2D:
                    prediction = np.expand_dims(prediction, axis=1)
                    current_data[:, -1, :, :, :] = np.expand_dims(prediction, axis=-1)
                else:
                    current_data[:, -1, idx] = predictions[i * forecast_steps + j][idx]

    predictions = scaler.inverse_transform(predictions)
    results = []
    for idx, feature_name in enumerate(filter):
        result = {"feature": feature_name, "predictions": predictions[:, idx].tolist()}
        results.append(result)

    scaled_dataset = scaler.transform(dataset)
    start_index = None
    for idx in range(len(scaled_dataset)):
        if np.array_equal(
            scaled_dataset[idx : idx + len(scaled_data[0])], scaled_data[0]
        ):
            start_index = idx + len(scaled_data[0]) + 1
            break

    return jsonify(
        {
            "results": results,
            "split_index": start_index,
        },
    )


@app.route("/predict/text_classification", methods=["POST"])
def predict_text_classification():
    request_data = request.get_json()
    path = request_data["path"]
    num_words = request_data["num_words"]
    max_text_len = request_data["max_text_len"]
    texts = request_data["texts"]
    text_predict = cleanText(request_data["text_predict"])
    y_labels = request_data["y_labels"]
    model = tf.keras.models.load_model(f"../files/models/{path}.keras")
    texts = [str(text) for text in texts]
    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences([text_predict])
    X = pad_sequences(sequences, maxlen=max_text_len)
    y_pred = model.predict(X)
    results = y_labels[np.argmax(y_pred, axis=1)[0]]

    return jsonify(
        {
            "results": results,
        },
    )


@app.route("/evaluate/text_classification", methods=["POST"])
def evaluate_text_classification():
    request_data = request.get_json()
    path = request_data["path"]
    num_words = request_data["num_words"]
    max_text_len = request_data["max_text_len"]
    texts = request_data["texts"]
    y_labels = request_data["y_labels"]
    data = request_data["dataset"]
    category = request_data["category"]
    text = request_data["text"]
    df = pd.DataFrame(data)
    df[text] = df[text].astype(str)
    df[category] = df[category].astype(str)
    df[text] = df[text].apply(cleanText)

    model = tf.keras.models.load_model(f"../files/models/{path}.keras")
    texts = [str(text) for text in texts]
    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(texts)
    texts = df[text]
    category_mapping = {v: i for i, v in enumerate(y_labels)}
    df[category] = df[category].map(category_mapping)
    y_true = df[category].to_numpy()
    sequences = tokenizer.texts_to_sequences(texts)
    X = pad_sequences(sequences, maxlen=max_text_len)

    split_index = int(len(X) * 0.8)
    X = X[split_index:]
    y_true = y_true[split_index:]
    y_pred = model.predict(X)
    predicted_classes = np.argmax(y_pred, axis=1)
    category_mapping = {i: v for i, v in enumerate(y_labels)}
    y_true_categories = [category_mapping[label] for label in y_true]
    y_pred_categories = [category_mapping[label] for label in predicted_classes]
    cm = confusion_matrix(y_true_categories, y_pred_categories, labels=y_labels)
    report = classification_report(
        y_true_categories, y_pred_categories, labels=y_labels, output_dict=True
    )

    return jsonify(
        {
            "labels": y_labels,
            "confusion_matrix": cm.tolist(),
            "report": report,
        },
    )


if __name__ == "__main__":
    socketio.run(app, debug=False, allow_unsafe_werkzeug=True)
