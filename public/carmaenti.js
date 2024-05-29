let player_num = 0;
let id = 0;

let player1;
let player2;
let map;
let bullet;

let bull_angle = 0;
let bullet_objective = 0;

let game_over = false;

const socket = new WebSocket("ws://192.168.1.154:8081");

socket.addEventListener("open", function(event){
    socket.send("");
});

socket.addEventListener("message", function(event){
    try{
        // Ensure data is consistently parsed
        var data = JSON.parse(event.data);

        // Handle the initial assignment of player_num and id
        if (data.player_num !== undefined && id === 0) {
            player_num = data.player_num;
            console.log("Jugador: ", player_num);
            id = player_num;
        } else {
            // Handle incoming player and bullet data
            if (data.player_num !== undefined) {
                console.log("Jugador: " + data.player_num);
            } else {
                // Update bullet position and rotation if provided
                if (data.bx !== undefined) {
                    bullet.x = data.bx;
                    bullet.y = data.by;
                    bullet.rotation = data.br;
                    bullet_objective = data.bo;
                }
                
                // Update player positions and rotations
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
                
                // Handle game over status if provided
                if (data.game_over !== undefined) {
                    game_over = data.game_over;
                }
            }
        }
    } catch (error) {
        console.error("Error parseando JSON: ", error);
    }
});


socket.addEventListener("error", function(event){
    console.error("Websocket error:", event);
});

let player1_angle = 0;
let player2_angle = 0;

document.addEventListener("DOMContentLoaded", function(){
    const config = {
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

    function preload (){
        this.load.image('car1', 'assets/PNG/Cars/car_blue_small_1.png');
        this.load.image('car2', 'assets/PNG/Cars/car_green_small_1.png');
        this.load.image('map', 'assets/PNG/map.png');
        this.load.image('bullet', 'assets/PNG/bala.png');
    }

    function create (){
        map = this.add.image(400, 300, 'map');
        player1 = this.physics.add.image(400, 300, 'car1');
        player2 = this.physics.add.image(400, 400, 'car2');
    
        bullet = this.physics.add.image(-100, 0, 'bullet');
        bullet.setScale(.1);

        keys = this.input.keyboard.createCursorKeys();

        // Enable collision detection
		switch(id){
			case 1:
				this.physics.add.collider(bullet, player2, hitPlayer, null, this);
				break;
			case 2:
				this.physics.add.collider(bullet, player1, hitPlayer, null, this);
				break;
		}
    }

    function hitPlayer(bullet, player) {
        // Display message
        switch(id){
			case 1:
				alert("Player 2 wins!");
				break;
			case 2:
				alert("Player 1 wins!");
				break;
		}
        // Reset bullet
        bullet.x = -50;
        bullet.y = 0;
        bullet_pressed = false;
    }
    
    var space_hold = false;
    let const_ang = 0;

    function update (){
        switch(id){
            case 1:
                if(keys.up.isDown){
                    player1.y -= CAR_SPEED * Math.cos(player1_angle * Math.PI / 180);
                    player1.x += CAR_SPEED * Math.sin(player1_angle * Math.PI / 180);
                }
                if(keys.down.isDown){
                    player1.y += CAR_SPEED * Math.cos(player1_angle * Math.PI / 180);
                    player1.x -= CAR_SPEED * Math.sin(player1_angle * Math.PI / 180);
                }
                if(keys.left.isDown){
                    player1_angle -= CAR_ROTATION;
                }
                else if (keys.right.isDown){
                    player1_angle += CAR_ROTATION;
                }

                if (keys.space.isDown){ // Bala
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
                if(keys.up.isDown){
                    player2.y -= CAR_SPEED * Math.cos(player2_angle * Math.PI / 180);
                    player2.x += CAR_SPEED * Math.sin(player2_angle * Math.PI / 180);
                }
                if(keys.down.isDown){
                    player2.y += CAR_SPEED * Math.cos(player2_angle * Math.PI / 180);
                    player2.x -= CAR_SPEED * Math.sin(player2_angle * Math.PI / 180);
                }
                if(keys.left.isDown){
                    player2_angle -= CAR_ROTATION;
                }
                else if (keys.right.isDown){
                    player2_angle += CAR_ROTATION;
                }

                if (keys.space.isDown){ // Bala
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
            id: id
        };
        var player2_data = {
            x: player2.x,
            y: player2.y,
            r: player2.rotation,
            id: id
        };
     
        switch(id){
            case 1:
                socket.send(JSON.stringify(player1_data));
                break;
            case 2:
                socket.send(JSON.stringify(player2_data));
                break;
        }

        if (bullet_pressed){ // Send bullet
            if (space_hold){
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
