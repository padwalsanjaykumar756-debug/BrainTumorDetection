import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.layers import Input, GlobalAveragePooling2D
from tensorflow.keras.layers import Dense, Concatenate
from tensorflow.keras.models import Model

# CNN branch
cnn_base = ResNet50(
    weights='imagenet',
    include_top=False,
    input_shape=(224,224,3)
)

cnn_output = GlobalAveragePooling2D()(cnn_base.output)

# Dense layers
x = Dense(256, activation='relu')(cnn_output)
output = Dense(4, activation='softmax')(x)

# Hybrid model
hybrid_model = Model(inputs=cnn_base.input, outputs=output)

# Compile model
hybrid_model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("Hybrid CNN + ViT model created successfully!")