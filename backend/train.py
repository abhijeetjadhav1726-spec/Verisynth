import os
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
from utils.model_builder import DeepfakeModel

def plot_metrics(history, save_path="models/training_history.png"):
    """
    Plots accuracy and loss curves and saves them to a file.
    """
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy plot
    axes[0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0].plot(history.history['val_accuracy'], label='Val Accuracy')
    axes[0].set_title('Model Accuracy')
    axes[0].set_ylabel('Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].legend()
    
    # Loss plot
    axes[1].plot(history.history['loss'], label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Val Loss')
    axes[1].set_title('Model Loss')
    axes[1].set_ylabel('Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].legend()
    
    plt.savefig(save_path)
    print(f"Metrics plot saved to {save_path}")

def plot_confusion_matrix(y_true, y_pred, save_path="models/confusion_matrix.png"):
    """
    Plots a confusion matrix and saves it to a file.
    """
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Real', 'Fake'], yticklabels=['Real', 'Fake'])
    plt.title("Confusion Matrix")
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.savefig(save_path)
    print(f"Confusion Matrix saved to {save_path}")

def train_pipeline(data_dir: str, model_save_path: str = "models/deepfake_model.h5"):
    """
    Full pipeline to load data, build model, train, and evaluate.
    """
    batch_size = 32
    img_height, img_width = 224, 224
    
    print("Loading datasets...")
    # TensorFlow optimized dataset loader
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )
    
    class_names = train_ds.class_names
    print(f"Class names found: {class_names}") # E.g., ['fake', 'real'] -> Usually alphabetical
    
    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Data Augmentation layer to prevent overfitting
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.1),
        tf.keras.layers.RandomZoom(0.1),
    ])

    print("Building model...")
    builder = DeepfakeModel(input_shape=(img_height, img_width, 3))
    # You can switch this to builder.build_custom_cnn() if desired.
    base_model = builder.build_transfer_model(fine_tune=False)
    
    # Combine augmentation, preprocessing (MobileNetV2 expects [-1, 1]), and base model
    inputs = tf.keras.Input(shape=(img_height, img_width, 3))
    x = data_augmentation(inputs)
    # Note: tf.keras.applications.mobilenet_v2.preprocess_input scales to [-1, 1]
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    outputs = base_model(x)
    
    model = tf.keras.Model(inputs, outputs)
    model = builder.compile_model(model, learning_rate=1e-4)

    # Callbacks
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    checkpointer = tf.keras.callbacks.ModelCheckpoint(
        filepath=model_save_path, 
        monitor='val_accuracy', 
        verbose=1, 
        save_best_only=True
    )
    early_stopper = tf.keras.callbacks.EarlyStopping(
        monitor='val_loss', 
        patience=5, 
        restore_best_weights=True
    )

    print("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=20,
        callbacks=[checkpointer, early_stopper]
    )

    # Evaluation
    print("Evaluating model...")
    plot_metrics(history)
    
    # Generate predictions for confusion matrix
    y_true = []
    y_pred = []
    for images, labels in val_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend((preds > 0.5).astype(int).flatten())
        
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    plot_confusion_matrix(y_true, y_pred)
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))

if __name__ == "__main__":
    # Assumes processed faces are inside 'processed_dataset'
    # Organized as: processed_dataset/real/ and processed_dataset/fake/
    train_pipeline("processed_dataset")
