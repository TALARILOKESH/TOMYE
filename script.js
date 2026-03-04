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

    // ============================
    // FILE SIZE CHECK
    // ============================
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

    if (file.size > MAX_FILE_SIZE) {

        const proceed = confirm(
            "⚠️ The uploaded image is large and may cause server memory issues.\n\nDo you want to continue?"
        );

        if (!proceed) {
            return;
        }
    }

    // ============================
    // RESOLUTION CHECK
    // ============================
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async function () {

        const width = img.width;
        const height = img.height;

        if (Math.max(width, height) > 3000) {

            const proceed = confirm(
                `⚠️ Image resolution is very high (${width} x ${height}).\n\nThis may exceed server memory.\n\nProceed anyway?`
            );

            if (!proceed) {
                return;
            }
        }

        sendImageToServer(file);
    };

    img.src = url;
}


// ============================
// Send Image to Backend
// ============================
async function sendImageToServer(file) {

    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

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

        const blob = await response.blob();
        const imageURL = URL.createObjectURL(blob);

        const resultImage = document.getElementById("resultImage");

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