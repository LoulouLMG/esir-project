
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

var WIDTH = 600;
var HEIGHT = 600;
var PORT = 8090;

var colorPlayer;
var posBegin;
var LENGTH_INIT = 5;


app.listen(PORT);

var test = null;

/* Connections handling ********************************************************************/
io.on('connection', function (socket) 
{
  test = socket;
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
    console.log("Direction " + direction + " - client: " + _clientSnake.name);
    _clientSnake.direction = direction;
  });

  socket.on("disconnect", function() {
    players.remove(_clientSnake);
    console.log("Client " + _clientId + " disconnected");
    client_id --;
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
    console.log("start position: "+this.head());
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
      this.elements[head][0] = WIDTH;
    }
    if (this.elements[head][1] < 0) 
    {
      this.elements[head][1] = HEIGHT;
    }
    if (this.elements[head][0] > WIDTH) 
    {
      this.elements[head][0] = 0;
    }
    if (this.elements[head][1] > HEIGHT) 
    {
      this.elements[head][1] = 0;
    }
  };

  Snake.prototype.head = function() 
  {
    return this.elements[this.length - 1];
  };

  // collision with other players
  Snake.prototype.blocks = function(other) 
  {
    var collision, element, head, _i, _len, _ref;
    head = other.head();
    collision = false;
    _ref = this.elements;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) 
    {
      element = _ref[_i];
      if (head[0] === element[0] && head[1] === element[1]) 
      {
        collision = true;
      }
    }
    return collision;
  };

  // collision with ourselves
  Snake.prototype.blocksSelf = function() 
  {
    var collision, head, i, _ref;
    head = this.head();
    collision = false;
    for (i = 0, _ref = this.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) 
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

/* Update Game State */
updateState = function() 
{
  var i, nb_player;
  for (i = 0, nb_player = players.length; i < nb_player; i++) 
  {
    players[i].update();
  }

  checkCollisions();
  // send the list of all players to all players
  if(test !== null)
    test.broadcast.emit("update", players);
};
checkCollisions = function() {
  var other, dead_players, current_player, i, j, k, nb_player, nb_dead_players, result;
  dead_players = [];
  result = [];
  for (i = 0, nb_player = players.length; i < nb_player; i++) 
  {
    current_player = players[i];
    if (current_player.blocksSelf()) 
    {
      dead_players.push(current_player);
    }
    for (j = 0; j < nb_player; j++) 
    {
      other = players[j];
      if (other !== current_player) 
      {
        if (other.blocks(current_player)) 
        {
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



