let player_num = 0;
let id = 0;

let player1;
let player2;

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
	
	function preload (){
	this.load.image('car1', 'assets/PNG/Cars/car_blue_small_1.png');
	this.load.image('car2', 'assets/PNG/Cars/car_green_small_1.png');
	}
	
	
	function create (){
	player1 = this.add.image(400, 300, 'car1');
	player2 = this.add.image(400, 400, 'car2');
	
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
	}
});