let model;

// ============================
// Load TensorFlow Model
// ============================
async function loadModel() {
    try {
        await tf.setBackend("webgl");
        model = await tf.loadLayersModel("/model/model.json");
        console.log("TensorFlow model loaded");
    } catch (error) {
        console.log("TensorFlow model optional, not loaded");
    }
}

loadModel();


// ============================
// Wake Render Server
// ============================
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


// ============================
// Process Image
// ============================
async function processImage() {

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload image first");
        return;
    }

    // Show preview
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);

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

        const imageURL = URL.createObjectURL(blob);

        const resultImage = document.getElementById("resultImage");

        // IMPORTANT: force refresh image
        resultImage.src = "";
        resultImage.src = imageURL;

        resultImage.style.display = "block";

        document.getElementById("result").innerText =
            "Detection Complete ✅";

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText =
            "Server Error ❌";
    }
}