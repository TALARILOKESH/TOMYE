let model;

// ===============================
// Load TensorFlow.js model
// ===============================
async function loadModel() {

    await tf.setBackend("webgl");

    model = await tf.loadLayersModel("/model/model.json");

    console.log("TensorFlow Model Loaded");
}

loadModel();


// ===============================
// Wake Render Server
// ===============================
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


// ===============================
// Main Processing Function
// ===============================
async function processImage() {

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {

        alert("Please upload image");

        return;

    }

    // Preview image
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);

    // Prepare request
    const formData = new FormData();
    formData.append("image", file);

    document.getElementById("result").innerText = "Processing...";

    try {

        const response = await fetch(
            "https://new-one-0sbx.onrender.com/detect",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            throw new Error("Server error");

        }

        // Receive processed image
        const blob = await response.blob();

        const resultURL = URL.createObjectURL(blob);

        const resultImage = document.getElementById("resultImage");

        resultImage.src = resultURL;

        document.getElementById("result").innerText =
            "Detection Complete ✅";

        // After image loads run classification
        resultImage.onload = async function () {

            classifyImage(resultImage);

        };

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText =
            "Server Error ❌";

    }
}


// ===============================
// EfficientNet Classification
// ===============================
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