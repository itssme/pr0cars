let app = require('express')();
let http = require('http').Server(app);
const https = require('https');
let logger = require('morgan');
let io = require('socket.io')(http);
const querystring = require('querystring');
const read = require('read');

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

let login_cookie = "";

function login(_username, _password) {
    let data = querystring.stringify({
        'name' : _username,
        'password': _password
    });

    console.log(data);

    const options = {
        hostname: 'pr0gramm.com',
        port: 443,
        path: '/api/user/login/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            console.log("cookie is -> " + d);
            console.log("cookie is -> " + d.cookies);
            login_cookie = d;
        })
    });

    req.on('error', (error) => {
        console.error(error)
    });

    req.write(data);
    req.end()
}

let username = "";
read({ prompt: 'Username: ', silent: true }, function(er, _username) {
    console.log('Your username is: %s', _username);
    username = _username;
    read({ prompt: 'Password: ', silent: true }, function(er, password) {
        console.log('Your password is: %s', password);
        login(username, password);
    });
});

io.on('connection', function(socket) {
    console.log('a (schm)user connected');
    let items = [];
    let item_pos = 0;

    function get_items() {
        https.get("https://pr0gramm.com/api/items/get", (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                item_pos = 0;
                items = JSON.parse(data).items;
                socket.emit("image", items[item_pos].image);
                console.log("got new items");
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
    get_items();

    function get_items_after_id(item_id) {
        https.get("https://pr0gramm.com/api/items/get?older=" + item_id, (resp) => {
            console.log("made req -> " + "https://pr0gramm.com/api/items/get?older=" + item_id);
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                item_pos = 0;
                items = JSON.parse(data).items;
                socket.emit("image", items[item_pos].image);
                console.log("got new items");
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    function get_item_info(item_id) {
        let data = querystring.stringify({
            'itemId' : item_id
        });

        const options = {
            hostname: 'pr0gramm.com',
            port: 443,
            path: '/api/items/info',
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }

        };

        // "https://pr0gramm.com/api/items/info?itemId=" + item_id
        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(data);
            });
        });

        req.on('error', (error) => {
            console.error(error)
        });

        req.write(data);
        req.end()
    }

    socket.on("next_image", function (msg) {
        item_pos += 1;
        console.log("requested -> " + item_pos);
        if (item_pos >= items.length) {
            get_items_after_id(items[item_pos-1].id);
        } else {
            console.log("ok -> " + item_pos);
            socket.emit("image", items[item_pos].image);
            get_item_info(items[item_pos].id);
        }
    })
});
