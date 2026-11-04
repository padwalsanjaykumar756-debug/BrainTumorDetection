from transformers import (
    ViTForImageClassification,
    ViTImageProcessor,
    TrainingArguments,
    Trainer
)
from datasets import load_dataset
import numpy as np
import evaluate

# ----------------------------
# Load Dataset
# ----------------------------
dataset = load_dataset("imagefolder", data_dir="dataset")

# Create train/test split (80% train, 20% test)
dataset = dataset["train"].train_test_split(test_size=0.2)

# ----------------------------
# Load ViT Processor
# ----------------------------
processor = ViTImageProcessor.from_pretrained(
    "google/vit-base-patch16-224"
)

# ----------------------------
# Preprocessing Function
# ----------------------------
def preprocess(example):
    image = example["image"].convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    example["pixel_values"] = inputs["pixel_values"][0]
    return example

# Apply preprocessing
dataset = dataset.map(preprocess)

# ----------------------------
# Set format
# ----------------------------
dataset.set_format(
    type="torch",
    columns=["pixel_values", "label"]
)

# ----------------------------
# Load ViT Model
# ----------------------------
model = ViTForImageClassification.from_pretrained(
    "google/vit-base-patch16-224",
    num_labels=4,
    ignore_mismatched_sizes=True
)

# ----------------------------
# Accuracy Metric
# ----------------------------
accuracy_metric = evaluate.load("accuracy")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)
    return accuracy_metric.compute(
        predictions=predictions,
        references=labels
    )

# ----------------------------
# Training Arguments
# ----------------------------
training_args = TrainingArguments(
    output_dir="./vit_results",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=5,
    weight_decay=0.01,
    logging_dir="./logs"
)

# ----------------------------
# Trainer
# ----------------------------
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    compute_metrics=compute_metrics
)

# ----------------------------
# Train Model
# ----------------------------
trainer.train()

# ----------------------------
# Save Model
# ----------------------------
model.save_pretrained("vit_model_saved")
processor.save_pretrained("vit_model_saved")

print("ViT model training completed successfully!")