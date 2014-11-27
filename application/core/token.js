/* Configuration constants loaded here **********************************************************************************/
var config = require('./config.js');
/* we get the last coordoate of the map */
var nb_tile_Y = config.nb_tile_height;
var nb_tile_X = config.nb_tile_width;
/* End configuration constants loaded here ******************************************************************************/
/* Token Class **********************************************************************************************************/
module.exports = {
  Token : (function() 
  {
    // constructor
    function Token() 
    {
      this.init();  
    }

    Token.prototype.init = function() 
    {
      this.type = null;
      // a random type is attributed to the token
      this.randomizeType();
      // a random coordonnate is attributed to the token
      this.randomizePosition();
    };

    Token.prototype.decreaseLifeSpan = function()
    {
      this.type.lifespan = this.type.lifespan - 1;
    };


    Token.prototype.randomizeType = function() 
    {
      var rand = Math.floor(Math.random() * 7);
      // a type is attributed to the token
      if(rand <= 3)
      {
        this.type = new TOKEN_TYPE("SMALL");
      }
      if(rand > 3 && rand <= 5)
      {
        this.type = new TOKEN_TYPE("MEDIUM");
      }
      if(rand == 6)
      {
        this.type = new TOKEN_TYPE("BIG");
      }
    };

    Token.prototype.randomizePosition = function() 
    {
      var position;
      var rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
      x = rand;
      rand = Math.floor(Math.random() * LAST_TILE_COORDONATE);
      y = rand;
      position = [x, y];
    // we check if the coordonates are available
    for(var i in players.elements)
    {
      while(i == position)
      {
        position[0]++;
        position[1]++;
        if( position[0] == LAST_TILE_COORDONATE + 1)
        {
          position[0] = 0;
        }
        if( position[1] == LAST_TILE_COORDONATE + 1)
        {
          position[1] = 0;
        }
      }
    }
    for(var i in tokens)
    {
      while(i == position)
      {
        position[0]++;
        position[1]++;
        if( position[0] == LAST_TILE_COORDONATE + 1)
        {
          position[0] = 0;
        }
        if( position[1] == LAST_TILE_COORDONATE + 1)
        {
          position[1] = 0;
        }
      }
    }
    this.position = position;
  };
  return Token;
})(),

TOKEN_TYPE : (function()
{
  // constructor
  function TOKEN_TYPE(init_type) 
  {
    var type;
    switch(init_type)
    {
      case "SMALL" :
      type = 
      {
        worth: 1, 
        name: "small", 
        color: "rgb(0,0,0)",
        lifespan: 10
      }; break ;
      case "MEDIUM":
      type = 
      {
        worth: 2, 
        name: "medium", 
        color: "rgb(255,204,0)",
        lifespan: 7
      }; break ;
      case "BIG"   :
      type = 
      {
        worth: 4, 
        name: "big", 
        color: "rgb(204,0,0)",
        lifespan: 4
      }; break ;
      default : console.log("Strange behavior detected on Token_type constructor."); return ;  
    }

    this.worth = type.worth;
    this.lifespan = type.lifespan;
    this.name = type.name;
    this.color = type.color;
  }    
  return TOKEN_TYPE;
})()
}