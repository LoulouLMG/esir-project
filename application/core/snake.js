/* Configuration constants loaded here **********************************************************************************/
var config = require('./config.js');
/* we get the last coordoate of the map */
var nb_tile_Y = config.nb_tile_height;
var nb_tile_X = config.nb_tile_width;
/* End configuration constants loaded here ******************************************************************************/
/* Snake Class **********************************************************************************************************/
module.exports = function Snake() 
{
   // constructor Snake must receives {color:XXXX, length:XX}
   function Snake(init_data) 
   {
     /* To make attributes explicit */    
     this.color = init_data.color;
     this.length = init_data.length;
     this.direction = null;
     this.score = 0;
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
      this.length = this.elements.unshift({"X":-1, "Y":-1});
    }
    // increase score with each grow
    this.score += points * 10; 
  };

  /**
  * init a snake in a random position
  */ 
  Snake.prototype.init = function() 
  {
    //TODO : PREVENT SPAWNING ON ANOTHER ENTITY
    this.elements = (function() 
    {
      var  result =[], rand_tile, border;
      /* Determine on which border will spawn the snake with its appropriate
         direction (opposite of the border)
      */
      border = (function ()
      {
        var rand_border = Math.floor(Math.random() * 4);
        console.log("random border: " + rand_border);
        switch(rand_border)
        {
          case 0: 
          this.direction = "right" ; 
          return {
            side:"LEFT",
            axe: "Y"
          };
          case 1: 
          this.direction = "down" ;
          return {
            side:"TOP",
            axe: "X"
          };
          case 2: 
          this.direction = "left" ;
          return {
            side:"RIGHT",
            axe: "Y"
          };
          case 3: 
          this.direction = "up" ;
          return {
            side:"BOTTOM",
            axe: "X"
          };
        }
      }).call(this);
      console.log(JSON.stringify(border));
      // we choice to place the player on a random tile of the given border 
      rand_tile = Math.floor(Math.random() * (border.axe == "X" ? nb_tile_X : nb_tile_Y));
      for (var i = 0; i<this.length; i++) 
      {
        if(border.axe == "X")
        {
          result.push({ "X" : rand_tile, "Y" : i});
        } 
        else
        {
          result.push({ "X" : i, "Y" : rand_tile});
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
    for (var i = 0, snake_body = this.length - 2;  i <= snake_body; i++) 
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
    this.elements[i]["X"] = this.elements[i + 1]["X"];
    this.elements[i]["Y"] = this.elements[i + 1]["Y"];
  };

  /**
  * Set the new position of the head following the current direction
  */
  Snake.prototype.moveHead = function() 
  {
    var index_head;
    // index of the head
    index_head = this.length - 1;
    // move the head in function of the current direction
    switch (this.direction) 
    {
      case "left":
      this.elements[index_head]["X"] -= 1;
      break;
      case "right":
      this.elements[index_head]["X"] += 1;
      break;
      case "up":
      this.elements[index_head]["Y"] -= 1;
      break;
      case "down":
      this.elements[index_head]["Y"] += 1;
    }
    // check when the player arrive near a border to respawn him on its opposite border
    if (this.elements[index_head]["X"] < 0) 
    {
      this.elements[index_head]["X"] = nb_tile_X;
    }
    if (this.elements[index_head]["Y"] < 0) 
    {
      this.elements[index_head]["Y"] = nb_tile_Y;
    }
    if (this.elements[index_head]["X"] > nb_tile_X) 
    {
      this.elements[index_head]["X"] = 0;
    }
    if (this.elements[index_head]["Y"] > nb_tile_Y) 
    {
      this.elements[index_head]["Y"] = 0;
    }
  };

  /**
  * Calcul collision with others snakes
  */
  Snake.prototype.checkCollisionWithPlayer = function(other_snake) 
  {
    var collision, element, other_head, current_snake_elements;
    other_head = other_snake.getHead();
    collision = false;
    current_snake_elements = this.elements;
    // we check the collsions on the body and the head of the snake
    for (var i = 0, current_snake_size = current_snake_elements.length; i < current_snake_size; i++) 
    {
      element = current_snake_elements[i];
      // for each element, if another head is on the same tile of it, then the snake must kill the other snake
      if (other_head["X"] === element["X"] && other_head["Y"] === element["Y"]) 
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
  Snake.prototype.checkCollisionWithToken = function() 
  {
    var collision, element, token, head;
    head = this.head();
    for (var i = 0, nb_token = tokens.length; i < nb_token; i++) 
    {
      token = tokens[i];
      if (head["X"] === token.position["X"] && head["Y"] === token.position["Y"]) 
      {
        // if collision with a token the snake grows
        this.grow(token.type.worth);
        // token is reset
        token.init();
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
    for (var i = 0, body_size = this.length - 2; i <= body_size; i++) 
    {
      if (head["X"] === this.elements[i]["X"] && head["Y"] === this.elements[i]["Y"]) 
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
    return this.elements[this.length - 1];
  };

  Snake.prototype.getDirection = function() 
  {
    return this.direction;
  };

  Snake.prototype.getScore = function() 
  {
    return this.score;
  };

  Snake.prototype.getColor = function() 
  {
    return this.color;
  };
  /* End Getters and setters */
  //return the referece of the new "object"
  return Snake;
}();
/* End Snake Class ******************************************************************************************************/