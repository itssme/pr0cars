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
    
    socket.on('info', function (msg) {
        JSON.parse(msg);
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
    if (img_id.endsWith(".mp4")) {
        let video_view = document.getElementById("video_view");
        let video_source = document.getElementById("video_source");
        video_view.pause();
        video_source.setAttribute('src', "https://vid.pr0gramm.com/" + img_id);
        video_view.load();
        video_view.play();
        document.getElementById("img_view").style.display = "none";
        document.getElementById("video_view").style.display = "block";
    } else {
        document.getElementById("video_view").pause();
        document.getElementById("img_view").src = "https://img.pr0gramm.com/" + img_id;
        document.getElementById("video_view").style.display = "none";
        document.getElementById("img_view").style.display = "block";
        console.log(document.getElementById("img_view").style.display);
    }

    console.log("https://img.pr0gramm.com/" + img_id);
}

function vote(_vote) {
    socket.emit("vote", JSON.stringify({"vote": _vote, "itemId": loaded[image_pos]}));
}
