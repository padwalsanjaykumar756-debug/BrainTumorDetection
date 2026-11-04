from transformers import AutoImageProcessor, ViTForImageClassification

processor = AutoImageProcessor.from_pretrained(
    "google/vit-base-patch16-224"
)

model = ViTForImageClassification.from_pretrained(
    "google/vit-base-patch16-224",
    num_labels=4,
    ignore_mismatched_sizes=True
)

print("Vision Transformer loaded successfully!")