$(document).ready( function() 
{
  var animate, canvas, connection, context, id, sendDirection, server, PORT, HOST, current_direction;

  //Canvas stuff
  canvas = $("#canvas");
  context = canvas.get(0).getContext("2d");

  id = null;
  server = null;
  HOST = "http://esir-project";
  PORT = 8090;

  var client = {
    'name' : pseudo
  };

  sendDirection = function(direction) 
  {
    if (server) 
    {
      return server.emit("direction", direction);
    }
  };

  // animes all the other players
  animate = function(players) 
  {
    var element, snake, x, y, nb_player, result;
    context.fillStyle = 'rgb(230,230,230)';
    for (x = 0; x <= 59; x++) 
    {
      for (y = 0; y <= 59; y++) 
      {
       context.fillRect(x * 10, y * 10, 9, 9);
     }
   }
   result = [];
   for (var i = 0, nb_player = players.length; i < nb_player; i++) 
   {
      // get the number i player's snake
      snake = players[i];
      // the client player is red while others are black

      //TODO : server must give a color to a gamer
      context.fillStyle = snake.id === id ? 'rgb(51,0,204)' : 'rgb(0,0,0)';
      // add its data to the result of which object will be animated
      result.push((function() 
      {
        var snake_length, snake_elements, temp_result;
        snake_elements = snake.elements;
        temp_result = [];
        for (j = 0, snake_length = snake_elements.length; j < snake_length; j++) 
        {
          element = snake_elements[j];
          x = element[0] * 10;
          y = element[1] * 10;
          temp_result.push(context.fillRect(x, y, 9, 9));
        }
        return temp_result;
      })());
    }
    return result;
  };

  // definition connection to the websocket
  connection = function() 
  {
    server = io.connect(HOST+":"+PORT);
    server.emit("newClient", client);

    server.on("id", function(value) 
    {
      id = value;
    });

    server.on("update", function(list_players) 
    {
      animate(list_players); 
    });
  };


  // connection established
  connection();

  // return direction taken by the player.
  $(document).keydown(function(event) 
  {
    var key, command;
    key = event.which;
    switch (key) {
      case 81: // Q
      command = "left";
      break;
      case 90: // Z
      command = "up";
      break;
      case 68: // D
      command = "right";
      break;
      case 83: // S
      command = "down";
      break;
    }
    if(command != null)
    {
      sendDirection(command);
    }
  });
});

