/************************************************************************************************************************/
/*@Authors  Solofeed, ErwanTrain  
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
/* global server variable for store players and tokens */
_PLAYER_LIST = [];
_TOKEN_LIST = [];


var _WRAP = {
  players: _PLAYER_LIST,
  tokens: _TOKEN_LIST
}

/* Start server idle ****************************************************************************************************/
var master = require('././node_modules/socket.io/node_modules/socket.io-client');

var startBackup = false;
var compteur = 0
var _WRAP_RECEIVED = null;

backUp = function() 
{
  var socket = master.connect('http://esir-project:8090');

  socket.on('connect', function () 
  { 
    console.log("Connected to Master server ! ");
    socket.emit('slave');
  });

  socket.on('updateSlave', function (data) 
  { 

    compteur++
    if(compteur>40)
    {
      console.log(JSON.stringify(data));
      compteur = 0;
    }
    _WRAP_RECEIVED = data;
  });

  socket.on('disconnect', function () 
  { 
    console.log("Main Server is down, initialisation ...")
    startBackup = true;
    fillWrap();
    console.log("Running ...")
  });
};
// connection established
backUp();


fillWrap = function()
{
  fillPlayerList()
  fillTokenList();
};

fillPlayerList = function()
{
  for(var i=0; i< _WRAP_RECEIVED.players.length; i++)
  {
    var player_received = _WRAP_RECEIVED.players[i];
    var newPlayer = new Player(player_received._name);
    newPlayer._score = player_received._score;
    newPlayer._ready = player_received._ready;
    var snake_received = player_received._snake;

    var newSnake = new Snake(
    {
      color: snake_received._color,
      dimension: length_init
    }
    );
    newSnake._length = snake_received._length;
    newSnake._direction = snake_received._direction;
    newSnake._score = snake_received._score;
    newSnake._elements = (function()
    {
      var result = [];
      for(var j=0; j<snake_received._elements.length;j++)
      {
        var k = snake_received._elements[i];
        var x = k.X;
        var y = k.Y; 
        result.push({"X": x,"Y": y})
      }
      return result;
    }).call(this);

    newPlayer.setSnake(newSnake);
    _PLAYER_LIST.push(newPlayer);
  }
};

fillTokenList = function()
{
  for(var i=0; i< _WRAP_RECEIVED.tokens.length; i++)
  {
    var token_received = _WRAP_RECEIVED.tokens[i];
    var newToken = new Token(null);

    newToken._type.worth = token_received._type.worth;
    newToken._type.lifespan = token_received._type.lifespan;
    newToken._type.name = token_received._type.name;
    newToken._type.color = token_received._type.color;

    newToken._position = token_received._position;

    _TOKEN_LIST.push(newToken);
  }
};

/* End idle state *******************************************************************************************************/
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
    for(var i=0; i<_WRAP.players.length;i++)
    {
      var player = _WRAP.players[i]
      if(player._name==name){
        client = player;
        return;
      }
    }
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
toto = 0;
updateState = function() 
{

  if(startBackup)
  {
    toto++;
    if(toto==40)
    {

      console.log("------------------------------------------------------------------------------------------------------");
      /*
      console.log("Nombre joueurs: " + _WRAP..length);
      console.log("Nombre tokens: " + _TOKEN_LIST.length);
      console.log("JOUEURS : "+JSON.stringify(_PLAYER_LIST) );
      console.log("TOKENS : "+JSON.stringify(_TOKEN_LIST) );
      */
      console.log(JSON.stringify(_WRAP) );
      toto = 0;
    }

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