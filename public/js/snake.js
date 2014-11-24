$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width_canvas = $("#canvas").width();
	var high_canvas = $("#canvas").height();
	
	var cell_size_px = 20;
	var direction;
	var token = [];
	var nb_token = 15;
	var game_over_status = false;
	var score;
	
	var count = 30;
	var counter = setInterval(timer,1000);
	var time_over = false;
	//Create the eater
	var eater_array;
	
	init();
	
	function init()
	{
		//If the game begin
		timer();
		if(!game_over_status && !time_over) {
			direction = "right";
			create_eater();
			init_token();
			//Display the score
			score = 0;
			
			//Draw the eater every 60 ms
			if(typeof game_loop != "undefined")
			{
				clearInterval(game_loop);
			}
			game_loop = setInterval(paint, 60);
		} else {
			//When you have loose the game
			if(typeof game_loop != "undefined")
			{
				clearInterval(game_loop);
			}
			game_loop = setInterval(write_game_over, 60);
		}
	}
	
	function timer()
	{
		count=count-1;
		if (count < 0)
		{
			clearInterval(counter);
			time_over = true;
			return;
		}
		document.getElementById("timer").innerHTML=count + " secs";
	}

	//Create the eater
	function create_eater()
	{
		//Length of the eater
		var length = 1;
		//Empty array to start with
		eater_array = [];
		//This will create an eater starting from the top left
		eater_array.push({x: 0, y:0});
	}
	
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

	//Create a token at a position
	function create_token(position)
	{
		var token_type = define_token_type();
		token[position] = {
			x: Math.round(Math.random()*(width_canvas-cell_size_px)/cell_size_px), 
			y: Math.round(Math.random()*(high_canvas-cell_size_px)/cell_size_px), 
			value: token_type,
		};
	}

	//Clear the canvas
	function delete_canvas()
	{
		//Clear the canvas
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

	//Define the type of the new token (basic, rare, mgaic) and its value
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
	}

	//Paint the canvas
	function paint()
	{

		//Draw an empty canvas
		empty_canvas();
		
		//Initalize the eater array with the position of his head
		var nx = eater_array[0].x;
		var ny = eater_array[0].y;

		//Get the new position of his head
		if(direction == "right") nx++;
		else if(direction == "left") nx--;
		else if(direction == "up") ny--;
		else if(direction == "down") ny++;
		
		//Check if the eater hit something
		if(nx == -1 || nx == width_canvas/cell_size_px || ny == -1 || ny == high_canvas/cell_size_px || check_collision(nx, ny, eater_array))
		{
			delete_canvas();
			game_over_status = true;
			init();
		}
		if(time_over)
		{
			time_over = true;
			init();
		}
		
		//Make the eater can take a token
		var token_eaten = false;
		var position_to_create;
		for(var i =0; i <token.length; i++){
			if(nx == token[i].x && ny == token[i].y){
				token_eaten =true;
				position_to_create = i;
				break;
			}
		}
		if(token_eaten)
		{
			var tail = {x: nx, y: ny};
			score = score+token[position_to_create].value;
			//Create new token
			create_token(position_to_create);
		}
		else
		{
			//Delete the last cell
			var tail = eater_array.pop();
			tail.x = nx;
			tail.y = ny;
		}

		//Put the eater to the first cell
		eater_array.unshift(tail); 
		
		for(var i = 0; i < eater_array.length; i++)
		{
			var c = eater_array[i];
			paint_eater_cell(c.x, c.y);
		}
		
		//Paint the tokens
		for(var i = 0; i < token.length; i++){
			paint_cell(token[i].x, token[i].y,token[i].value);
		}
		//Paint the score
		var score_text = "Score: " + score;
		ctx.fillText(score_text, 5, high_canvas-5);
	}

	function write_game_over()
	{
		//Write Game Over
		var game_over_text = "Game Over";
		ctx.fillText(game_over_text, 20, 20);
		init();
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

	function paint_eater_cell(x, y)
	{
		ctx.fillStyle = "black";
		ctx.fillRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
	}

	
	function check_collision(x, y, array)
	{
		//Check if the eater hit something
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	//Keyboard controls
	$(document).keydown(function(e){
		var key = e.which;
		//Another clause to prevent reverse gear
		if(key == "37" && direction != "right") direction = "left";
		else if(key == "38" && direction != "down") direction = "up";
		else if(key == "39" && direction != "left") direction = "right";
		else if(key == "40" && direction != "up") direction = "down";
	})
	
	
})