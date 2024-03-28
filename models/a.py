from keras_preprocessing.text import Tokenizer
from keras_preprocessing.sequence import pad_sequences
import pandas as pd


df = pd.DataFrame(
    [
        {
            "Message": "Go until jurong point, crazy.. Available only in bugis n great world la e buffet... Cine there got amore wat...",
        },
        {"Message": "Ok lar... Joking wif u oni..."},
    ]
)

texts = df["Message"]

tokenizer = Tokenizer(num_words=5)
# oov_token="<OOV>"oov_token="<OOV>"# Przetwarzanie tekstu na sekwencję liczb
tokenizer.fit_on_texts(texts)  # słownik słów
print(tokenizer)
sequences = tokenizer.texts_to_sequences(
    texts
)  # konwersaja tekstu na sekwencje czasową

print(sequences)

df = pd.DataFrame(
    [
        {
            "Message": "KKKKK until jurong point, crazy.. Available only in bugis n great world la e buffet... Cine there got amore wat...",
        },
        {"Message": "Ok lar... Joking wif u oni..."},
    ]
)

texts = df["Message"]

print(tokenizer)
sequences = tokenizer.texts_to_sequences(texts)
print(sequences)
