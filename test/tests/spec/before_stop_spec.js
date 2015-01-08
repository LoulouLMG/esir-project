
JS.Test.describe('Main server', function() { with(this) {
  before(function() { with(this) {
    this.client = require(['../../../lib/client.js']);
  }})

  describe('Client on the main server', function() { with(this) {
    it('Check that the client are on the main server', function() { with(this) {
      assert( this.client.PORT == 8090 );
    }})
  }})

}})