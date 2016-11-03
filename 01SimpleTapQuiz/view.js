var view = {
	
	initiate: function() {
		$("#maindiv").html(
			"<button onclick='logic.searchForTokens()' id='searchBtn'>Find tokens</button>" + 
			"<p>Found devices:</p>" +
			"<ul id='tokenlist'></ul>" +
			"<p id='errlabel'></p>" 
		);
		
	},
	
	updateTokenList: function(tokens) {
		$('#tokenlist').html("");
		
		for(var t in tokens) {
			if(tokens[t].name == "AnyPawn")
				$('#tokenlist').append("<li onclick=logic.connect('" + tokens[t].address + "')>" + tokens[t].name + "<button>Connect</button></li>");
		}
	},
	
	addVibrateButton: function(btnAddr) {
		$("#maindiv").append("<button onclick=\"logic.vibrate('" + btnAddr + "')\">Vibrate</button>");
	}
	
}