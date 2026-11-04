from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename
import torch
import os
import time
import uuid

# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)
CORS(app)

# Maximum uploaded image size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Model folder is in the main BrainTumorProject directory
MODEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "vit_model_saved")
)

# Uploaded images are stored inside backend/uploads
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# IMPORTANT: Correct syntax
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================================================
# DEVICE
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("=" * 60)
print("BRAIN TUMOR AI BACKEND")
print("=" * 60)
print("Backend directory:", BASE_DIR)
print("Model directory:", MODEL_PATH)
print("Upload directory:", UPLOAD_FOLDER)
print("Device:", DEVICE)

# =========================================================
# CHECK MODEL DIRECTORY
# =========================================================

if not os.path.isdir(MODEL_PATH):
    raise FileNotFoundError(
        f"Model folder not found: {MODEL_PATH}\n"
        "Make sure vit_model_saved exists in the main project folder."
    )

# =========================================================
# LOAD VISION TRANSFORMER MODEL
# =========================================================

print("\nLoading Vision Transformer model...")

model_start_time = time.time()

processor = ViTImageProcessor.from_pretrained(MODEL_PATH)

model = ViTForImageClassification.from_pretrained(MODEL_PATH)

model.to(DEVICE)
model.eval()

model_load_time = time.time() - model_start_time

print(f"Model loaded successfully in {model_load_time:.2f} seconds.")

# =========================================================
# CLASS LABELS
# =========================================================

# These labels must match the order used during model training.
classes = [
    "glioma",
    "meningioma",
    "notumor",
    "pituitary"
]

display_names = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "No Tumor",
    "pituitary": "Pituitary Tumor"
}

# Check that the model has four output classes.
if model.config.num_labels != len(classes):
    raise ValueError(
        f"Model has {model.config.num_labels} output classes, "
        f"but {len(classes)} class labels were configured. "
        "Check the labels used during training."
    )

# =========================================================
# HOME ROUTE
# =========================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "status": "online",
        "message": "Brain Tumor AI Detection API is running.",
        "model": "Vision Transformer (ViT)",
        "device": str(DEVICE),
        "classes": classes
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "model_loaded": True,
        "device": str(DEVICE)
    })


# =========================================================
# PREDICTION ROUTE
# =========================================================

@app.route("/predict", methods=["POST"])
def predict():

    request_start_time = time.time()

    try:
        print("\n" + "=" * 60)
        print("NEW MRI PREDICTION REQUEST")
        print("=" * 60)

        # -------------------------------------------------
        # CHECK IMAGE UPLOAD
        # -------------------------------------------------

        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image uploaded. Use the field name 'image'."
            }), 400

        file = request.files["image"]

        if not file.filename:
            return jsonify({
                "success": False,
                "error": "Please select an image."
            }), 400

        # -------------------------------------------------
        # CHECK FILE EXTENSION
        # -------------------------------------------------

        filename = secure_filename(file.filename)

        if not filename or "." not in filename:
            return jsonify({
                "success": False,
                "error": "Invalid image filename."
            }), 400

        extension = filename.rsplit(".", 1)[1].lower()

        allowed_extensions = {"jpg", "jpeg", "png", "bmp", "webp"}

        if extension not in allowed_extensions:
            return jsonify({
                "success": False,
                "error": "Upload a JPG, JPEG, PNG, BMP, or WEBP image."
            }), 400

        # -------------------------------------------------
        # SAVE IMAGE
        # -------------------------------------------------

        unique_filename = f"{uuid.uuid4().hex}.{extension}"

        filepath = os.path.join(
            UPLOAD_FOLDER,
            unique_filename
        )

        file.save(filepath)

        print("Image saved:", unique_filename)

        # -------------------------------------------------
        # OPEN IMAGE
        # -------------------------------------------------

        try:
            with Image.open(filepath) as uploaded_image:
                image = uploaded_image.convert("RGB")

        except (UnidentifiedImageError, OSError):
            return jsonify({
                "success": False,
                "error": "The uploaded file is not a valid image."
            }), 400

        print("Image size:", image.size)

        # -------------------------------------------------
        # PREPROCESS IMAGE
        # -------------------------------------------------

        inputs = processor(
            images=image,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(DEVICE)
            for key, value in inputs.items()
        }

        # -------------------------------------------------
        # MODEL PREDICTION
        # -------------------------------------------------

        inference_start = time.time()

        with torch.no_grad():
            outputs = model(**inputs)

        inference_time = time.time() - inference_start

        # -------------------------------------------------
        # CALCULATE PROBABILITIES
        # -------------------------------------------------

        probabilities_tensor = torch.nn.functional.softmax(
            outputs.logits,
            dim=1
        )

        predicted_class = torch.argmax(
            probabilities_tensor,
            dim=1
        ).item()

        prediction = classes[predicted_class]

        confidence = (
            probabilities_tensor[0, predicted_class].item() * 100
        )

        # -------------------------------------------------
        # ALL CLASS PROBABILITIES
        # -------------------------------------------------

        probabilities = {}

        for index, label in enumerate(classes):
            display_name = display_names[label]

            probabilities[display_name] = round(
                probabilities_tensor[0, index].item() * 100,
                2
            )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        total_time = time.time() - request_start_time

        response = {
            "success": True,
            "prediction": prediction,
            "prediction_display": display_names[prediction],
            "confidence": round(confidence, 2),
            "probabilities": probabilities,
            "inference_time": round(inference_time, 2),
            "total_time": round(total_time, 2)
        }

        print("\nPREDICTION COMPLETE")
        print("Prediction:", display_names[prediction])
        print("Model confidence:", round(confidence, 2), "%")
        print("Inference time:", round(inference_time, 2), "seconds")
        print("=" * 60)

        return jsonify(response), 200

    except Exception as error:
        print("\nPREDICTION ERROR:", str(error))

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# HANDLE LARGE FILES
# =========================================================

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "error": "Image is too large. Maximum size is 10 MB."
    }), 413


# =========================================================
# RUN FLASK SERVER
# =========================================================

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("STARTING BRAIN TUMOR AI BACKEND")
    print("=" * 60)
    print("Home:   http://127.0.0.1:5000/")
    print("Health: http://127.0.0.1:5000/health")
    print("Predict: http://127.0.0.1:5000/predict")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        threaded=True
    )