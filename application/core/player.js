/* Player Class ***********************************************************************************************************/
module.exports = function Player() 
{
  // constructor
  function Player(name) 
  {
    this._name = name;
    this._score = 0;
    this._ready = false;
    this._snake = null;
  }    

  // Update all informations about the player
  Player.prototype.moveSnake = function() 
  {
    this._snake.update();
  }

  // Update all informations about the player
  Player.prototype.resetSnake = function(score, length) 
  {
    this._snake.setScore(score);
    this._snake.setLength(length);
    this._snake.init();
  }

  // Update all informations about the player
  Player.prototype.setDirection = function(direction) 
  {
    this._snake.setDirection(direction);
  }




  /* Getters and setters ***************************************************************************************************/
  /* They are only here for providing an explicit API since propertiess aren't private */
  Player.prototype.getName = function() 
  {
    return this._name;
  }

  Player.prototype.setSnake = function(snake) 
  {
    this._snake = snake;
  }

  Player.prototype.getSnake = function() 
  {
    return this._snake;
  }

  Player.prototype.setScore = function(score) 
  {
    this._score = score;
  }

  Player.prototype.getScore = function() 
  {
    return this._snake.getScore();
  }

  Player.prototype.setReady = function(ready) 
  {
    this._ready = ready;
  }

  Player.prototype.isReady = function() 
  {
    return this._ready;
  }

  /* End Getters and setters */
  // return the prototype after instanciate it.
  return Player;
}();