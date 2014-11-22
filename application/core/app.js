var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

//need to receive these datas dynamically from client.
var width_canvas = 600;
var high_canvas = 600;
var cell_size_px = 20;

var playerSocket = {};
var playerStatus = {};
var playersDirection = {};
var colorPlayer;
var posBegin;
var timeOver = false;

var PORT = 8090;

app.listen(PORT);

function handler (req, res) {
  fs.window.location("<?php echo URL?>");
}

io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !');
  socket.on('init', function (data) {
    playerSocket[data] = socket;
    playerStatus[data] = false;
    console.log('recu', data);
    notifyInitEverybody(data);
  });
  socket.on('ready', function (data) {
    console.log('ready', data);
    playerStatus[data] = true;
    notifyReadyEverybody(data);
    if(checkAllReady())
    {
      //Re init for new game
      colorPlayer = ['Peru','Orange','Purple','OliveDrab'];
      posBegin = [[0,0],[width_canvas-cell_size_px-2,high_canvas-cell_size_px-2]];
      //posBegin = [[0,0],[0,0]];
      var tokentMap = generateMap();
      notifyBeginEverybody(tokentMap);
      timeOver = false;
      run();
    }
  });
  socket.on('trace', function (data) {
    console.log('trace de',data.pname,' message ',data.text);
  });
  socket.on('disconnect', function() {
    var parti = getNameBySocket(socket);
    delete playerSocket[parti];
    console.log('leave',parti);
    notifyLeaveEverybody(parti);
  });
  socket.on('direction',function (data) {
    sendDirection(data.pname,data.direction);
  });
  socket.on('eaten', function (data) {
    create_token(data);
  });
  socket.on('timeOver', function (data) {
    timeOver = true;
  });
  socket.on('gameOver', function (data) {

  })
});

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

function sendDraw()
{
  for(playerName in playerSocket)
  {
    var sock = playerSocket[playerName];
    sock.emit('draw',playersDirection);
  }
}

function getNameBySocket(socket)
{
  for(key in playerSocket)
  {
    var val = playerSocket[key];
    if(val === socket)
    {
      return key;
    }
  }
}

function sendDirection(playerName,direction)
{
  for(playerName in playersDirection)
  {
      playersDirection[playerName] = direction;
  }
}

//Quand un nouveau joueur se connecte
function notifyInitEverybody(data)
{
  for(player in playerSocket)
  {
    //Renvoie le nouveau joueur à tous les autres joueurs présents
    if(player !== data)
    {
      var sock = playerSocket[player];
      console.log('nouveau joueur',player);
      sock.emit('newPlayer',data);
    }
    else
    {
      //Envoie au nouveau joueur la liste des joueurs déjà présents
      for(player in playerSocket)
      {
        if(player !== data)
        {
          var sock = playerSocket[data];
          console.log('joueur present',player);
          sock.emit('newPlayer',player);       
        }
      }
    }
  }
}

//Envoie à tout le monde le nom du joueur parti
function notifyLeaveEverybody(parti)
{
  for(player in playerSocket)
  {
    var sock = playerSocket[player];
    sock.emit('leave',parti);
  }
}

//Notify everyone that a new player is readyy
function notifyReadyEverybody(namePlayerReady)
{
  notifyOther(namePlayerReady,sendReady);
}

//Check that all players are ready to play the game
function checkAllReady()
{
  var nbPlayer = getNbPlayer();
  var nbPlayerReady = 0;
  for(player in playerStatus)
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
  for(player in playerSocket)
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
  for(player in playerSocket)
  {
    var sock = playerSocket[player];
    sock.emit('begin',config_init);
  }
}

//Count how many players are present
function getNbPlayer()
{
  var count = 0;
  for(player in playerStatus)
  {
    count++
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
  for(player in playerSocket)
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
  for(playerName in playerSocket)
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

function giveNextColor()
{
  var colorSelected = colorPlayer[0];
  colorPlayer.shift();
  return colorSelected;
}

function giveNextPos()
{
  var posSelected = posBegin[0];
  posBegin.shift();
  return posSelected;
}