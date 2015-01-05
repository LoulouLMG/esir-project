/************************************************************************************************************************/
/*@Authors  Solofeed, ErwanTrain                                                                                        */
/* Configuration constants loaded here **********************************************************************************/
var config = require('./config.js');
/* we get the last coordonate of the map */
var nb_tile_Y = config.nb_tile_height;
var nb_tile_X = config.nb_tile_width;
/* we get all other parameters */
var length_init = config.length_init;
var server_port = config.server_backup_port;
var token_number = config.token_number;
var game_timer = config.game_timer;
var tick_rate = config.tick_rate;
var grow_after_kill = config.grow_after_kill;
/* Imports the class prototypes */
var Player = require('./player.js');
var Snake = require('./snake.js');
var Token = require('./token.js');
/* End configuration constants loaded here ******************************************************************************/
/************************************************************************************************************************/
/* Server initialisation ************************************************************************************************/
function handler (req, res) 
{
  fs.window.location("<?php echo URL?>");
}

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

/* To test when all connected players are ready */
var all_ready = false;
/* Timer of the game*/
var game_time = 0;
/* stores the setInterval(timer, duration) of the game*/
var counter = null;

/* To know if a game is run or not */
var session = false;

/* global server variable for store players and tokens */
_PLAYER_LIST = [];
_TOKEN_LIST = [];


var _WRAP = {
    players: _PLAYER_LIST,
    tokens: _TOKEN_LIST
}

/* Tokens initialization */
for(var i = 0; i < token_number; i++)
{
  var token = new Token(_WRAP);
  _TOKEN_LIST.push(token);
}

app.listen(server_port);
/* End server initialisation ********************************************************************************************/
/************************************************************************************************************************/
/* Connections handling *************************************************************************************************/
io.on('connection', function (socket) 
{
  var client, snake; 

  console.log("Client connected");

  // when a client send his name after his connection is established
  socket.on("client", function(name) 
  {
    console.log(name + " !");
    // We store the client's informations in _PLAYER_LIST
    client = new Player(name);
    // A snake is attributed to the new client
    snake = new Snake(
    {
      color: getRandomColor(),
      dimension: length_init
    }
    );
    client.setSnake(snake);
    _PLAYER_LIST.push(client);
  });

  // when a client send his ready signal
  socket.on("ready", function() 
  {
    console.log(client.getName()+" ready !");
    client.setReady(true);
  });

  // when a client send a direction command
  socket.on("direction", function(direction) 
  {
    client.setDirection(direction);
  });

  // when a client disconnects
  socket.on("disconnect", function() {
    console.log(client.getName() + " disconnected");
    var i = _PLAYER_LIST.indexOf(client);
    if(i != -1) 
    {
      // removes the client from player list
      _PLAYER_LIST.splice(i, 1);
    }
    // client removed
    client = null;
  });
});
/* End Connections handling *********************************************************************************************/
/************************************************************************************************************************/
/* Update Game State and notify players *********************************************************************************/
//toto = 0;
updateState = function() 
{
  /*
  toto++;
  if(toto==40)
  {
    console.log("------------------------------------------------------------------------------------------------------");
    console.log("Nombre joueurs: " + _PLAYER_LIST.length);
    console.log("Nombre tokens: " + _TOKEN_LIST.length);
    console.log("JOUEURS : "+JSON.stringify(_PLAYER_LIST) );
    console.log("TOKENS : "+JSON.stringify(_TOKEN_LIST) );
    toto = 0;
  }
  */

  var nb_players = _PLAYER_LIST.length;
  // update all players snake
  for (var i = 0; i < nb_players; i++) 
  {
    _PLAYER_LIST[i].moveSnake();
  }
  // Check all the collisions types
  checkCollisions();
  // send the list of all players to all players
  if(_PLAYER_LIST.length>0)
  {
    var data = {
      "players" : _PLAYER_LIST,
      "tokens"  : _TOKEN_LIST
    }

    io.sockets.emit("update", data);
    //check if at least 2 players are ready

    if(nb_players>1 && !all_ready)
    {
      var nb_ready = 0;
      for(var i = 0 ; i < nb_players ; i++)
      {
        if(_PLAYER_LIST[i].isReady())
        {
          nb_ready ++;
        }
      } 
      // If everybody is ready
      if(nb_ready == nb_players)
      {
        all_ready = true;
        // send start signal to all players
        io.sockets.emit("start", game_timer);
        for(var i = 0 ; i < nb_players ; i++)
        {
          _PLAYER_LIST[i].ready = false;
        }
        // start the game mecanics
        startGame();
        // indicate that a session is on playing
        session = true;
      }
    }
  }
};

/**
* Check all colisions (with tokens, players, self)
*/
checkCollisions = function() {
  var other, dead_players, current_player, nb_players, nb_dead_players, result;
  /* An array for player which will be init after the current tick*/
  dead_players = [];
  result = [];
  nb_players = _PLAYER_LIST.length;
  for (var i = 0; i < nb_players; i++) 
  {
    current_player = _PLAYER_LIST[i];
    var player_snake = current_player.getSnake();
    // check collision with ourselves
    if (player_snake.checkSuicide()) 
    {
      dead_players.push(current_player);
    }
    for (var j = 0; j < nb_players; j++) 
    {
      other = _PLAYER_LIST[j];
      var other_snake = other.getSnake();
      // test collision with an other snake
      if (other_snake !== player_snake) 
      {
        if (other_snake.checkCollisionWithPlayer(player_snake)) 
        {
          // if player crashed against another player, the other player grows and the player dies
          dead_players.push(current_player);
          other_snake.grow(grow_after_kill);
        }
      }
    }
    // test collision with token
    player_snake.checkCollisionWithToken(_WRAP);
    current_player.setScore(player_snake.getScore());
  }
  for (var i = 0, nb_dead_players = dead_players.length; i < nb_dead_players; i++) 
  {
    current_player = dead_players[i];
    // reinitialize the "dead" player's snake
    result.push(current_player.resetSnake(0, length_init));
  }
  return result;
};

/**
* Generates a random color
*/
function getRandomColor() {
  //TODO : find a way to be always visible on the map
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
* Decrease all the tokens lifespan
*/
updateLifeSpan = function() 
{
  var token;
  for(var i = 0, nb_token = _TOKEN_LIST.length; i < nb_token; i++)
  {
    token = _TOKEN_LIST[i];
    if(token.getType().lifespan > 1)
    {
      token.decreaseLifeSpan();
    }
    else
    {
      token.init(_WRAP);
    }
  }
};

/**
* Starts the game
*/
startGame = function()
{
  for(var i = 0 ; i < _PLAYER_LIST.length; i++)
  {
    var current_player = _PLAYER_LIST[i];
    current_player.resetSnake(0, length_init);
    current_player.setReady(false);
  }
  startTimer();
};


function startTimer()
{ 
  /* initialize the chrono with the configured time in config.js file*/
  game_time = game_timer;
  // creation of the counter
  counter = setInterval(timer,1000);
}

function timer()
{
  // decrease the chrono
  game_time --;
  if (game_time == 0)
  {
    // stop the counter
    clearInterval(counter);
    var winner = retriveWinner();
    // send stop game message to all clients
    io.sockets.emit("stop", winner);
    // players are enabled to lauch a new game session
    all_ready = false;
    return;
  }
}

/**
* Determines the winner (who have the most points)
*/
retriveWinner = function()
{
  console.log("BEFORE WIN: "+JSON.stringify(_PLAYER_LIST));
  var winner = "Chuck Norris";
  var scores = [];
  for(var i = 0; i < _PLAYER_LIST.length ; i ++)
  {
    scores.push(_PLAYER_LIST[i].getScore());
  }
  var max = Math.max.apply(Math, scores);
  var temp = scores.indexOf(max);
  console.log("INDEX WINNER: "+temp);
  winner = _PLAYER_LIST[temp]._name;
  return winner;
}
// gloab tick rate control timer
var tick = setInterval(updateState, tick_rate);
// global token's lifespan timer
var tack = setInterval(updateLifeSpan, 1000);
/* End Update Game State and notify players *****************************************************************************/