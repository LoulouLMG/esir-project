
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


app.listen(PORT);

/* Connections handling ********************************************************************/
io.sockets.on('connection', function (socket) 
{
  var _clientId, _clientSnake;
  // We give an id to the newcomer, all new id is increased
  _clientId = client_id ++;
  // A snake is attributed to the new client
  _clientSnake = new Snake(_clientId);
  // the new snake is added to the list
  players.push(_clientSnake);
  // the server send his id to the client
  socket.send(JSON.stringify(
  {
    type: 'id',
    value: _clientId
  }));

  console.log("Client " + _clientId + " connected");

  socket.on("message", function(message) 
  {
    message = JSON.parse(message);
    return _clientSnake.direction = message.direction;
  });

  return 
  socket.on("disconnect", function() {
    players.remove(_clientSnake);
    console.log("Client " + _clientId + " disconnected");
    client_id --;
  });

});

/* Snake Class *****************************************************************************/
Snake = (function() {
    // constructor
    function Snake(id) {
      this.id = id;
    }

    Snake.prototype.doStep = function() {
      var i, _ref;
      for (i = 0, _ref = this.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.moveTail(i);
      }
      return this.moveHead();
    };

    Snake.prototype.moveTail = function(i) {
      this.elements[i][0] = this.elements[i + 1][0];
      return this.elements[i][1] = this.elements[i + 1][1];
    };

    Snake.prototype.moveHead = function() {
      var head;
      head = this.length - 1;
      switch (this.direction) {
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
      if (this.elements[head][0] < 0) {
        this.elements[head][0] = WIDTH;
      }
      if (this.elements[head][1] < 0) {
        this.elements[head][1] = HEIGHT;
      }
      if (this.elements[head][0] > WIDTH) {
        this.elements[head][0] = 0;
      }
      if (this.elements[head][1] > STAGE_HEIGHT) {
        return this.elements[head][1] = 0;
      }
    };

    Snake.prototype.head = function() {
      return this.elements[this.length - 1];
    };

    Snake.prototype.blocks = function(other) {
      var collision, element, head, _i, _len, _ref;
      head = other.head();
      collision = false;
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        if (head[0] === element[0] && head[1] === element[1]) {
          collision = true;
        }
      }
      return collision;
    };
    Snake.prototype.blocksSelf = function() {
      var collision, head, i, _ref;
      head = this.head();
      collision = false;
      for (i = 0, _ref = this.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        if (head[0] === this.elements[i][0] && head[1] === this.elements[i][1]) {
          collision = true;
        }
      }
      return collision;
    };
    return Snake;
  })();



