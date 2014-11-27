/* Player Class ***********************************************************************************************************/
module.exports = function Player() 
{
  // constructor
  function Player(name) 
  {
    this.name = name;
    this.score = 0;
    this.ready = false;
  }    

  /* Getters and setters ***************************************************************************************************/
  /* They are only here for providing an explicit API since propertiess aren't private */
  Player.prototype.getName = function() 
  {
    return this.name;
  }

  Player.prototype.getID = function() 
  {
    return this.id;
  }

  Player.prototype.setSnake = function(snake) 
  {
    this.snake = snake;
  }

  // init a snake in a random position
  Player.prototype.getSnake = function() 
  {
    return this.snake;
  }
  /* End Getters and setters */
  // return the prototype after instanciate it.
  return Player;
}();