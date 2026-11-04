from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Load trained model
model = load_model("models/cnn_model.h5")

# Create test data generator
test_datagen = ImageDataGenerator(rescale=1./255)

# Load test images
test_generator = test_datagen.flow_from_directory(
    "dataset/Testing",
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False
)

# Evaluate model
loss, accuracy = model.evaluate(test_generator)

print("\nTest Accuracy:", accuracy * 100, "%")
print("Test Loss:", loss)