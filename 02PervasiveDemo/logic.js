var logic = {

	serverAdress: "10.0.0.5",
	port: 4321,


	initiate: function() {
		var self = this;
		
		//$(document).ready(function() {
    		view.initiate();
			self.connectToServer();
		//});
	},

	connectToServer: function(){

		var connWin = function() {
			view.gameSetupCompleted();
		};

		var connFail = function(result) {
			view.gameSetupError("Error connecting to server.");	
			view.gameSetupLoadingMsg("Reconnecting to server...");	
		};

		view.gameSetupLoadingMsg("Connecting to server...");
		//AnyBoard.ServerHandler.connect(this.serverAdress, this.port, connWin, connFail);
		hyper.log("Screating c Socket");
		chrome.sockets.tcp.create(function(createObj){});
		hyper.log("Screating c Socket done");

	},

	createNewGame: function(name){
		AnyBoard.ServerHandler.createGame(name);
	} 
};