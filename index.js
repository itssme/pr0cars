let app = require('express')();
let http = require('http').Server(app);
const https = require('https');
let logger = require('morgan');
let io = require('socket.io')(http);

app.use(logger('dev'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/static/index.css', function(req, res) {
    res.sendFile(__dirname + '/static/index.css');
});

app.get('/static/lcars.css', function(req, res) {
    res.sendFile(__dirname + '/static/lcars.css');
});

app.get('/resources/lcars.ttf', function(req, res) {
    res.sendFile(__dirname + '/resources/lcars.ttf');
});

app.get('/utils/utils.js', function(req, res){
    res.sendFile(__dirname + '/utils/utils.js');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    let items = [];
    let item_pos = 0;

    https.get("https://pr0gramm.com/api/items/get", (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            console.log(JSON.parse(data).items[0].image);
            items = JSON.parse(data).items;
            socket.emit("image", items[item_pos].image);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

    socket.on("next_image", function (msg) {
        item_pos += 1;
        socket.emit("image", items[item_pos].image);
    })
});
