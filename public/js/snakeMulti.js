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
	var token = {};
	var nb_token = 15;
	var game_over_status = false;
	//var score;
	
	var count = 30;
	var time_over = false;
	//Create the eater
	var eater_array;
	//The map which contain all informations about all players
	var players_map = {};
	var player_pos;
	var player_color;

	initgame();
	
	function initgame()
	{
		//Clean the canvas
		empty_canvas();
		playerCtx.strokeStyle = "black";
		playerCtx.strokeRect(0, 0, 200, 200);
		//Create the current user and put in in the players_map
		var moi = {name:player_name_current, isReady:false};
		players_map[moi.name] = moi;
		//Draw the name of all players who are present
		drawPlayerNames();

		//Global value define in the php
		//Send to the server that you are log on
		socket.emit('init',moi.name);
		//When the server tell you that another player is present
		socket.on('newPlayer', function (data) {
			//Collect the informations of this new player and stock it
			var player = {};
			player.name = data;
			player.isReady = false;
			var eater = new Eater();
			player.eater = eater;
			players_map[data] = player;
			drawPlayerNames();
  		});
  		//When a player is leaving, delete him from the players list and redraw the players name
		socket.on('leave', function (data) {
			removePlayer(data);
			drawPlayerNames();
  		});
  		//When the server told you that a player is ready
		socket.on('ready', function (data) {
			setPlayerReady(data);
			drawPlayerNames();
  		});
  		//When the game begin
  		socket.on('begin', function (data) {
  			//Stock the map that the server send you
  			token = data[player_name_current].map;
  			trace("begin ".concat(data[player_name_current].color,data[player_name_current].pos));
  			//Initialize all players data with the informations from the server
  			initializePlayers(data);
  			//Launch the game
  			init();
  		});
  		//When a player move
  		socket.on('notifyDirection',function (data) {
  			handleNotifyDirection(data.pname,data.direction);
  		});
  		//When a new token has been created
  		socket.on('newToken', function (data) {
  			token[data.position] = data.token;
  		});
  		//When the server told you to draw your canvas
  		socket.on('draw', function (data) {
  			updatePlayerDirection(data);
  			paint();
  		});
  		//Check when you hit the ready bouton from the php page
  		document.getElementById("button_ready").onclick = playerReady;
  		//Wait until all the players present are ready to begin
		waitPlayer();
	}

	//Configure all informations about players from the server informations
	function initializePlayers(data)
	{
		for(var playerName in players_map)
		{
			//Set their color, their pos and their score
			var player = players_map[playerName];
			var config = data[playerName];
  			player.color = config.color;
  			player.pos = config.pos;
  			player.score = 0;
  			trace("player = ".concat(playerName," color = ",player.color," pos = ",player.pos));
		}
		//Modify the player direction
		updatePlayerDisplay(players_map);
	}

	//When you wait until all players are ready
	function waitPlayer()
	{
		if(typeof game_loop != "undefined")
		{
			clearInterval(game_loop);
		}
		game_loop = setInterval(waitPlayer, 60);		
	}

	//Put you as ready and send it to the server that you are
	function playerReady()
	{
		var moi = players_map[player_name_current];
		moi.isReady = true;
		socket.emit('ready',moi.name);
		drawPlayerNames();
	}

	//Remove a player from the players_map
	function removePlayer(data)
	{
		delete players_map[data];
	}

	//Put a player as a ready player
	function setPlayerReady(name)
	{
		var current = players_map[name];
		if(current !== undefined)
		{
			current.isReady = true;
		}
	}

	//Modify a player direction from his new direction
	function handleNotifyDirection(playerName, playerDirection)
	{
		var player = players_map[playerName];
		player.direction = playerDirection;
	}

	//Set the direction of all players
	function updatePlayerDirection(dirMap)
	{
		for(var playerName in dirMap)
		{
			players_map[playerName].direction = dirMap[playerName];
		}
	}

	//Draw the name of all players inside a canvas
	function drawPlayerNames()
	{
		playerCtx.clearRect(2, 2, width_playerCanvas-4, high_playerCanvas-4);
		var pos_name_x = 10;
		var pos_name_y = 10;
		for(var pname in players_map)
		{
			var player = players_map[pname];
			//If a player is ready we draw is name in green
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

	//When the game begin clear the canavs where the player name are and redraw it
	//with for each player is own color
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

	//When the game begin
	function init()
	{
		//Launch the time counter
		var counter = setInterval(timer,1000);
		timer(counter);
		if(!game_over_status && !time_over) {
			//Create the eater of the current player
			initPlayer();
			//Draw the canvas
			paint();
		} else {
			write_game_over();
		}
	}

	//Create for each player an eater
	function initPlayer()
	{
		for(var playerName in players_map)
		{
			var player = players_map[playerName];
			//For only two players here
			if(player.pos[0] === 0)
			{
				player.direction = "right";
			}
			else
			{
				player.direction = "left";
			}
			//Create the eater array and set the position of the head
			var eater = new Eater();
			eater.getEaterArray().push({x: player.pos[0], y:player.pos[1]});
			player.eater = eater;
		}	
	}
	
	//The time counter before the game is over
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
		//Draw it one the php page
		document.getElementById("timer").innerHTML=count + " secs";
	}

	//Create the eater
	function Eater()
	{
		//Length of the eater
		this.length = 1; 
		//The array eater
		this.eater_array = [];
	}
	Eater.prototype.getEaterArray = function() {
		//Return the eater array
		return this.eater_array;
	};
	Eater.prototype.pushArray = function(pos) {
		//Add the new position to the eater array
		return this.eater_array.push(pos);
	};
	
	//Create the first tokens at random position
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
			//Check that our head is on a token position
			for(var toke in token){
				index++;
				if(nx == token[toke].x && ny == token[toke].y){
					token_eaten =true;
					position_to_create = index;
					break;
				}
			}
			var tail;
			//If the eater eat a token
			if(token_eaten)
			{
				tail = {x: nx, y: ny};
				current.score = current.score+token[position_to_create].value;
				//Create new token
				socket.emit('eaten',position_to_create);
			}
			//To make the eater moving
			else
			{
				//Delete the last cell
				tail = array.pop();
				tail.x = nx;
				tail.y = ny;
			}
			trace("paint player ".concat(player," color ",color," pos x=",nx," pos y=",ny));
			//Paint the eater
			paintEater(current.eater,tail,color);
		}

		//Paint the tokens
		paintToken();

		//Lets paint the score
		var score_text = "Score: " + players_map[player_name_current].score;
		ctx.fillText(score_text, 5, high_canvas-5);
	}

	//Write game over inside the canvas
	function write_game_over()
	{
		//Write Game Over
		var game_over_text = "Game Over";
		ctx.fillText(game_over_text, 20, 20);
	}

	//Paint all token from the token list
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
		//Add the tail to the eater array
		eater.getEaterArray().unshift(tail);
		var eaterArray = eater.getEaterArray();
		//Draw each cell of an eater
		for(var i = 0; i < eaterArray.length; i++)
		{
			var c = eaterArray[i];
			//Paint the cells
			paint_eater_cell(c.x, c.y, color);
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

	//Draw the eater cells
	function paint_eater_cell(x, y, color)
	{
		ctx.fillStyle = color;
		ctx.fillRect(x, y, cell_size_px, cell_size_px);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x, y, cell_size_px, cell_size_px);
	}
	
	//Check that the player is not hiting itself or hiting another player 
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
		//Get the direction of the current player
		var moi = players_map[player_name_current];
		var direction = moi.direction;
		var newDirection;
		//Add another clause to prevent reverse gear
		if(key == "37" && direction != "right") newDirection = "left";
		else if(key == "38" && direction != "down") newDirection = "up";
		else if(key == "39" && direction != "left") newDirection = "right";
		else if(key == "40" && direction != "up") newDirection = "down";
		//Send his new direction to the server
		socket.emit('direction',{'pname':player_name_current,'direction':newDirection});
	});

	//To add some trace to the console for debug
	function trace(text)
	{
		console.log("trace",text);
	}
	
	
});