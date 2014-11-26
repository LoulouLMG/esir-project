/* Player Class **********************************************************************************************************/
module.exports = function Player() 
{
  // constructor
  function Player(name) 
  {
    this.id = "01";
    this.name = name;
    this.score = 0;
    this.ready = false;
  }    

  Player.prototype.getName = function() 
  {
    return this.name;
  }

  // init a snake in a random position
  Player.prototype.getID = function() 
  {
    return this.id;
  }
  return Player;
}();