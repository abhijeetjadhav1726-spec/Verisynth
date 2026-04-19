import tensorflow as tf
from utils.model_builder import DeepfakeModel

builder = DeepfakeModel()
base_model = builder.build_transfer_model()
inputs = tf.keras.Input(shape=(224, 224, 3))
x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
outputs = base_model(x)
model = tf.keras.Model(inputs, outputs)

def print_layers(m, indent=''):
    for l in m.layers:
        print(f'{indent}{l.name} ({type(l).__name__})')
        if hasattr(l, 'layers'):
            print_layers(l, indent + '  ')

print_layers(model)
