$(document).ready( function() 
{
  var animate, canvas, score_board, connection, context, id, sendDirection, server, PORT, HOST, current_direction, list_players;

  var client_timer = $("#timer");
  var game_timer = 0;
  var counter =null;
  var reconnect = false;

  //Canvas stuff
  canvas = $("#canvas");
  context = canvas.get(0).getContext("2d");

  //Score canva stuff
  score_board = $("#score_board");

  id = null;
  server = null;
  HOST = data.host;
  PORT = data.port;

  var client = {
    "name" : data.pseudo,
  };

  list_players = [];

  updateScoreBoard = function()
  {
    var display = "";
    for(var i = 0 ; i < list_players.length ; i++)
    {
      var player = list_players[i];
      var score = player._score;
      var color = player._snake._color;
      var name = player._name;
      var ready = player._ready ? " ready !" : "";
      var strong_G = ready ? "<strong>" :"";
      var strong_D = ready ? "</strong>" :"";
      display += "<li><font color=" + color + ">" + strong_G + name + ": " + score + "\t" + ready + strong_D +"</font></li>\n";
    }
    score_board.html("<ul>"+display+"</ul>");
  };

  sendDirection = function(direction) 
  {
    if (server) 
    {
      return server.emit("direction", direction);
    }
  };

  sendReady = function()
  {
    if (server) 
    {
      return server.emit("ready");
    }
  };

  function startTimer()
  {
    counter = setInterval(timer,1000);
  }

  function timer()
  {
    game_timer --;
    if (game_timer == 0)
    {
      console.log(game_timer);
      clearInterval(counter);
      return;
    }
    client_timer.html("<span style=\"font-weight:bolder\">"+game_timer+"</span>");
  }

  // animes all the other players
  animate = function(entities) 
  {
    var element, snake, player, x, y, result;
    var players = entities.players;
    var tokens = entities.tokens;
    context.fillStyle = 'rgb(230,230,230)';
    
    for (x = 0; x <= 59; x++) 
    {
      for (y = 0; y <= 59; y++) 
      {
       context.fillRect(x * 10, y * 10, 9, 9);
     }  
   }
   result = [];
   
   // display tokens
   for (var i = 0, nb_tokens = tokens.length; i < nb_tokens; i++) 
   {
      // get the number i player's snake
      token = tokens[i];
      context.fillStyle = token._type.color;
      
      // add its data to the result of which object will be animated
      (function() 
      {
        position = token._position;
        x = position.X * 10;
        y = position.Y * 10;
        context.fillRect(x, y, 9, 9);
      })();
    } 
    //display players
    for (var i = 0, nb_player = players.length; i < nb_player; i++) 
    {
      // get the number i player's snake
      player = players[i];
      snake = player._snake;
      if(player._name === client.name)
      {
        current_direction = snake._direction;
        console.log("direction : "+current_direction);
      }
      // color of player
      context.fillStyle = snake._color;
      // add its data to the result of which object will be animated
      result.push((function() 
      {
        var snake_length, snake_elements, temp_result;
        snake_elements = snake._elements;
        temp_result = [];
        for (j = 0, snake_length = snake_elements.length; j < snake_length; j++) 
        {
          element = snake_elements[j];
          x = element.X * 10;
          y = element.Y * 10;
          temp_result.push(context.fillRect(x, y, 9, 9));
        }
        return temp_result;
      })());
    }
    return result;
  };

  // definition connection to the websocket
  connection = function(port) 
  {
    server = io.connect(HOST+":"+port);
    server.emit("client", client.name);
    if(port==8091)
      console.log("Reconnected !")
    server.on("update", function(entities) 
    {
      list_players = entities.players;
      animate(entities);
      updateScoreBoard(); 
    });

    server.on("start", function(timer) 
    {
      game_timer = timer;
      startTimer();  
    });

    server.on("stop", function(winner) 
    {
      client_timer.html("<span style=\"font-weight:bolder\">Le vainqueur est : "+winner+"</span>");
    });

    server.on("disconnect", function() 
    {
      client_timer.html("<span style=\"font-weight:bolder\">Main Server is Down !</span>");
      console.log("Reconnecting ...")
      server.disconnect();
      reconnect = true;
      connection(8091);
    });
  };

  // connection established
  connection(PORT);

  if(reconnect)
    connection(8091);

  
  // return direction taken by the player.
  $(document).keydown(function(event) 
  {
    var key, command;
    key = event.which;
    
    switch (key) {
      case (81||37): // Q
      if(current_direction != "right")
      {
        command = "left";
      }
      break;
      case 90: // Z
      if(current_direction != "down")
      {
        command = "up";
      }
      break;
      case 68: // D
      if(current_direction != "left")
      {
        command = "right";
      }
      break;
      case 83: // S
      if(current_direction != "up")
      {
        command = "down";
      }
      break;
    }
    if(command != null)
    {
      sendDirection(command);
    }
  });
});


