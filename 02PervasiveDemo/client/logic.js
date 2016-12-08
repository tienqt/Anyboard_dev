var logic = {

	serverAdress: "radarfeed.zapto.org",
	playerName: "",
	remotePlayer: "",
	port: 4321,
	gamePin: 0,
	isRemote: false,
	isHost: false,

	foundTokens: {},


	initiate: function() {
		window.onload = function () {
			AnyBoard.TokenManager.onTokenEvent("TAP", function() {
				AnyBoard.ServerHandler.tap(0, logic.gamePin);
			});

			AnyBoard.TokenManager.onTokenEvent("DOUBLE_TAP", function() {
				AnyBoard.ServerHandler.tap(1, logic.gamePin);
			}); 

			AnyBoard.ServerHandler.onSystemEvent("GAME_STARTED", function(options){
				if(options.success){
					hyper.log("Displaying game view");
					if(!logic.isRemote){
						logic.setupToken();
					} else {
						view.displayGameView(logic.isRemote);
					}
				} else {
					alert(options.error);
				}
			});

			AnyBoard.ServerHandler.onSystemEvent("ANSWER_RESULT", function(options){
				if(options.correct){
					alert("Correct answer");
				} else {
					alert("Wrong answer");
				}
			});

			AnyBoard.ServerHandler.onSystemEvent("GAME_FINISHED", function(options){
				alert("Game finished.");
			});

			AnyBoard.ServerHandler.onSystemEvent("NEXT_QUESTION", function(options){
				$("#question").html("<p>" + options.question + "<br> Tap: " + options.options[0] + " Double tap:  " + options.options[1] + "</p> ");
			});

			AnyBoard.ServerHandler.onSystemEvent("REMOTE_SELECTED", function(options){
				logic.remotePlayer = options.player_id;
				if(logic.playerName == logic.remotePlayer){
					logic.isRemote = true;
				} else {
					logic.isRemote = false;
				}
				view.updateRemotePlayerTxt(options.player_id);
			});

			AnyBoard.ServerHandler.onSystemEvent("PLAYER_JOINED", function(options){
				view.updatePlayerList(options.players, logic.isHost);
			});

			AnyBoard.ServerHandler.onLocalEvent("POSITION_MESSAGE", function(options) {
				view.displayMapMessage(options.text, options.position);
			});

			AnyBoard.ServerHandler.onRemoteEvent("PHOTO", function(options) {
				var image = document.getElementById('my-image');
	    		image.src = "data:image/jpeg;base64," + options.photo;
	    		$("#my-image").removeClass("hidden");

	    		$("#my-image").on("click", function(e){
	    			$("#my-image").addClass("hidden");
	    		});
			});

			logic.connectToServer();
			view.initiate();
		};
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
		AnyBoard.ServerHandler.connect(this.serverAdress, this.port, connWin, connFail);
	},

	createNewGame: function(){
		AnyBoard.ServerHandler.onceSystemEvent("CREATE_RESULT", function(options){
			if(options.success){
				logic.isHost = true;
				logic.gamePin = options.game_pin;
				view.displayGameLobbyView(options.game_pin, [logic.playerName], logic.isHost);
			}
		});
		AnyBoard.ServerHandler.createGame(logic.playerName);
	},

	joinGame: function(gamePin, playerid){
		AnyBoard.ServerHandler.onceSystemEvent("JOIN_RESULT", function(options){
			if(options.success){
				logic.gamePin = gamePin;
				view.displayGameLobbyView(logic.gamePin, options.players, logic.isHost);
			}
		});

		AnyBoard.ServerHandler.joinGame(gamePin, playerid);
	},

	setupToken: function(){
		view.displaySetupTokenView();
		this.searchForTokens();
	},

	searchForTokens: function() {	
		function win(token) {
			logic.foundTokens[token.address] = token;
			view.updateTokenList(logic.foundTokens);
		};	
		function fail(token) {
			alert("Could not connect to token.");
		};
		
		AnyBoard.TokenManager.scan(win, fail);
	}, 

	connect: function(address) { 
		function win() {			
			view.updateTokenConectLoader(true);
			view.displayGameView(logic.isRemote);
		};

		function fail(code) {
			view.updateTokenConectLoader(false);
		};

		view.displayTokenConnectLoader(logic.foundTokens[address]);
		logic.foundTokens[address].connect(win, fail);
	},

	remotePlayerSelected: function(remotePlayer){
		this.remotePlayer = remotePlayer;
		AnyBoard.ServerHandler.remotePlayer(remotePlayer, logic.gamePin);
	},

	startGame: function(){
		AnyBoard.ServerHandler.startGame(this.gamePin);
		
	},

	takePhoto: function() {
		var self = this;
		navigator.camera.getPicture(function(base64string, path) {
			AnyBoard.ServerHandler.sendPhoto(base64string, self.gamePin);
		}, function() {
			alert("Photo failed");
		}, { 
			quality: 20,
			destinationType: Camera.DestinationType.DATA_URL 
		});
	},

	sendToRemotePlayer(text, position) {
		AnyBoard.ServerHandler.positionMessage(text, { lat: position.lat(), lng: position.lng() }, this.gamePin);
	},

	setPlayerName: function(name){
		this.playerName = name;
	}
};
 