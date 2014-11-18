var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var playerSocket = {};

app.listen(8090);

function handler (req, res) {
  fs.window.location("<?php echo URL?>");
}

io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !');
  socket.on('init', function (data) {
    playerSocket[data] = socket;
    console.log('recu', data);
    notifyInitEverybody(data);
  });
  socket.on('ready', function (data) {
    console.log('ready', data);
    notifyReadyEverybody(data);
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

function notifyReadyEverybody(namePlayerReady)
{
  notifyOther(namePlayerReady,sendReady);
}

function sendReady(ready,dest)
{
  console.log('notifying',dest,' player ready is' , ready);
  var sock = playerSocket[dest];
  sock.emit('ready',ready);
}

function notifyOther(namePlayer,callback)
{
  for(player in playerSocket)
  {
    if (player !== namePlayer) {
      callback(namePlayer,player);
    }
  }
}