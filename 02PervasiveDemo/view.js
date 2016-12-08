var view = {
	
	initiate: function() {
		
		$('#join-game-btn').on('click', function (e) {
			alert("HOHO");
		});

		$('#create-game-btn').on('click', function (e) {
			$('#start-view').addClass('hidden');
			$('#create-new-game-view').removeClass('hidden');
			logic.createNewGame("Tien");
		});

		$('#start-game-btn').on('click', function (e) {
			$('#start-view').addClass('hidden');
			$('#create-new-game-view').removeClass('hidden');
		});
	},

	gameSetupLoadingMsg: function(msg){
		$("#game-setup-load-msg").html(msg);
	},

	gameSetupCompleted: function(){
		$('#game-setup-view').removeClass('show');
		$('#game-setup-view').addClass('hidden');
		$('#start-view').removeClass('hidden');
		$('#start-view').addClass('show');


	},

	gameSetupError: function(msg){
		$("#game-setup-alert").removeClass("hidden");
		$("#game-setup-error-msg").html("eee");
	}
	
}