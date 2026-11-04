from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch

# Load model and processor
model = ViTForImageClassification.from_pretrained("vit_model_saved")
processor = ViTImageProcessor.from_pretrained("vit_model_saved")

# Load image
image = Image.open("test_image.jpg").convert("RGB")

# Preprocess image
inputs = processor(images=image, return_tensors="pt")

# Predict
with torch.no_grad():
    outputs = model(**inputs)

predicted_class = outputs.logits.argmax(-1).item()

classes = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

print("Prediction:", classes[predicted_class])