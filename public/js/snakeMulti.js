$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width_canvas = $("#canvas").width();
	var high_canvas = $("#canvas").height();

	//Player canvas
	var playerStatus = $("#playerCanvas")[0];
	var playerCtx = playerStatus.getContext("2d");
	var width_playerCanvas = $("#playerCanvas").width();
	var high_playerCanvas = $("#playerCanvas").height();
	
	var cell_size_px = 20;
	//var direction;
	var token = {};
	var nb_token = 15;
	var game_over_status = false;
	//var score;
	
	var count = 30;
	//var counter = setInterval(timer,1000);
	var time_over = false;
	//Create the eater
	var eater_array;
	var players_map = {};
	var player_pos;
	var player_color;

	initgame();
	
	function initgame()
	{
		empty_canvas();
		playerCtx.strokeStyle = "black";
		playerCtx.strokeRect(0, 0, 200, 200);
		var moi = {name:player_name_current, isReady:false};
		players_map[moi.name] = moi;
		drawPlayerNames();

		//Global value define in the php
		socket.emit('init',moi.name);
		socket.on('newPlayer', function (data) {
			var player = {};
			player.name = data;
			player.isReady = false;
			var eater = new Eater();
			player.eater = eater;
			players_map[data] = player;
			drawPlayerNames();
  		});
		socket.on('leave', function (data) {
			removePlayer(data);
			drawPlayerNames();
  		});
		socket.on('ready', function (data) {
			setPlayerReady(data);
			drawPlayerNames();
  		});
  		socket.on('begin', function (data) {
  			token = data[player_name_current].map;
  			trace("begin ".concat(data[player_name_current].color,data[player_name_current].pos));
  			initializePlayers(data);
  			init();
  		});
  		socket.on('notifyDirection',function (data) {
  			handleNotifyDirection(data.pname,data.direction);
  		});
  		socket.on('newToken', function (data) {
  			token[data.position] = data.token;
  		});
  		socket.on('draw', function (data) {
  			updatePlayerDirection(data);
  			paint();
  		});
  		document.getElementById("button_ready").onclick = playerReady;
		waitPlayer();
	}

	function initializePlayers(data)
	{
		for(var playerName in players_map)
		{
			var player = players_map[playerName];
			var config = data[playerName];
  			player.color = config.color;
  			player.pos = config.pos;
  			player.score = 0;
  			
  			trace("player = ".concat(playerName," color = ",player.color," pos = ",player.pos));
		}
		updatePlayerDisplay(players_map);
	}

	function waitPlayer()
	{
		if(typeof game_loop != "undefined")
		{
			clearInterval(game_loop);
		}
		game_loop = setInterval(waitPlayer, 60);		
	}

	function playerReady()
	{
		var moi = players_map[player_name_current];
		moi.isReady = true;
		socket.emit('ready',moi.name);
		drawPlayerNames();
	}

	function removePlayer(data)
	{
		delete players_map[data];
	}

	function setPlayerReady(name)
	{
		var current = players_map[name];
		if(current !== undefined)
		{
			current.isReady = true;
		}
	}

	function handleNotifyDirection(playerName, playerDirection)
	{
		var player = players_map[playerName];
		player.direction = playerDirection;
	}

	function updatePlayerDirection(dirMap)
	{
		for(var playerName in dirMap)
		{
			players_map[playerName].direction = dirMap[playerName];
		}
	}

	function drawPlayerNames()
	{
		playerCtx.clearRect(2, 2, width_playerCanvas-4, high_playerCanvas-4);
		var pos_name_x = 10;
		var pos_name_y = 10;
		for(var pname in players_map)
		{
			var player = players_map[pname];
			if(player.isReady)
			{
				playerCtx.fillStyle = 'green';
			}
			playerCtx.fillText(player.name, pos_name_x, pos_name_y);
			pos_name_y += 20;
			//To be sure that we don't write in green next time
			playerCtx.fillStyle = 'black';
		}
	}

	function updatePlayerDisplay(playerName, color) 
	{
		playerCtx.clearRect(2, 2, width_playerCanvas-4, high_playerCanvas-4);
		var pos_name_x = 10;
		var pos_name_y = 10;
		for(var pname in players_map)
		{
			var player = players_map[pname];
			playerCtx.fillStyle = player.color;
			playerCtx.fillText(player.name, pos_name_x, pos_name_y);
			pos_name_y += 20;
			//To be sure that we don't write in green next time
			playerCtx.fillStyle = 'black';
		}
	}

	function init()
	{
		//If the game begin
		var counter = setInterval(timer,1000);
		timer(counter);
		if(!game_over_status && !time_over) {
			initPlayer();
			//Display the score
			//score = 0;
			paint();
/*			//Draw the eater every 60ms
			if(typeof game_loop != "undefined")
			{
				clearInterval(game_loop);
			}
			game_loop = setInterval(paint, 60);*/
		} else {
			//When you have loose the game
/*			if(typeof game_loop != "undefined")
			{
				clearInterval(game_loop);
			}
			game_loop = setInterval(write_game_over, 60);*/
			write_game_over();
		}
	}

	function initPlayer()
	{
		for(var playerName in players_map)
		{
			var player = players_map[playerName];
			if(player.pos[0] === 0)
			{
				player.direction = "right";
			}
			else
			{
				player.direction = "left";
			}
			//trace("direction".concat(player.direction));
			var eater = new Eater();
			eater.getEaterArray().push({x: player.pos[0], y:player.pos[1]});
			player.eater = eater;
		}	
	}
	
	function timer(counter)
	{
		if (!game_over_status) 
		{
			count=count-1;
		} else {
			count = 0;
		}
		if (count < 0)
		{
			clearInterval(counter);
			time_over = true;
			return;
		}
		document.getElementById("timer").innerHTML=count + " secs";
	}

	//Create the eater
	function Eater()
	{
		//Length of the eater
		this.length = 1; 
		//The array eater
		this.eater_array = [];
		/*
		//This will create an eater
		this.eater_array.push({x: player_pos[0], y:player_pos[1]});
		*/

	}
	Eater.prototype.getEaterArray = function() {
		return this.eater_array;
	};
	Eater.prototype.pushArray = function(pos) {
		return this.eater_array.push(pos);
	};
	
	//Create the first tokens
	function init_token()
	{
		for(var i=0; i < nb_token; i++){
			token[i] = {
				x: Math.round(Math.random()*(width_canvas-cell_size_px)/cell_size_px), 
				y: Math.round(Math.random()*(high_canvas-cell_size_px)/cell_size_px), 
				value: 1,
			};
		}
	}

/*	//Create a token at a position
	function create_token(position)
	{
		var token_type = define_token_type();
		token[position] = {
			x: Math.round(Math.random()*(width_canvas-cell_size_px)/cell_size_px), 
			y: Math.round(Math.random()*(high_canvas-cell_size_px)/cell_size_px), 
			value: token_type,
		};
	}*/

	//Clear the canvas
	function delete_canvas()
	{
		ctx.clearRect(0,0,width_canvas,high_canvas);
	}
	
	//Draw an empty canvas
	function empty_canvas()
	{
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width_canvas, high_canvas);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, width_canvas, high_canvas);
	}

/*	//Define the type of the new token (basic, rare, magic) and its value
	function define_token_type()
	{
		var value;
		var type = Math.random();
		if(type < 0.6){
			value = 1;
		}
		else if(type >= 0.6 && type < 0.85){
			value = 3;
		}
		else {
			value = 5;
		}
		return value;
	}*/

	//Paint the canvas
	function paint()
	{
		//Paint the canvas

		empty_canvas();
		for(var player in players_map)
		{
			var current = players_map[player];
			var array = current.eater.getEaterArray();
			//The head of the eater
			var nx = array[0].x;
			var ny = array[0].y;
			var direction = current.direction;
			var color = current.color;

			//Define the head position from his direction
			if(direction == "right") nx = nx + cell_size_px;
			else if(direction == "left") nx = nx - cell_size_px;
			else if(direction == "up") ny = ny - cell_size_px;
			else if(direction == "down") ny = ny + cell_size_px;
			
			//Check if the eater hit something
			//if(nx == -1 || nx == width_canvas/cell_size_px || ny == -1 || ny == high_canvas/cell_size_px || check_collision(nx, ny, array))
			if(nx == -1 || nx == width_canvas || ny == -1 || ny == high_canvas  || check_collision(nx, ny))
			{
				delete_canvas();
				game_over_status = true;
				init();
				socket.emit("gameOver",player_name_current);
			}
			if(time_over)
			{
				time_over = true;
				socket.emit("timeOver");
				init();
			}
			//Make the eater can eat a token
			var token_eaten = false;
			var position_to_create = 0;
			var index = 0;
			for(var toke in token){
				index++;
				if(nx == token[toke].x && ny == token[toke].y){
					token_eaten =true;
					position_to_create = index;
					break;
				}
			}
			var tail;
			if(token_eaten)
			{
				tail = {x: nx, y: ny};
				current.score = current.score+token[position_to_create].value;
				//Create new token
				socket.emit('eaten',position_to_create);
				//create_token(position_to_create);
			}
			else
			{
				//Delete the last cell
				tail = array.pop();
				tail.x = nx;
				tail.y = ny;
			}
			trace("paint player ".concat(player," color ",color," pos x=",nx," pos y=",ny));
			paintEater(current.eater,tail,color);
		}
		//Paint all the eaters
/*		for(eater in players_map)
		{
			paintEater(players_map[eater].eater);
		}*/

		//Paint the tokens
		paintToken();

		//Lets paint the score
		var score_text = "Score: " + players_map[player_name_current].score;
		ctx.fillText(players_map[player_name_current].direction, 500, 500);
		ctx.fillText(score_text, 5, high_canvas-5);
	}

	function write_game_over()
	{
		//Write Game Over
		var game_over_text = "Game Over";
		ctx.fillText(game_over_text, 20, 20);
		//init();
	}

	function paintToken()
	{
		for(var tok in token)
		{
			paint_cell(token[tok].x, token[tok].y,token[tok].value);
		}
	}

	//Paint one eater
	function paintEater(eater,tail,color)
	{
		trace("drawing eater");
		eater.getEaterArray().unshift(tail);
		var eaterArray = eater.getEaterArray();
		//eaterArray.unshift(tail);
		for(var i = 0; i < eaterArray.length; i++)
		{
			var c = eaterArray[i];
			//Paint the cells
			paint_eater_cell(c.x, c.y, color);
			//trace("eater drawn x=".concat(c.x," y=",c.y, " color = ", color));
		}
	}
	
	//Paint the cell in function of their value
	function paint_cell(x, y, value)
	{
		if(value == 1)
		{
			ctx.fillStyle = "blue";
			ctx.fillRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
		}
		else if(value == 3)
		{
			ctx.fillStyle = "red";
			ctx.fillRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
		}
		else 
		{
			ctx.fillStyle = "green";
			ctx.fillRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
		}
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
	}

	function paint_eater_cell(x, y, color)
	{
		//trace("eaterpos x=".concat(x," y=",y));
		ctx.fillStyle = color;
		ctx.fillRect(x, y, cell_size_px, cell_size_px);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x, y, cell_size_px, cell_size_px);
	}
	
	function check_collision(x, y)
	{
		var res = false;
		//Check if the eater hit itself or another player
		for (var pname in players_map)
		{
			var eater_array = players_map[pname].eater.getEaterArray();
			for(var i = 0; i < eater_array.length; i++)
			{
				if(eater_array[i].x == x && eater_array[i].y == y)
				res =  true;
			}
		}
		return res;
	}
	
	//Keyboard controls
	$(document).keydown(function(e){
		var key = e.which;
		var moi = players_map[player_name_current];
		var direction = moi.direction;
		var newDirection;
		//Add another clause to prevent reverse gear
		if(key == "37" && direction != "right") newDirection = "left";
		else if(key == "38" && direction != "down") newDirection = "up";
		else if(key == "39" && direction != "left") newDirection = "right";
		else if(key == "40" && direction != "up") newDirection = "down";
		socket.emit('direction',{'pname':player_name_current,'direction':newDirection});
	});

	function trace(text)
	{
		console.log("trace",text);
	}
	
	
});