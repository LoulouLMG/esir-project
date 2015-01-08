
JS.load('..../application/core/server_BACKUP.js','..../application/core/config.js','..../application/core/player.js','..../application/core/snake.js','..../application/core/token.js');

JS.Test.describe('Backup Server', function() { with(this) {
  before(function() { with(this) {
  	this.puts(JS.ENV.startBackup);
  }})

  describe('Server status', function() { with(this) {
    it('Check if the backup server is operationnal', function() { with(this) {
      assertEqual( true, JS.ENV.startBackup );
    }})
  }})

}})