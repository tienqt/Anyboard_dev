var logic = {
	questions: [
		{ q: "Is Tien smart or dumb?", ra: "Dumb", wa: "Smart" },
		{ q: "What is !0?", ra: "1", wa: "0" },
		{ q: "How many days in a week?", ra: "7", wa: "365" },
		{ q: "What is greater than 10?", ra: "11", wa: "9" }
	],

	foundTokens: {},
	
	searchForTokens: function() {	
		function win(token) {
			logic.foundTokens[token.address] = token;
			view.updateTokenList(logic.foundTokens);
		};	
		function fail(token) {
			$("#errlabel").html("Failed");
		};
		
		AnyBoard.TokenManager.scan(win, fail);
	}, 
	
	connect: function(address) { 
		var token = logic.foundTokens[address];
		var ctx = this;

		function win() {			
			logic.nextQuestion();
		};
		function fail(code) {
			$("#errlabel").html("Unable to connect: " + code);
		};
		token.connect(win, fail);
	},
	
	setMoveListener: function() {
		AnyBoard.TokenManager.onTokenConstraintEvent("MOVE", function() {
			alert("Moved");
		});
	},
	
	vibrate: function(tokenAddress) {

	},
	
	ledOff: function(tokenAddress) {
		var token = logic.foundTokens[tokenAddress];
		var fun = function() {
			
		};
		token.vibrate(10, fun, fun);
	},

	questionCount: 0,

	nextQuestion: function() {
		var q = logic.questions[logic.questionCount];
		var ctx = this;

		// generate 0 or 1
		var raFirst = Math.floor((Math.random() * 1) + 1);	

		var alt1, alt2;
		
		if(raFirst == 1) {
			alt1 = q.ra;
			alt2 = q.wa;
		} else { 
			alt1 = q.wa;
			alt2 = q.ra;
		}



		$("#maindiv").html("Question #" + (logic.questionCount+1) + ": " + q.q + 
			"</br>Alternative 1 (tap): " + alt1 +
			"</br>Alternative 2 (double-tap): " + alt2);


		AnyBoard.TokenManager.onTokenEvent("TAP", function() {
			if(raFirst == 1) {
				alert("Correct!");
			} else {
				alert("Wrong");
			}
			ctx.nextQuestion();
		});

		AnyBoard.TokenManager.onTokenEvent("DOUBLE_TAP", function() {
			if(raFirst == 0) {
				alert("Correct!");
			} else {
				alert("Wrong");
			}
			ctx.nextQuestion();
		}); 

		logic.questionCount++;
	}
};