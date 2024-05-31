let static = require('node-static');
let http = require('http');
let ws = require('ws');

let file = new static.Server('./public');

let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});

let ws_server = new ws.WebSocketServer({ server: http_server });

http_server.listen(8081);

let p1_conn;
let p2_conn;

let curr_id = 0;

var p1 = {
    x: 400,
    y: 300,
    r: 0,
    id: 1,
	game_over: ""
};
var p2 = {
    x: 400,
    y: 400,
    r: 0,
    id: 2,
	game_over: ""
};
var bull = {
    bx: -100,
    by: 0,
    br: 0,
    bo: 0
}

let specs = [];
let conn_users = 3;

let go = "";

ws_server.on('connection', function (conn) {
    console.log('EVENT: Connection');

    if (p1_conn == undefined) {
        p1_conn = conn;
        p1_conn.send('{"player_num":1}');

        p1_conn.on('message', function (data) {
            data = data.toString();

            if (data.length <= 0)
                return;

            specs.forEach(viewer => {
                viewer.send(data.toString());
            });

            let dat = JSON.parse(data);

            if (dat.bx != undefined) {
                bull.bx = dat.bx;
                bull.by = dat.by;
                bull.br = dat.br;
                bull.bo = dat.bo;
            } else if (dat.x != undefined) {
                p1.x = dat.x;
                p1.y = dat.y;
                p1.r = dat.r;
                p1.id = dat.id;
				p1.game_over = dat.game_over;
            }

            p1_conn.send(JSON.stringify(p1));
            p1_conn.send(JSON.stringify(p2));
            p1_conn.send(JSON.stringify(bull));
        });
    } else if (p2_conn == undefined) {
        p2_conn = conn;
        p2_conn.send('{"player_num":2}');

        p2_conn.on('message', function (data) {
            data = data.toString();
            if (data.length <= 0)
                return;

            specs.forEach(viewer => {
                viewer.send(data.toString());
            });

            let dat = JSON.parse(data);
            if (dat.bx != undefined) {
                bull.bx = dat.bx;
                bull.by = dat.by;
                bull.br = dat.br;
                bull.bo = dat.bo;
            } else if (dat.x != undefined) {
                p2.x = dat.x;
                p2.y = dat.y;
                p2.r = dat.r;
                p2.id = dat.id;
				p2.game_over = dat.game_over;
            }

            p2_conn.send(JSON.stringify(p1));
            p2_conn.send(JSON.stringify(p2));
            p2_conn.send(JSON.stringify(bull));
        });
    } else {
        let data = '{"player_num":' + conn_users + '}';
        conn.send(data);

        conn.send(JSON.stringify(p1));
        conn.send(JSON.stringify(p2));
        conn.send(JSON.stringify(bull));

        conn.on('message', function (data) {
            if (data.length <= 0) return;

            if (go != "")
                conn.send('{"game_over":"' + go + '"}');
        });

        console.log('Spectators: ' + (conn_users - 2));

        conn_users++;
        specs.push(conn);
    }
});
