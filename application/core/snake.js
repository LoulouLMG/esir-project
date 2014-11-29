/************************************************************************************************************************/
/*@Authors  Solofeed, ErwanTrain                                                                                        */
/* Configuration constants loaded here **********************************************************************************/
var config = require('./config.js');
/* we get the last coordoate of the map */
var nb_tile_Y = config.nb_tile_height;
var nb_tile_X = config.nb_tile_width;
/* End configuration constants loaded here ******************************************************************************/
/************************************************************************************************************************/
/* Snake Class **********************************************************************************************************/
module.exports = function Snake() 
{
   // constructor Snake must receives {color:XXXX, dimension:XX}
   function Snake(init_data) 
   {
     /* To make attributes explicit */    
     this._color = init_data.color;
     this._length = init_data.dimension;
     this._direction = null;
     this._score = 0;
     this._elements = [];
     /* Initialize the position on the map */
     this.init();
   }    


  /**
  * Perform length gaining and score calculating
  */
  Snake.prototype.grow = function(points) 
  {
    for(var i = 0; i < points; i++)
    {
      // add the tail on fake coordonnates to not display it on the map
      // increase the size of the snake by 1 tile.
      this._length = this._elements.unshift({"X":-1, "Y":-1});
    }
    // increase score with each grow
    this._score += points * 10; 
  };

  /**
  * init a snake in a random position
  */ 
  Snake.prototype.init = function() 
  {
    //TODO : PREVENT SPAWNING ON ANOTHER ENTITY
    this._elements = (function() 
    {
      var  result =[], rand_tile, border;
      /* Determine on which border will spawn the snake with its appropriate
         direction (opposite of the border)
      */
      border = (function ()
      {
        var rand_border = Math.floor(Math.random() * 4);
        switch(rand_border)
        {
          case 0: 
          this._direction = "right" ; 
          return {
            side:"LEFT",
            axe: "Y"
          };
          case 1: 
          this._direction = "down" ;
          return {
            side:"TOP",
            axe: "X"
          };
          case 2: 
          this._direction = "left" ;
          return {
            side:"RIGHT",
            axe: "Y"
          };
          case 3: 
          this._direction = "up" ;
          return {
            side:"BOTTOM",
            axe: "X"
          };
        }
      }).call(this);
      // we choice to place the player on a random tile of the given border 
      rand_tile = Math.floor(Math.random() * (border.axe == "X" ? nb_tile_X : nb_tile_Y));
      for (var i = 0; i<this.getLength(); i++) 
      {
        if(border.axe == "X")
        {
          if(border.side == "TOP") // if top need to start on top side
          {
           result.push({ "X" : rand_tile, "Y" : i});  
          }
          else  // if borrom need to start on bottom side
          {
            result.push({ "X" : rand_tile, "Y" : nb_tile_Y-1 - i});  
          }
        } 
        else
        {
          if(border.side == "LEFT")
          {
            result.push({ "X" : i, "Y" : rand_tile});
          }
          else  // if borrom need to start on bottom side
          {
            result.push({ "X" : nb_tile_X-1 - i, "Y" : rand_tile});
          }
        }
      }
      return result;
    }).call(this);
  };

  /**
  * Reorganize the snake each new ticks 
  */
  Snake.prototype.update = function() 
  {
    // first update the body without the head
    for (var i = 0, snake_body = this._length - 2;  i <= snake_body; i++) 
    {
      this.moveBody(i);
    }
    // then update the head
    this.moveHead();
  };

  /**
  * Move a given element of the snake body to its previous sibling position
  * @param i : index of element to be moved
  */
  Snake.prototype.moveBody = function(i) 
  {
    this._elements[i].X = this._elements[i + 1].X;
    this._elements[i].Y = this._elements[i + 1].Y;
  };

  /**
  * Set the new position of the head following the current direction
  */
  Snake.prototype.moveHead = function() 
  {
    var index_head;
    // index of the head
    index_head = this._length - 1;
    // move the head in function of the current direction
    switch (this._direction) 
    {
      case "left":
      this._elements[index_head].X -= 1;
      break;
      case "right":
      this._elements[index_head].X += 1;
      break;
      case "up":
      this._elements[index_head].Y -= 1;
      break;
      case "down":
      this._elements[index_head].Y += 1;
    }
    // check when the player arrive near a border to respawn him on its opposite border
    if (this._elements[index_head].X < 0) 
    {
      this._elements[index_head].X = nb_tile_X;
    }
    if (this._elements[index_head].Y < 0) 
    {
      this._elements[index_head].Y = nb_tile_Y;
    }
    if (this._elements[index_head].X > nb_tile_X-1) 
    {
      this._elements[index_head].X = 0;
    }
    if (this._elements[index_head].Y > nb_tile_Y-1) 
    {
      this._elements[index_head].Y = 0;
    }
  };

  Snake.prototype.setDirection = function(direction)
  {
    this._direction = direction;
  } 

  /**
  * Calcul collision with others snakes
  */
  Snake.prototype.checkCollisionWithPlayer = function(other_snake) 
  {
    var collision, element, other_head, current_snake_elements;
    other_head = other_snake.getHead();
    collision = false;
    current_snake_elements = this._elements;
    // we check the collsions on the body and the head of the snake
    for (var i = 0, current_snake_size = current_snake_elements.length; i < current_snake_size; i++) 
    {
      _element = current_snake_elements[i];
      // for each element, if another head is on the same tile of it, then the snake must kill the other snake
      if (other_head.X === _element.X && other_head.Y === _element.Y) 
      {
        // and there is a collision between the snake body and an other snake.
        collision = true;
      }
    }
    return collision;
  };

  /**
  * Calcul collision with tokens
  */
  Snake.prototype.checkCollisionWithToken = function(entities) 
  {
    var tokens = entities.tokens;
    var collision, element, token, token_position, head;
    head = this.getHead();
    for (var i = 0, nb_token = tokens.length; i < nb_token; i++) 
    {
      token = tokens[i];
      token_position = token.getPosition();
      if (head.X === token_position.X && head.Y === token_position.Y) 
      {
        // if collision with a token the snake grows
        this.grow(token._type.worth);
        // token is reset
        token.init(entities);
      }
    }
  };

  /**
  * Calcul collision with the snake itself
  */
  Snake.prototype.checkSuicide = function() 
  {
    var collision, head;
    head = this.getHead();
    collision = false;
    // we check if the head's player collide with his body
    for (var i = 0, body_size = this._length - 2; i <= body_size; i++) 
    {
      var element = this._elements[i];
      if (head.X === element.X && head.Y === element.Y) 
      {
        collision = true;
      }
    }
    return collision;
  };
  /* Getters and setters *********************************************************************************************/
  /* They are only here for providing an explicit API since properties aren't private */
  Snake.prototype.getHead = function() 
  {
    return this._elements[this._length - 1];
  };

  Snake.prototype.getDirection = function() 
  {
    return this._direction;
  };

  Snake.prototype.setScore = function(score) 
  {
    this._score = score;
  };

  Snake.prototype.getScore = function() 
  {
    return this._score;
  };

  Snake.prototype.getLength = function() 
  {
    return this._length;
  };

  Snake.prototype.setLength = function(length) 
  {
    return this._length = length;
  };

  Snake.prototype.getElements = function() 
  {
    return this._elements;
  };

  Snake.prototype.getColor = function() 
  {
    return this._color;
  };
  /* End Getters and setters */
  //return the referece of the new "object"
  return Snake;
}();
/* End Snake Class *****************************************************************************************************/