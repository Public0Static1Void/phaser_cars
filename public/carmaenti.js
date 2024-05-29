let player_num = 0;
let id = 0;

let player1;
let player2;
let map;
let bullet;

const socket = new WebSocket("ws://10.40.2.179:8080");

socket.addEventListener("open", function(event){
	socket.send("");
});

socket.addEventListener("message", function(event){
	try{
		var data = event.data;
		if (id == 0)
			data = JSON.parse(event.data);

		if (data.player_num != undefined && id == 0){
			player_num = data.player_num;
			console.log("Jugador: ", player_num);
			id = player_num;
		}
		else{
			let dat = JSON.parse(data);

			if (dat.bx != undefined){
				bullet.x = dat.bx;
				bullet.y = dat.by;
				bullet.rotation = dat.br;
			}

			console.log("Code: ", JSON.stringify(dat));
			switch(dat.id){
				case 1:
					player1.x = dat.x;
					player1.y = dat.y;
					player1.rotation = dat.r;
					break;
				case 2:
					player2.x = dat.x;
					player2.y = dat.y;
					player2.rotation = dat.r;
					break;
			}
		}
	}
	catch (error){
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
	let bullet_objective = 0;
	
	function preload (){
	this.load.image('car1', 'assets/PNG/Cars/car_blue_small_1.png');
	this.load.image('car2', 'assets/PNG/Cars/car_green_small_1.png');
	this.load.image('map', 'assets/PNG/map.png');
	this.load.image('bullet', 'assets/PNG/bala.png');
	}
	
	
	function create (){
	map = this.add.image(400, 300, 'map');
	player1 = this.add.image(400, 300, 'car1');
	player2 = this.add.image(400, 400, 'car2');
	
	bullet = this.add.image(-50, 0, 'bullet');
	bullet.setScale(.1);

	keys = this.input.keyboard.createCursorKeys();
	}
	
	function update (){

		switch(id){
			case 1:
				if(keys.up.isDown){
					player1.y -= CAR_SPEED*Math.cos(player1_angle*Math.PI/180);
					player1.x += CAR_SPEED*Math.sin(player1_angle*Math.PI/180);
				 }
				 if(keys.down.isDown){
					player1.y += CAR_SPEED*Math.cos(player1_angle*Math.PI/180);
					player1.x -= CAR_SPEED*Math.sin(player1_angle*Math.PI/180);
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
					bullet_objective = 2;
					bullet_pressed = true;
				 }

				 player1.rotation = player1_angle * Math.PI / 180;
				break;
			case 2:
				if(keys.up.isDown){
					player2.y -= CAR_SPEED*Math.cos(player2_angle*Math.PI/180);
					player2.x += CAR_SPEED*Math.sin(player2_angle*Math.PI/180);
				 }
				 if(keys.down.isDown){
					player2.y += CAR_SPEED*Math.cos(player2_angle*Math.PI/180);
					player2.x -= CAR_SPEED*Math.sin(player2_angle*Math.PI/180);
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
					bullet_objective = 1;
					bullet_pressed = true;
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

	 if (!bullet_pressed){ // Send bullet
		let angle = Math.atan2(player2.y - player1.y, player2.x - player1.x);
		console.log("Code: ", bullet_objective);
		switch (bullet_objective){
			case 1:
				angle = player2_angle;
				break;
			case 2:
				angle = player1_angle;
				break;
		}

		bullet.y -= CAR_SPEED*Math.cos(angle * Math.PI/180);
		bullet.x += CAR_SPEED*Math.sin(angle * Math.PI/180);

		bullet.rotation = angle * (Math.PI / 180);

		var bullet_data = {
			bx: bullet.x,
			by: bullet.y,
			br: bullet.rotation
		}

		socket.send(JSON.stringify(bullet_data));
	 }
	}
});