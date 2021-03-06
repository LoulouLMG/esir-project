var _Player = require('./player.js');
var _Snake = require('./snake.js');

/* Token Class ********************************************************************************************************/
Token = (function() 
{
  // constructor
  function Token() 
  {
    this.init();  
  }

  Token.prototype.init = function() 
  {
    this.type = null;
    // a random type is attributed to the token
    this.randomizeType();
    // a random coordonnate is attributed to the token
    this.randomizePosition();
  };

  Token.prototype.decreaseLifeSpan = function()
  {
    this.type.lifespan = this.type.lifespan - 1;
  };


  Token.prototype.randomizeType = function() 
  {
    var rand = Math.floor(Math.random() * 7);
    // a type is attributed to the token
    if(rand <= 3)
    {
      this.type = new TOKEN_TYPE("SMALL");
    }
    if(rand > 3 && rand <= 5)
    {
      this.type = new TOKEN_TYPE("MEDIUM");
    }
    if(rand == 6)
    {
      this.type = new TOKEN_TYPE("BIG");
    }
  };

  Token.prototype.randomizePosition = function() 
  {
    var position;
    var rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
    x = rand;
    rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
    y = rand;
    position = [x, y];
    // we check if the coordonates are available
    for(var i in players.elements)
    {
      while(i == position)
      {
        position[0]++;
        position[1]++;
        if( position[0] == LAST_TILE_COORDONATE + 1)
        {
          position[0] = 0;
        }
        if( position[1] == LAST_TILE_COORDONATE + 1)
        {
          position[1] = 0;
        }
      }
    }
    for(var i in tokens)
    {
      while(i == position)
      {
        position[0]++;
        position[1]++;
        if( position[0] == LAST_TILE_COORDONATE + 1)
        {
          position[0] = 0;
        }
        if( position[1] == LAST_TILE_COORDONATE + 1)
        {
          position[1] = 0;
        }
      }
    }
    this.position = position;
  };
  return Token;
})();

/* Snake Class **********************************************************************************************************/
Snake = (function() 
{
  // constructor
  function Snake(id, name, color) 
  {
    this.id = id;
    this.name = name;
    this.color = color;
    this.score = 0;
    this.ready = false;
    this.reset();
  }    

  Snake.prototype.grow = function(points) 
  {
    for(var i = 0; i < points; i++)
    {
      // add the tail on fake coordonnates to not display it on the map
      this.length = this.elements.unshift([-1, -1]);
    }
    // increase score with each grow
    this.score += points * 10; 
  };

  // init a snake in a random position
  Snake.prototype.reset = function() 
  {
    this.length = LENGTH_INIT;
    this.direction = "right";
    this.elements = (function() 
    {
      var  result, i, rand;
      result = [];
      // we choice to place the player on a random location on Y axis (1)
      rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
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
  Snake.prototype.checkCollisionWithPlayer = function(other) 
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

  // collision with token
  Snake.prototype.checkCollisionWithToken = function() 
  {
    var collision, element, token, head;
    head = this.head();
    
    for (var i = 0, nb_token = tokens.length; i < nb_token; i++) 
    {
      token = tokens[i];

      if (head[0] === token.position[0] && head[1] === token.position[1]) 
      {
        this.grow(token.type.worth);
        token.init();
      }
    }
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
/* Token type class ***********************************************************************************************************/
TOKEN_TYPE = (function()
{
  // constructor
  function TOKEN_TYPE(init_type) 
  {
    var type;
    switch(init_type)
    {
      case "SMALL" :
      type = 
      {
        worth: 1, 
        name: "small", 
        color: "rgb(0,0,0)",
        lifespan: 10
      }; break ;
      case "MEDIUM":
      type = 
      {
        worth: 2, 
        name: "medium", 
        color: "rgb(255,204,0)",
        lifespan: 7
      }; break ;
      case "BIG"   :
      type = 
      {
        worth: 4, 
        name: "big", 
        color: "rgb(204,0,0)",
        lifespan: 4
      }; break ;
      default : console.log("Strange behavior detected on Token_type constructor."); return ;  
    }

    this.worth = type.worth;
    this.lifespan = type.lifespan;
    this.name = type.name;
    this.color = type.color;

  }    
  return TOKEN_TYPE;
})();


/* Server ********************************************************************************************************************/
function handler (req, res) 
{
  fs.window.location("<?php echo URL?>");
}

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var client_id = 0;
var client_color = null;

players = [];
tokens = [];

var LAST_TILE_COORDONATE = 59;
var LENGTH_INIT = 1;
var PORT = 8090;
var NB_TOKENS = 15;
var TIMER = 60;
var game_timer;
var session = false;

app.listen(PORT);

for(var i = 0; i < NB_TOKENS; i++)
{
  var token = new Token();
  tokens.push(token);
}

/* Connections handling ***************************************************************************************************/
io.on('connection', function (socket) 
{
  var _clientId, _clientSnake, _data_client;
  // We give an id to the newcomer, all new id is increased
  _clientId = client_id ++;
  client_color = getRandomColor();
  var _data_client = {
    "id" : _clientId,
    "ready": false,
    "color" : client_color
  };  

  var toto = new _Player("BULBIZZAR");
  console.log("Player : "+JSON.stringify(toto));
  var init_sanke = {
    id: 1,
    color: "rouge",
    length: 8
  }
  var titi = new _Snake(init_sanke);
  console.log("Snake : "+JSON.stringify(titi));
  toto.setSnake(titi);
  console.log("Player + Snake :"+JSON.stringify(toto));

  // the server send his id, color and score to the client
  socket.emit("confirm", _data_client);
  console.log("Client " + _data_client.color + "connected");

  socket.on("client", function(name) 
  {
    console.log("Client " + _clientId + " is:" + name);
    // A snake is attributed to the new client
    _clientSnake = new Snake(_clientId, name, client_color);
    // the new snake is added to the list

    players.push(_clientSnake);
  });

  socket.on("ready", function() 
  {
    console.log(_clientSnake.name+" ready !");
    var i = players.indexOf(_clientSnake);
    if(i != -1) 
    {
      players[i].ready = true;
    }
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

var all_ready = false;
/* Update Game State and notify players *************************************************************************************/
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
    var entities = {
      "players" : players,
      "tokens"  : tokens
    }

    io.sockets.emit("update", entities);
    //check if at least 2 players are ready

    if(players.length>1 && !all_ready)
    {
      var nb_ready = 0;
      for(var i = 0 ; i < players.length ; i++)
      {
        if(players[i].ready)
        {
          nb_ready ++;
        }
      } 
      if(nb_ready == players.length)
      {
        console.log("GREEN ? :" + all_ready);
        all_ready = true;
        io.sockets.emit("start", TIMER);
        for(var i = 0 ; i < players.length ; i++)
        {
          players[i].ready = false;
        }
        startGame();
        session = true;
      }
    }
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
        if (other.checkCollisionWithPlayer(current_player)) 
        {
          // if player crashed against another player, the other player grows and the player dies
          dead_players.push(current_player);
          other.grow(6);
        }
      }
    }
    current_player.checkCollisionWithToken();
  }
  for (k = 0, nb_dead_players = dead_players.length; k < nb_dead_players; k++) 
  {
    current_player = dead_players[k];
    result.push(current_player.reset());
  }
  return result;
};

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

updateLifeSpan = function() 
{
  var token;
  for(var i = 0, nb_token = tokens.length; i < nb_token; i++)
  {
    token = tokens[i];
    if(token.type.lifespan > 1)
    {
      token.decreaseLifeSpan();
    }
    else
    {
      token.init();
    }
  }
};

startGame = function()
{
  for(var i = 0 ; i < players.length; i++)
  {
    players[i].reset();
    players[i].ready = false;
    players[i].score = 0;
  }
  startTimer();
};

var counter = null;
function startTimer()
{ 

  game_timer = TIMER;
  console.log("Nouvelle partie");
  counter = setInterval(timer,1000);
}

function timer()
{
  game_timer --;
  console.log(game_timer);
  if (game_timer == 0)
  {
    clearInterval(counter);
    console.log("Partie finie");
    var winner = retriveWinner();
    io.sockets.emit("stop", winner);
    all_ready = false;
    return;
  }
}

retriveWinner = function()
{
  var winner = "Chuck Norris";
  var scores = [];
  for(var i = 0; i < players.length ; i ++)
  {
    scores.push(players[i].score);
  }
  var max = Math.max.apply(Math, scores);
  var temp = scores.indexOf(max);
  winner = players[temp].name;
  return winner;
}


var tick = setInterval(updateState, 50);

var tack = setInterval(updateLifeSpan, 1000);