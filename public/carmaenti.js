let player_num = 0;
let id = 0;

var player1 = { x: 0, y: 0, rotation: 0 };
var player2 = { x: 0, y: 0, rotation: 0 };
var bullet = { x: 0, y: 0, rotation: 0 };
let map;

let bull_angle = 0;
let bullet_objective = 0;

let game_over_text = "";

let game;
let config;

const socket = new WebSocket("ws://192.168.1.154:8081");

socket.addEventListener("open", function(event) {
    socket.send("");
});

socket.addEventListener("message", function(event) {
    try {
        var data = JSON.parse(event.data);

        if (data.player_num !== undefined && id === 0) {
            player_num = data.player_num;
            console.log("Jugador: ", player_num);
            id = player_num;
        } else {
            if (data.player_num !== undefined) {
                console.log("Jugador: " + data.player_num);
            } else {
                if (data.bx !== undefined) {
                    bullet.x = data.bx;
                    bullet.y = data.by;
                    bullet.rotation = data.br;
                    bullet_objective = data.bo;
                }

                if (data.x === undefined || data.y === undefined) return;

                switch (data.id) {
                    case 1:
                        player1.x = data.x;
                        player1.y = data.y;
                        player1.rotation = data.r;
                        break;
                    case 2:
                        player2.x = data.x;
                        player2.y = data.y;
                        player2.rotation = data.r;
                        break;
                }
                game_over_text = data.game_over;
                if (game_over_text !== "" && game !== undefined)
                    game.add.text(config.width / 3.5, config.height / 2.25, game_over_text, {
                        fontFamily: 'Comfortaa, sans-serif',
                        fontSize: 64,
                        color: '#FF2AA'
                    }).setVisible(true);
            }
        }
    } catch (error) {
        console.error("Error parseando JSON: ", error);
    }
});

socket.addEventListener("error", function(event) {
    console.error("WebSocket error:", event);
});

let player1_angle = 0;
let player2_angle = 0;

document.addEventListener("DOMContentLoaded", function() {
    config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                debug: true
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update,
        }
    };

    const CAR_SPEED = 5;
    const CAR_ROTATION = 5;

    const screen = new Phaser.Game(config);

    let keys;
    let bullet_pressed = false;

    function preload() {
        this.load.image('car1', 'assets/PNG/Cars/car_blue_small_1.png');
        this.load.image('car2', 'assets/PNG/Cars/car_green_small_1.png');
        this.load.image('map', 'assets/PNG/map.png');
        this.load.image('bullet', 'assets/PNG/bala.png');
    }

    function create() {
        game = this;
        map = this.add.image(400, 300, 'map');
        player1 = this.physics.add.image(400, 300, 'car1');
        player2 = this.physics.add.image(400, 400, 'car2');

        bullet = this.physics.add.image(-100, 0, 'bullet');
        bullet.setScale(.1);

        keys = this.input.keyboard.createCursorKeys();

        // Enable collision detection
        if (id === 1) {
            this.physics.add.collider(bullet, player2, hitPlayer, null, this);
        } else if (id === 2) {
            this.physics.add.collider(bullet, player1, hitPlayer, null, this);
        }
    }

    function hitPlayer(bullet, player) {
        // Display message
        switch (id) {
            case 1:
                game_over_text = "Player 1 wins!";
                break;
            case 2:
                game_over_text = "Player 2 wins!";
                break;
        }
        var final = {
            game_over: game_over_text
        };
        
        // Reset bullet
        bullet.x = -50;
        bullet.y = 0;
        bullet_pressed = false;
    }

    function showGameOverText(text) {
        
    }

    var space_hold = false;
    let const_ang = 0;

    function update() {
        switch (id) {
            case 1:
                if (keys.up.isDown) {
                    player1.y -= CAR_SPEED * Math.cos(player1_angle * Math.PI / 180);
                    player1.x += CAR_SPEED * Math.sin(player1_angle * Math.PI / 180);
                }
                if (keys.down.isDown) {
                    player1.y += CAR_SPEED * Math.cos(player1_angle * Math.PI / 180);
                    player1.x -= CAR_SPEED * Math.sin(player1_angle * Math.PI / 180);
                }
                if (keys.left.isDown) {
                    player1_angle -= CAR_ROTATION;
                } else if (keys.right.isDown) {
                    player1_angle += CAR_ROTATION;
                }

                if (keys.space.isDown) { // Bala
                    bullet.x = player1.x;
                    bullet.y = player1.y;
                    bullet.rotation = player1_angle * Math.PI / 180;
                    bullet_objective = 2;
                    bullet_pressed = true;
                    space_hold = true;
                }

                player1.rotation = player1_angle * Math.PI / 180;
                break;
            case 2:
                if (keys.up.isDown) {
                    player2.y -= CAR_SPEED * Math.cos(player2_angle * Math.PI / 180);
                    player2.x += CAR_SPEED * Math.sin(player2_angle * Math.PI / 180);
                }
                if (keys.down.isDown) {
                    player2.y += CAR_SPEED * Math.cos(player2_angle * Math.PI / 180);
                    player2.x -= CAR_SPEED * Math.sin(player2_angle * Math.PI / 180);
                }
                if (keys.left.isDown) {
                    player2_angle -= CAR_ROTATION;
                } else if (keys.right.isDown) {
                    player2_angle += CAR_ROTATION;
                }

                if (keys.space.isDown) { // Bala
                    bullet.x = player2.x;
                    bullet.y = player2.y;
                    bullet.rotation = player2_angle * Math.PI / 180;
                    bullet_objective = 1;
                    bullet_pressed = true;
                    space_hold = true;
                }

                player2.rotation = player2_angle * Math.PI / 180;
                break;
        }

        var player1_data = {
            x: player1.x,
            y: player1.y,
            r: player1.rotation,
            id: id,
            game_over: game_over_text
        };
        var player2_data = {
            x: player2.x,
            y: player2.y,
            r: player2.rotation,
            id: id,
            game_over: game_over_text
        };

        switch (id) {
            case 1:
                socket.send(JSON.stringify(player1_data));
                break;
            case 2:
                socket.send(JSON.stringify(player2_data));
                break;
        }

        if (bullet_pressed) { // Send bullet
            if (space_hold) {
                const_ang = (bullet_objective === 1) ? player2_angle : player1_angle;
                space_hold = false;
            }

            bullet.y -= 4 * CAR_SPEED * Math.cos(const_ang * Math.PI / 180);
            bullet.x += 4 * CAR_SPEED * Math.sin(const_ang * Math.PI / 180);

            var bullet_data = {
                bx: bullet.x,
                by: bullet.y,
                br: bullet.rotation,
                bo: bullet_objective
            };

            socket.send(JSON.stringify(bullet_data));
        }
    }
});
