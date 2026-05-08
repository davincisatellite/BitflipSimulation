// const image_input = document.querySelector("#image_input");
let uploaded_image = null;

function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

function _arrayToBase64( bytes ) {
    let binary = '';
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function toggleBit(number, bitPosition) {
    const mask = 1 << bitPosition;
    return number ^ mask;
}

function flipImage() {
    const output = document.querySelector("#display_image");
    const flips = Number(document.querySelector("#number_input").value);

    const image_split = uploaded_image.result.split(",");
    let header = image_split[0];
    let data = image_split[1];
    let data_bytes = _base64ToArrayBuffer(data)
    for (let i = 0; i < flips; i++) {
        const loc = Math.floor(Math.random() * data_bytes.length);
        const base_byte = data_bytes[loc];
        const new_byte = toggleBit(base_byte, Math.floor(Math.random() * 8));
        data_bytes[loc] = new_byte;
    }

    const toBase = _arrayToBase64(data_bytes);
    const finalImage = header.concat(",",toBase)

    // console.log(header);
    // console.log(data)

    const div = document.createElement("div");
    div.innerHTML = `<img class="thumbnail" src="${finalImage}" title="${uploaded_image.name}"/>`;
    if (output.children.length > 1) {
        output.removeChild(output.lastChild);
    }

    output.appendChild(div);
}

function inputListener(e) {
    if(window.File && window.FileReader && window.FileList && window.Blob) {
        const file = e.target.files;
        const output = document.querySelector("#display_image");

        if (!file[0].type.match("image")) return;

        const picReader = new FileReader();
        picReader.addEventListener("load", function(event) {
            const picFile = event.target;
            uploaded_image = picFile;
            const div = document.createElement("div");
            div.innerHTML = `<img class="thumbnail" src="${picFile.result}" title="${picFile.name}"/>`;

            output.innerHTML = '';
            output.appendChild(div);

        })
        picReader.readAsDataURL(file[0]);

    } else {
        alert("Your browser does not support the file API")
    }
}

// image_input.addEventListener("change", inputListener)

