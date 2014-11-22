$(document).ready( function() 
{
  var animate, canvas, connect, context, id, sendDirection, server, PORT, HOST;

  //Canvas stuff
  canvas = $("#canvas");
  context = canvas.get(0).getContext("2d");

  id = null;
  server = null;
  HOST = "http://esir-project/";
  PORT = 8090;

  sendDirection = function(direction) 
  {
    if (server) 
    {
      return 
      server.send(JSON.stringify(
      {
        'direction': direction
      }
      ));
    }
  };

  // animes all the other players
  animate = function(players) 
  {
    var element, snake, x, y, nb_player, result;
    context.fillStyle = 'rgb(230,230,230)';
    for (x = 0; x <= 69; x++) 
    {
      for (y = 0; y <= 69; y++) 
      {
       context.fillRect(x * 10, y * 10, 9, 9);
     }
   }
   result = [];
   for (var i = 0, nb_player = players.length; i < nb_player; i++) 
   {
      // get the number i player's snake
      snake = players[i];
      context.fillStyle = snake.id === id ? 'rgb(170,0,0)' : 'rgb(0,0,0)';
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
  connect = function() 
  {
    server = new io.Socket( HOST, 
    {
      'port': PORT;
    }
    );
    server.connect();
    return 
    server.on("message", function(event) 
    {
      var message;
      message = JSON.parse(event);
      switch (message.type) 
      {
        case 'id':      return id = message.value;
        case 'players':  return animate(message.value);
      }
    });
  };

  // connection established
  connect();

  // return direction taken by the player.
  return $(document).keydown(function(event) 
  {
    var key;
    key = event.keyCode ? event.keyCode : event.which;
    switch (key) {
      case 113: // Q
      return sendDirection("left");
      case 122: // Z
      return sendDirection("up");
      case 100: // D
      return sendDirection("right");
      case 115: // S
      return sendDirection("down");
    }
  });
});
