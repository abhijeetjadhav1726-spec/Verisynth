import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.applications import MobileNetV2

class DeepfakeModel:
    def __init__(self, input_shape=(224, 224, 3)):
        self.input_shape = input_shape

    def build_custom_cnn(self) -> Model:
        """
        Builds a custom standard CNN architecture for generic Deepfake classification.
        """
        model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=self.input_shape),
            MaxPooling2D(pool_size=(2, 2)),
            
            Conv2D(64, (3, 3), activation='relu'),
            MaxPooling2D(pool_size=(2, 2)),
            
            Conv2D(128, (3, 3), activation='relu'),
            MaxPooling2D(pool_size=(2, 2)),
            
            Conv2D(256, (3, 3), activation='relu'),
            MaxPooling2D(pool_size=(2, 2)),
            
            Flatten(),
            Dense(512, activation='relu'),
            Dropout(0.5), # Regularization
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(1, activation='sigmoid') # Binary classification (Real: 0 / Fake: 1)
        ])
        
        return model

    def build_transfer_model(self, fine_tune: bool = False) -> Model:
        """
        Builds a high-accuracy transfer learning model using MobileNetV2.
        
        Args:
            fine_tune (bool): If true, unfreezes top layers of the base model for fine-tuning.
        """
        # Load pre-trained weights from ImageNet, excluding the top dense layers
        base_model = MobileNetV2(
            weights='imagenet', 
            include_top=False, 
            input_shape=self.input_shape
        )
        
        # Freeze base model
        base_model.trainable = fine_tune
        
        # Add custom head
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(512, activation='relu')(x)
        x = Dropout(0.4)(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.3)(x)
        predictions = Dense(1, activation='sigmoid')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        return model

    def compile_model(self, model: Model, learning_rate: float = 1e-4):
        """
        Compiles the model with standard optimizer, loss, and metrics needed for evaluation.
        """
        optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        loss = tf.keras.losses.BinaryCrossentropy()
        
        model.compile(
            optimizer=optimizer,
            loss=loss,
            metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
        )
        return model

if __name__ == "__main__":
    # Test model builds
    builder = DeepfakeModel()
    cnn = builder.build_custom_cnn()
    cnn.summary()
