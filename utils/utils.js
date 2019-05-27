var socket;
let loaded = [];
let image_pos = -1;

function init() {
    socket = io();

    socket.on('image', function(msg) {
        load_img(msg);
        loaded.push(msg);
        image_pos += 1;
    });
}

function load_perv() {
    if (image_pos > 0) {
        image_pos -= 1;
        load_img(loaded[image_pos]);
    }
}

function load_next() {
    if (image_pos === loaded.length - 1) {
        socket.emit("next_image");
    } else {
        image_pos += 1;
        load_img(loaded[image_pos]);
    }
}

function load_img(img_id) {
    document.getElementById("img_view").src = "https://img.pr0gramm.com/" + img_id;
    console.log("https://img.pr0gramm.com/" + img_id);
}
