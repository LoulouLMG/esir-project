/* Snake Class **********************************************************************************************************/
module.exports = function Snake() 
{
   // constructor
  function Snake(id, name, color) 
  {
    this.id = id;
    this.name = name;
    this.color = color;
    this.score = 0;
    this.ready = false;
    this.reset();
  }    

  Snake.prototype.grow = function(points) 
  {
    for(var i = 0; i < points; i++)
    {
      // add the tail on fake coordonnates to not display it on the map
      this.length = this.elements.unshift([-1, -1]);
    }
    // increase score with each grow
    this.score += points * 10; 
  };

  // init a snake in a random position
  Snake.prototype.reset = function() 
  {
    this.length = LENGTH_INIT;
    this.direction = "right";
    this.elements = (function() 
    {
      var  result, i, rand;
      result = [];
      // we choice to place the player on a random location on Y axis (1)
      rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
      for (i = 0; i<this.length; i++) {
        result.push([i, rand]);
      }
      return result;
    }).call(this);
  };

  Snake.prototype.update = function() 
  {
    var i, snake_body;
    for (i = 0, snake_body = this.length - 2;  i <= snake_body; i++) 
    {
      this.moveBody(i);
    }
    return this.moveHead();
  };

  Snake.prototype.moveBody = function(i) 
  {
    this.elements[i][0] = this.elements[i + 1][0];
    this.elements[i][1] = this.elements[i + 1][1];
  };

  Snake.prototype.moveHead = function() 
  {
    var head;
    head = this.length - 1;
    switch (this.direction) 
    {
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
    if (this.elements[head][0] < 0) 
    {
      this.elements[head][0] = LAST_TILE_COORDONATE;
    }
    if (this.elements[head][1] < 0) 
    {
      this.elements[head][1] = LAST_TILE_COORDONATE;
    }
    if (this.elements[head][0] > LAST_TILE_COORDONATE) 
    {
      this.elements[head][0] = 0;
    }
    if (this.elements[head][1] > LAST_TILE_COORDONATE) 
    {
      this.elements[head][1] = 0;
    }
  };

  Snake.prototype.head = function() 
  {
    return this.elements[this.length - 1];
  };

  // collision with other players
  Snake.prototype.checkCollisionWithPlayer = function(other) 
  {
    var collision, element, other_head, current_snake_elements;
    other_head = other.head();
    collision = false;
    current_snake_elements = this.elements;
    // we check the collsions on the body and the head of the snake
    for (var i = 0, current_snake_size = current_snake_elements.length; i < current_snake_size; i++) 
    {
      element = current_snake_elements[i];
      // for each element, if another head is on the same tile of it, then the snake must kill the other snake
      if (other_head[0] === element[0] && other_head[1] === element[1]) 
      {
        // and their is a collision between the snake body and an other snake.
        collision = true;
      }
    }
    return collision;
  }
  return Snake;
}();