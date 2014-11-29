// example/spec/set_spec.js

JS.Test.describe('Snake', function() { with(this) {
  before(function() { with(this) {
    var id = 1;
    var name = "Gerard";
    var color = "Green";
    this.snake = new Snake(id,name,color);
  }})

  describe('SnakeParameter', function() { with(this) {
    it('returns true for good initialization', function() { with(this) {
      assert( this.snake.id == 1 );
      assert( this.snake.name == "Gerard" );
      assert( this.snake.color == "Green" );
    }})

    it('returns true for non passing parameters', function() { with(this) {
      assert( this.snake.score == 0 );
      assert( this.snake.ready == false);
    }})
  }})

  describe('TokenType', function() { with(this) {
    it('check that this is the true value for this token type', function() { with(this) {
      var token_type = "MEDIUM";
      this.token = new TOKEN_TYPE(token_type);
      assert( this.token.worth == 2 );
      assert( this.token.lifespan == 7 );
      assert( this.token.name == "medium" );
      assert( this.token.color == "rgb(255,204,0)" );
    }})
  }})
}})