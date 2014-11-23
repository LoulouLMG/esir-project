
/* Server *******************************************************************************/
function handler (req, res) 
{
  fs.window.location("<?php echo URL?>");
}

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');


var client_id = 0;

players = [];

var LAST_TILE_COORDONATE = 59;
var PORT = 8090;

var colorPlayer;
var posBegin;
var LENGTH_INIT = 5;


app.listen(PORT);

/* Connections handling ********************************************************************/
io.on('connection', function (socket) 
{
  var _clientId, _clientSnake;
  // We give an id to the newcomer, all new id is increased
  _clientId = client_id ++;  
  // the server send his id to the client
  socket.emit("id", _clientId);
  console.log("Client connected");

  socket.on("newClient", function(client) 
  {
    console.log("Client " + _clientId + " is:" + client.name);
    // A snake is attributed to the new client
    _clientSnake = new Snake(_clientId, client.name);
    // the new snake is added to the list

    players.push(_clientSnake);
  });

  socket.on("direction", function(direction) 
  {
    _clientSnake.direction = direction;
  });

  socket.on("disconnect", function() {
    var i = players.indexOf(_clientSnake);
    if(i != -1) 
    {
      players.splice(i, 1);
    }
    console.log("Client " + _clientId + " disconnected");
    //client_id --;
  });

});

/* Snake Class *************************************************************************************/
Snake = (function() 
{
  // constructor
  function Snake(id, name) 
  {
    this.id = id;
    this.name = name;
    this.reset();
  }    

  Snake.prototype.grow = function() 
  {
    return this.length = this.elements.unshift([-1, -1]);
  };

  // init a snake in a random position
  Snake.prototype.reset = function() {
    this.length = LENGTH_INIT;
    this.direction = "right";
    this.elements = (function() 
    {
      var  result, i, rand;
      result = [];
      // we choice to place the player on a random location on Y axis (1)
      rand = Math.floor(Math.random() * 59);
      for (i = 0; i<this.length; i++) {
        result.push([i, rand]);
      }
      return result;
    }).call(this);
  };

  Snake.prototype.update = function() 
  {
    var i, snake_body;
    for (i = 0, snake_body = this.length - 2;  i <= snake_body; i++) 
    {
      this.moveBody(i);
    }
    return this.moveHead();
  };

  Snake.prototype.moveBody = function(i) 
  {
    this.elements[i][0] = this.elements[i + 1][0];
    this.elements[i][1] = this.elements[i + 1][1];
  };

  Snake.prototype.moveHead = function() 
  {
    var head;
    head = this.length - 1;
    switch (this.direction) 
    {
      case "left":
      this.elements[head][0] -= 1;
      break;
      case "right":
      this.elements[head][0] += 1;
      break;
      case "up":
      this.elements[head][1] -= 1;
      break;
      case "down":
      this.elements[head][1] += 1;
    }
    // check when the player arrive near a border to respawn him on its opposite border
    if (this.elements[head][0] < 0) 
    {
      this.elements[head][0] = LAST_TILE_COORDONATE;
    }
    if (this.elements[head][1] < 0) 
    {
      this.elements[head][1] = LAST_TILE_COORDONATE;
    }
    if (this.elements[head][0] > LAST_TILE_COORDONATE) 
    {
      this.elements[head][0] = 0;
    }
    if (this.elements[head][1] > LAST_TILE_COORDONATE) 
    {
      this.elements[head][1] = 0;
    }
  };

  Snake.prototype.head = function() 
  {
    return this.elements[this.length - 1];
  };

  // collision with other players
  Snake.prototype.checkCollisionWith = function(other) 
  {
    var collision, element, other_head, current_snake_elements;
    other_head = other.head();
    collision = false;
    current_snake_elements = this.elements;
    // we check the collsions on the body and the head of the snake
    for (var i = 0, current_snake_size = current_snake_elements.length; i < current_snake_size; i++) 
    {
      element = current_snake_elements[i];
      // for each element, if another head is on the same tile of it, then the snake must kill the other snake
      if (other_head[0] === element[0] && other_head[1] === element[1]) 
      {
        // and their is a collision between the snake body and an other snake.
        collision = true;
      }
    }
    return collision;
  };

  // collision with ourselves
  Snake.prototype.checkSuicide = function() 
  {
    var collision, head;
    head = this.head();
    collision = false;
    // we check if the head's player collide with his body
    for (var i = 0, body_size = this.length - 2; i <= body_size; i++) 
    {
      if (head[0] === this.elements[i][0] && head[1] === this.elements[i][1]) 
      {
        collision = true;
      }
    }
    return collision;
  };
  return Snake;
})();

/* Update Game State and notify players*/
updateState = function() 
{
  var i, nb_player;
  for (i = 0, nb_player = players.length; i < nb_player; i++) 
  {
    players[i].update();
  }

  checkCollisions();
  // send the list of all players to all players
  if(players.length>0)
  {
    io.sockets.emit("update", players);
  }
};
checkCollisions = function() {
  var other, dead_players, current_player, i, j, k, nb_player, nb_dead_players, result;
  dead_players = [];
  result = [];
  for (i = 0, nb_player = players.length; i < nb_player; i++) 
  {
    current_player = players[i];
    if (current_player.checkSuicide()) 
    {
      dead_players.push(current_player);
    }
    for (j = 0; j < nb_player; j++) 
    {
      other = players[j];
      if (other !== current_player) 
      {
        if (other.checkCollisionWith(current_player)) 
        {
          // if player crashed against another player, the other player grows and the player dies
          dead_players.push(current_player);
          other.grow();
        }
      }
    }
  }
  for (k = 0, nb_dead_players = dead_players.length; k < nb_dead_players; k++) 
  {
    current_player = dead_players[k];
    result.push(current_player.reset());
  }
  return result;
};

tick = setInterval(updateState, 100);

