/* Configuration constants loaded here **********************************************************************************/
var config = require('./config.js');
/* we get the last coordoate of the map */
var nb_tile_Y = config.nb_tile_height;
var nb_tile_X = config.nb_tile_width;


/* End configuration constants loaded here ******************************************************************************/
/* Token Class **********************************************************************************************************/
module.exports = function Token(entities) 
{       
    // constructor
    function Token(entities) 
    {
      if(entities!=null)
        this.init(entities);
      else
      {
        this._type = new TOKEN_TYPE("SMALL");
        this._position = [];
      }    
    }

    /**
    * Init a token : determines its type and his position.
    */
    Token.prototype.init = function(entities) 
    {
      this._type = null;
      // a random type is attributed to the token
      this.randomizeType();
      // a random coordonnate is attributed to the token
      this.randomizePosition(entities);
    };

    /**
    * Each token posses a lifespan wich is decreased each time
    * this function is called
    */
    Token.prototype.decreaseLifeSpan = function()
    {
      this._type.lifespan = this._type.lifespan - 1;
    };

    /**
    * Determine the type of the token
    */
    Token.prototype.randomizeType = function() 
    {
      var rand = Math.floor(Math.random() * 6);
      // a type is attributed to the token
      if(rand <= 2) // 50% 
      {
        this._type = new TOKEN_TYPE("SMALL");
      }
      if(rand >= 3 && rand < 5) // 33%
      {
        this._type = new TOKEN_TYPE("MEDIUM");
      }
      if(rand == 5) // 16%
      {
        this._type = new TOKEN_TYPE("BIG");
      }
    };

    /**
    * Determines the position of the token
    */
    Token.prototype.randomizePosition = function(entities) 
    {
      //console.log("PLAYERS : "+ player_list.length);
      //console.log("TOKENS : "+ token_list.length);
      var player_list = entities.players;
      var token_list = entities.tokens;
      var position;
      var rand = Math.floor(Math.random() * nb_tile_X);
      x = rand;
      rand = Math.floor(Math.random() * nb_tile_Y);
      y = rand;
      position = {"X" : x, "Y" : y};
      // we check if the coordonates are available
      // Validation for the snakes
      for(var i = 0, nb_players = player_list.length ; i < nb_players; i++)
      {
       //var player = entities.players[i];
       var player =  player_list[i];
       while(player.getSnake().getHead() == position)
       {
        position.X++;
        position.Y++;
        if( position.X == nb_tile_X)
        {
          position.X = 0;
        }
        if( position.Y == nb_tile_Y)
        {
          position.Y = 0;
        }
      }
    }
      // validation for the other tokens
      for(var i = 0, nb_token = token_list.length ; i < nb_token; i++)
      {
        var token = token_list[i];
        while(token.getPosition() == position)
        {
          position.X++;
          position.Y++;
          if( position.X == nb_tile_X)
          {
            position.X = 0;
          }
          if( position.Y == nb_tile_Y)
          {
            position.Y = 0;
          }
        }
      }
      this._position = position;
    };

    /* Getters and setters **********************************************************************************************/
    Token.prototype.getType = function()
    {
      return this._type;
    };

    Token.prototype.getPosition = function()
    {
      return this._position;
    };
    /* End Getters and setters ******************************************************************************************/
    // return prototype
    return Token;
  }();
  /* End Token Class *****************************************************************************************************/

  /* Token Type Class ****************************************************************************************************/
  var TOKEN_TYPE = function()
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
          color: "rgb(0,0,0)", // Black
          lifespan: 10
        }; break ;
        case "MEDIUM":
        type = 
        {
          worth: 2, 
          name: "medium", 
          color: "rgb(255,204,0)", // Yellow
          lifespan: 7
        }; break ;
        case "BIG"   :
        type = 
        {
          worth: 4, 
          name: "big", 
          color: "rgb(204,0,0)", // Red
          lifespan: 4
        }; break ;
        // to be "clean"
        default : console.log("Strange behavior detected on Token_type constructor."); 
        return ;  
      }

      //Attibutes
      this.worth = type.worth;
      this.lifespan = type.lifespan;
      this.name = type.name;
      this.color = type.color;
    }    
    return TOKEN_TYPE;
  }();
  /* End Token Type Class ************************************************************************************************/
