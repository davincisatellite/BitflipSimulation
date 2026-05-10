let uploadedImage = null;
let headerString = null;
let currentBytes = null;
let destroyTimer = null;
let isDestroying = false;

function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

function _arrayToBase64(bytes) {
    let binary = "";
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function toggleBit(number, bitPosition) {
    const mask = 1 << bitPosition;
    return number ^ mask;
}

function updateDisplayedImage() {
    if (!currentBytes || !headerString) return;
    const toBase = _arrayToBase64(currentBytes);
    const finalImage = headerString.concat(",", toBase);

    const img = document.querySelector("#display_image img.thumbnail");
    if (img) {
        img.src = finalImage;
        return;
    }

    const output = document.querySelector("#display_image");
    const div = document.createElement("div");
    div.innerHTML = `<img class="thumbnail" src="${finalImage}" title="${uploadedImage ? uploadedImage.name : ""}"/>`;
    output.innerHTML = "";
    output.appendChild(div);
}

function flipSingle() {
    if (!currentBytes) return;
    const loc = Math.floor(Math.random() * currentBytes.length);
    const base_byte = currentBytes[loc];
    const new_byte = toggleBit(base_byte, Math.floor(Math.random() * 8));
    currentBytes[loc] = new_byte;
    updateDisplayedImage();
}

function toggleDestroy() {
    if (isDestroying) stopDestroy();
    else startDestroy();
}

function startDestroy() {
    const intervalSec =
        Number(document.querySelector("#interval_input").value) || 1;
    const intervalMs = Math.max(100, Math.floor(intervalSec * 1000));
    if (!currentBytes && uploadedImage && uploadedImage.result) {
        const image_split = uploadedImage.result.split(",");
        headerString = image_split[0];
        currentBytes = _base64ToArrayBuffer(image_split[1]);
    }
    if (!currentBytes) return;
    if (destroyTimer) clearInterval(destroyTimer);
    destroyTimer = setInterval(flipSingle, intervalMs);
    isDestroying = true;
    const btn = document.querySelector("#destroy_toggle");
    if (btn) btn.textContent = "Stop destroying";
}

function stopDestroy() {
    if (destroyTimer) clearInterval(destroyTimer);
    destroyTimer = null;
    isDestroying = false;
    const btn = document.querySelector("#destroy_toggle");
    if (btn) btn.textContent = "Start destroying";
}

function inputListener(e) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        const file = e.target.files;
        const output = document.querySelector("#display_image");

        if (!file[0].type.match("image")) return;

        const picReader = new FileReader();
        picReader.addEventListener("load", function (event) {
            const picFile = event.target;
            uploadedImage = picFile;
            // initialize current bytes and header for incremental flipping
            const image_split = picFile.result.split(",");
            headerString = image_split[0];
            currentBytes = _base64ToArrayBuffer(image_split[1]);

            // stop any ongoing destroy timer
            stopDestroy();

            const div = document.createElement("div");
            div.innerHTML = `<img class="thumbnail" src="${picFile.result}" title="${picFile.name}"/>`;

            output.innerHTML = "";
            output.appendChild(div);
        });
        picReader.readAsDataURL(file[0]);
    } else {
        alert("Your browser does not support the file API");
    }
}
