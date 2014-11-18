var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var width_canvas = 600;
var high_canvas = 600;
var cell_size_px = 20;

var playerSocket = {};
var playerStatus = {};
var colorPlayer;
var posBegin;

app.listen(8090);

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
      var tokentMap = generateMap();
      notifyBeginEverybody(tokentMap);
    }
  });
  socket.on('disconnect', function() {
    var parti = getNameBySocket(socket);
    delete playerSocket[parti];
    console.log('leave',parti);
    notifyLeaveEverybody(parti);
  })
});

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
  for(player in playerSocket)
  {
    var sock = playerSocket[player];
    var color = giveNextColor();
    var pos = giveNextPos();
    console.log('color ',color,' ,pos ',pos);
    sock.emit('begin',{'map':map,'color':color,'pos':pos});
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