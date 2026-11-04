from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Load model
model = load_model("models/cnn_model.h5")

# Class names
classes = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

# Load image
img = image.load_img(
    "test_images/test.jpg",
    target_size=(224, 224)
)

# Convert image to array
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0

# Predict
prediction = model.predict(img_array)

predicted_class = classes[np.argmax(prediction)]
confidence = np.max(prediction) * 100

print("Prediction:", predicted_class)
print("Confidence:", confidence, "%")