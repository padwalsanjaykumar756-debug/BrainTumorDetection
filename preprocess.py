from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Training data generator
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# Training images
train_generator = train_datagen.flow_from_directory(
    "dataset/Training",
    target_size=(224,224),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# Validation images
validation_generator = train_datagen.flow_from_directory(
    "dataset/Training",
    target_size=(224,224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

print("Preprocessing completed successfully!")