var view = {
	
	initiate: function() {
		$('#join-game-btn').on('click', function (e) {
			var name = $("#player-name-txt").val();
			if(name != ""){
				logic.setPlayerName(name);
				logic.joinGame($("#game-pin-txt").val(), $("#player-name-txt").val());
			} else {
				alert("Please enter a name");
			}
		});

		$('#create-game-btn').on('click', function (e) {
			var name = $("#player-name-txt").val();
	
			if(name != ""){
				logic.setPlayerName(name);
				logic.createNewGame();
			} else {
				alert("Please enter a name");
			}
		});

		$('#start-game-btn').on('click', function (e) {
			logic.startGame();
		});

		$('#board-game-send-btn').on('click', function (e) {
			logic.sendToRemotePlayer($("#board-game-input").val(), boardCommandMarker.getPosition())
		});

		$('#photo-button').on('click', function (e) {
			logic.takePhoto();
		});
	},

	updateTokenList: function(tokens){
		$("#token-list").html("");
		for(var t in tokens) {
			$('#token-list').append("<li class='list-group-item' onclick=logic.connect('" + tokens[t].address + "')>" + tokens[t].name + "</li>");
		}
	},

	displaySetupTokenView: function(){
		$("#create-new-game-view").addClass("hidden");
		$("#token-set-up-view").removeClass("hidden");
	},

	displayGameLobbyView: function(gamePin, playerNames, isHost){
		$('#start-view').removeClass('show');
		$('#start-view').addClass('hidden');
		$('#create-new-game-view').removeClass('hidden');
		$('#create-new-game-view').addClass('show');
		$('#game-pin').html("<br>" + gamePin);

		if(isHost == false){
			$('#start-game-btn').addClass('hidden');
		}
		view.updatePlayerList(playerNames, isHost);
	},

	updatePlayerList: function(playerNames, isHost){
		$("#players-list").html("");
		for(var playername in playerNames) {
			$("#players-list").append("<p class='list-group-item pnames'>" + playerNames[playername] + "</p>");
		}
		if(isHost){
			$(".pnames").on('click', function(){
				view.updateRemotePlayerTxt($(this).text());
				logic.remotePlayerSelected($(this).text());
			});
		}
	},

	gameSetupLoadingMsg: function(msg){
		$("#game-setup-load-msg").html(msg);
	},

	gameSetupCompleted: function(){
		$('#game-setup-view').removeClass('show');
		$('#game-setup-view').addClass('hidden');
		$('#start-view').removeClass('hidden');
	},

	gameSetupError: function(msg){
		$("#game-setup-alert").removeClass("hidden");
		$("#game-setup-error-msg").html("eee");
	},

	updateRemotePlayerTxt: function(name){
		$("#remote-player-text").html("Remote player: " + name);
	},

	displayGameView: function(isRemote){
		if(isRemote){
			$('#create-new-game-view').removeClass('show');
			$('#create-new-game-view').addClass('hidden');
		} else {
			$('#token-set-up-view').removeClass('show');
			$('#token-set-up-view').addClass('hidden');
		}
		
		if(isRemote){
			$('#pervasive-game-view').removeClass('hidden');
			google.maps.event.trigger(remoteGameMap, 'resize');
		} else {
			$('#board-game-view').removeClass('hidden');
			google.maps.event.trigger(boardGameMap, 'resize');
		}
	},

	displayMapMessage: function(txt, position) {
		var infoWindow = new google.maps.InfoWindow({map: remoteGameMap, content: txt});

		remoteCommandMarker.setPosition(new google.maps.LatLng(position.lat, position.lng));
		remoteGameMap.panTo(new google.maps.LatLng(position.lat, position.lng));

		infoWindow.open(remoteGameMap, remoteCommandMarker);
	},

	displayTokenConnectLoader: function(token){
		$("#token-loader").removeClass("hidden");
		$("#token-load-msg").html("Connecting to " + token.name);
	},

	updateTokenConectLoader: function(connected){
		if(connected){
			$("#token-loader").addClass("hidden");
			$("#token-load-msg").html("Connected");
		} else {
			$("#token-loader").addClass("hidden");
			$("#token-load-msg").html("Failed to connect, try again.");
			alert("Failed to connect: " + code);
		}
	},

	boardGameMap: null,
	remoteGameMap: null,
	boardCommandMarker: null,
	remoteCommandMarker: null,

	initMaps: function() { 
		var mapCanvasLocal = document.getElementById("board-game-map");
		var mapCanvasRemote = document.getElementById("pervasive-map");

		var mapOptions = {
			center: new google.maps.LatLng(61, 10), 
			zoom: 17,
			disableDefaultUI: true
		}

		boardGameMap = new google.maps.Map(mapCanvasLocal, mapOptions); 
		remoteGameMap = new google.maps.Map(mapCanvasRemote, mapOptions); 


		boardCommandMarker = new google.maps.Marker({
		    map: boardGameMap
		});

		remoteCommandMarker = new google.maps.Marker({ 
		    map: remoteGameMap
		});
 
	    boardGameMap.addListener('click', function(e) {  
	    	boardCommandMarker.setPosition(e.latLng); 
	    }); 

		function onDeviceReady() {
		    var onSuccess = function(position) {
		        //alert('Latitude: '          + position.coords.latitude          + '\n' +
		        //      'Longitude: '         + position.coords.longitude         + '\n' +
		        //      'Altitude: '          + position.coords.altitude          + '\n' +
		        //      'Accuracy: '          + position.coords.accuracy          + '\n' +
		        //      'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
		        //      'Heading: '           + position.coords.heading           + '\n' +
		        //      'Speed: '             + position.coords.speed             + '\n' +
		        //      'Timestamp: '         + position.timestamp                + '\n');

		        boardGameMap.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		        remoteGameMap.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		    };

		    var onError = function(error) {
		        alert('code: '    + error.code    + '\n' +
		              'message: ' + error.message + '\n');
		    }
 
		    navigator.geolocation.getCurrentPosition(onSuccess, onError, { 
		    	enableHighAccuracy: false, 
		    	timeout: 5000
			});
	    }

	    document.addEventListener("deviceready", onDeviceReady, false);
	}
}

