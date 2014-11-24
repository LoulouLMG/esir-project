var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

//need to receive these datas dynamically from client.
var width_canvas = 600;
var high_canvas = 600;
var cell_size_px = 20;
//The map of all the player socket
var playerSocket = {};
//The status of all the players (if ready or not)
var playerStatus = {};
//The direction of all the players
var playersDirection = {};
var colorPlayer;
var posBegin;
var timeOver = false;

var PORT = 8090;

app.listen(PORT);

//If there is a problem return to the "accueil" page
function handler (req, res) {
  fs.window.location("<?php echo URL?>");
}

//The communication between the server and the client
io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !');
  //When a new client is connected add him
  socket.on('init', function (data) {
    playerSocket[data] = socket;
    playerStatus[data] = false;
    console.log('recu', data);
    notifyInitEverybody(data);
  });
  //When a player is ready
  socket.on('ready', function (data) {
    console.log('ready', data);
    playerStatus[data] = true;
    notifyReadyEverybody(data);
    //Check that if all players are ready or not
    if(checkAllReady())
    {
      //If all players are ready re init for new game
      colorPlayer = ['Peru','Orange','Purple','OliveDrab'];
      posBegin = [[0,0],[width_canvas-cell_size_px-2,high_canvas-cell_size_px-2]];
      //Generate the token map
      var tokentMap = generateMap();
      notifyBeginEverybody(tokentMap);
      timeOver = false;
      //Launch the game
      run();
    }
  });
  //When a player disconnect the game remove him
  socket.on('disconnect', function() {
    var parti = getNameBySocket(socket);
    delete playerSocket[parti];
    console.log('leave',parti);
    //Notify whose player has leaved
    notifyLeaveEverybody(parti);
  });
  //When a player move
  socket.on('direction',function (data) {
    sendDirection(data.pname,data.direction);
  });
  //When a player eat a token
  socket.on('eaten', function (data) {
    //Create a new one
    create_token(data);
  });
  //When the time is over
  socket.on('timeOver', function (data) {
    timeOver = true;
  });
  //When a player hit another player or the canvas borders
  socket.on('gameOver', function (data) {
    //Set him like not ready to not send him to redraw his canvas
    playerStatus[data] = false;
  });
});

//Launch the game, until the is time is over the server send draw
function run()
{
  if(!timeOver)
  {
    //Draw the eater every 60ms
    if(typeof game_loop != "undefined")
    {
      clearInterval(game_loop);
    }
    game_loop = setInterval(sendDraw, 60);
  }
  else
  {
    clearInterval(game_loop);
  }
}

//Tell to all players to draw their canvas
function sendDraw()
{
  if (!timeOver)
  {
    for(var playerName in playerSocket)
    {
      if (playerStatus[playerName])
      {
        var sock = playerSocket[playerName];
        sock.emit('draw',playersDirection);        
      }
    }
  }
}

//Get the name of a player from his socket
function getNameBySocket(socket)
{
  for(var key in playerSocket)
  {
    var val = playerSocket[key];
    if(val === socket)
    {
      return key;
    }
  }
}

//Set the direction of a player
function sendDirection(playerName,direction)
{
  playersDirection[playerName] = direction;
}

//When a new player is connected
function notifyInitEverybody(data)
{
  for(var player in playerSocket)
  {
    //Tell to all others player that a new player is here
    if(player !== data)
    {
      var sock = playerSocket[player];
      console.log('nouveau joueur',player);
      sock.emit('newPlayer',data);
    }
    else
    {
      //Send to the new playe the list of all ohter players
      for(player in playerSocket)
      {
        if(player !== data)
        {
          var osock = playerSocket[data];
          console.log('joueur present',player);
          osock.emit('newPlayer',player);       
        }
      }
    }
  }
}

//Send to everyone the name of the player who are leaving
function notifyLeaveEverybody(parti)
{
  for(var player in playerSocket)
  {
    var sock = playerSocket[player];
    sock.emit('leave',parti);
  }
}

//Notify everyone that a new player is ready
function notifyReadyEverybody(namePlayerReady)
{
  notifyOther(namePlayerReady,sendReady);
}

//Check that all players are ready to play the game
function checkAllReady()
{
  var nbPlayer = getNbPlayer();
  var nbPlayerReady = 0;
  for(var player in playerStatus)
  {
    var status = playerStatus[player];
    if(status)
    {
      nbPlayerReady++;
    }
  }
  if(nbPlayer === nbPlayerReady)
  {
    return true;
  }
  return false;
}

//Tell to everyone that the game begin
function notifyBeginEverybody(map)
{
  var config_init = {};
  for(var player in playerSocket)
  {
    var color = giveNextColor();
    var pos = giveNextPos();
    if(pos[0] === 0 && pos[1] === 0)
    {
      playersDirection[player] = "right";
    }
    else
    {
      playersDirection[player] = "left";
    }
    console.log('color ',color,' ,pos ',pos);
    config_init[player] = {'map':map,'color':color,'pos':pos};
  }
  //Send to everyone the position,the color of everyone and the map
  for(var oplayer in playerSocket)
  {
    var sock = playerSocket[oplayer];
    sock.emit('begin',config_init);
  }
}

//Count how many players are present
function getNbPlayer()
{
  var count = 0;
  for(var player in playerStatus)
  {
    count++;
  }
  return count;
}

//Tell that a new player is ready
function sendReady(ready,dest)
{
  console.log('notifying',dest,' player ready is' , ready);
  var sock = playerSocket[dest];
  sock.emit('ready',ready);
}

//Notify all other player
function notifyOther(namePlayer,callback)
{
  for(var player in playerSocket)
  {
    if (player !== namePlayer) {
      callback(namePlayer,player);
    }
  }
}

//Generate the map to send to all the players
function generateMap()
{
  var token = {};
  var nb_token = 20;
  for(var i=0; i < nb_token; i++){
    token[i] = {
      x: Math.round(Math.random()*(width_canvas-cell_size_px)/cell_size_px), 
      y: Math.round(Math.random()*(high_canvas-cell_size_px)/cell_size_px), 
      value: 1,
    };
  }
  return token;
}

//Create a token at a position
function create_token(position)
{
  var token_type = define_token_type();
  var token = {
    x: Math.round(Math.random()*(width_canvas-cell_size_px)/cell_size_px), 
    y: Math.round(Math.random()*(high_canvas-cell_size_px)/cell_size_px), 
    value: token_type,
  };
  for(var playerName in playerSocket)
  {
    var sock = playerSocket[playerName];
    sock.emit('newToken',{'position':position,'token':token});
  }
}

//Define the type of the new token (basic, rare, magic) and its value
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

//Give the next color available from the list
function giveNextColor()
{
  var colorSelected = colorPlayer[0];
  colorPlayer.shift();
  return colorSelected;
}

//Give the next position available from the list
function giveNextPos()
{
  var posSelected = posBegin[0];
  posBegin.shift();
  return posSelected;
}