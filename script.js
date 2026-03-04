let model;

// Load TensorFlow.js model
async function loadModel() {
    await tf.setBackend('webgl');
    model = await tf.loadLayersModel('/model/model.json');
    console.log("Model Loaded");
}

loadModel();

// Main function
async function processImage() {

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload image");
        return;
    }

    // Show preview
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);

    // Send to YOLO backend
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://new-one-0sbx.onrender.com/", {
        method: "POST",
        body: formData
    });

    const yoloResult = await response.json();
    console.log("YOLO Result:", yoloResult);

    // Wait image to load fully before classification
    preview.onload = async function () {
        classifyImage(preview);
    };
}

// EfficientNet Classification
async function classifyImage(imageElement) {

    const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();

    const prediction = model.predict(tensor);
    const classIndex = prediction.argMax(1).dataSync()[0];

    document.getElementById("classificationResult").innerText =
        "Predicted Class Index: " + classIndex;
}
async function wakeServer() {
    try {
        await fetch("https://new-one-0sbx.onrender.com/");
        console.log("Server waking up...");
    } catch (err) {
        console.log("Wake attempt failed");
    }
}

window.onload = function () {
    wakeServer();
};