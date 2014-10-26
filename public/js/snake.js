$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width_canvas = $("#canvas").width();
	var high_canvas = $("#canvas").height();
	
	//Lets save the cell width in a variable for easy control
	var cell_size_px = 20;
	var direction;
	var token = [];
	var nb_token = 15;
	var game_over_status = false;
	var score;
	
	var count = 30;
	var counter = setInterval(timer,1000);
	var time_over = false;
	//Lets create the eater now
	var eater_array; //an array of cells to make up the eater
	
	init();
	
	function init()
	{
		//If the game begin
		timer();
		if(!game_over_status && !time_over) {
			direction = "right"; //default direction
			create_eater();
			init_token(); //Now we can see the token particle
			//finally lets display the score
			score = 0;
			
			//Lets move the eater now using a timer which will trigger the paint function
			//every 60ms
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
		var length = 1; //Length of the eater
		eater_array = []; //Empty array to start with
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
		//To avoid the eater trail we need to paint the BG on every frame
		//Lets paint the canvas now

		empty_canvas();
		
		//The movement code for the eater to come here.
		//The logic is simple
		//Pop out the tail cell and place it infront of the head cell
		var nx = eater_array[0].x;
		var ny = eater_array[0].y;
		//These were the position of the head cell.
		//We will increment it to get the new head position
		//Lets add proper direction based movement now

		if(direction == "right") nx++;
		else if(direction == "left") nx--;
		else if(direction == "up") ny--;
		else if(direction == "down") ny++;
		
		//Lets add the game over clauses now
		//This will restart the game if the eater hits the wall
		//Lets add the code for body collision
		//Now if the head of the eater bumps into its body, the game will restart
		if(nx == -1 || nx == width_canvas/cell_size_px || ny == -1 || ny == high_canvas/cell_size_px || check_collision(nx, ny, eater_array))
		{
			delete_canvas();
			game_over_status = true;
			init();
			//Lets organize the code a bit now.
			//return;
		}
		if(time_over)
		{
			time_over = true;
			init();
		}
		
		//Lets write the code to make the eater eat the token
		//The logic is simple
		//If the new head position matches with that of the token,
		//Create a new head instead of moving the tail
		var cd = false;
		var position_to_create;
		for(var i =0; i <token.length; i++){
			if(nx == token[i].x && ny == token[i].y){
				cd =true;
				position_to_create = i;
				break;
			}
		}
		if(cd)
		{
			var tail = {x: nx, y: ny};
			score = score+token[position_to_create].value;
			//Create new token
			create_token(position_to_create);
		}
		else
		{
			var tail = eater_array.pop(); //pops out the last cell
			tail.x = nx; tail.y = ny;
		}

		//The eater can now eat the food.
		
		eater_array.unshift(tail); //puts back the tail as the first cell
		
		for(var i = 0; i < eater_array.length; i++)
		{
			var c = eater_array[i];
			//Lets paint 10px wide cells
			paint_eater_cell(c.x, c.y);
		}
		
		//Lets paint the token
		for(var i = 0; i < token.length; i++){
			paint_cell(token[i].x, token[i].y,token[i].value);
		}
		//Lets paint the score
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
		//draw_dwarf(x, y);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cell_size_px, y*cell_size_px, cell_size_px, cell_size_px);
	}

	function draw_dwarf(x, y)
	{
		dwarf_image = new Image();
		dwarf_image.onload = function(){
			ctx.drawImage(dwarf_image, x, y);
		};
		dwarf_image.src = 'pacman.png';
	}
	
	function check_collision(x, y, array)
	{
		//This function will check if the provided x/y coordinates exist
		//in an array of cells or not
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	//Lets add the keyboard controls now
	$(document).keydown(function(e){
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37" && direction != "right") direction = "left";
		else if(key == "38" && direction != "down") direction = "up";
		else if(key == "39" && direction != "left") direction = "right";
		else if(key == "40" && direction != "up") direction = "down";
		//The snake is now keyboard controllable
	})
	
	
})