var AnyBoard = require("../../submodules/Anyboard/anyboard-library/dist/anyboard.js")
var fs       = require("fs")

AnyBoard.Logger.setThreshold(AnyBoard.Logger.debugLevel);
AnyBoard.Server(4321, function() {
    AnyBoard.Logger.log("Server listening for connections on port " + 4321);
});


var quiz_qa = JSON.parse(fs.readFileSync('quiz_qa.json', 'utf8'));
AnyBoard.Logger.log("Read " + quiz_qa.length + " questions/answers from file");

var games = {};


AnyBoard.Server.onSystemEvent('JOIN', function(data) {
    AnyBoard.Logger.log("\"" + data.player_id + "\" wants to join game " + data.game_pin + " from ip " + data.client.remoteAddress);

    if(data.game_pin in games) {
        var game = games[data.game_pin];
        

        if(data.player_id in game.players == false) {
            game.players[data.player_id] = {
                name: data.player_id,
                is_remote: false,
                client: data.client
            };

            var playerList = [];
            for(var p in game.players) 
                playerList.push(p);

            AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'JOIN_RESULT', { success: true, players: playerList });

            AnyBoard.Logger.log('Player "' + data.player_id + '" joined game "' + data.game_pin + '"');

            
            for(var p in game.players) {
               if(game.players[p].client != data.client)
                    AnyBoard.Server.sendEvent(game.players[p].client, 'SYSTEM_EVENT', 'PLAYER_JOINED', { players: playerList });
            }
        }
        else {
            AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'JOIN_RESULT', { success: false, error: 'Player name in use' });
        }
    } else {
        AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'JOIN_RESULT', { success: false, error: 'Game does not exist' });
    }
});

var gameIdCount = 1000;

AnyBoard.Server.onSystemEvent('CREATE', function(data) {
    games[gameIdCount] = {
        host: data.player_id,
        players: {},
        questionIdx: 0
    };

    games[gameIdCount].players[data.player_id] = {
        name: data.player_id,
        client: data.client
    };

    AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'CREATE_RESULT', { success: true, host: data.player_id, game_pin: gameIdCount });

    AnyBoard.Logger.log(data.player_id + " created a game with ID " + gameIdCount);
    gameIdCount++;
});


AnyBoard.Server.onSystemEvent('REMOTE_SELECTED', function(data) {
    if(data.game_pin in games) {
        var game = games[data.game_pin];
        for(var p in game.players) {
            var player = game.players[p];
            
            AnyBoard.Server.sendEvent(player.client, 'SYSTEM_EVENT', 'REMOTE_SELECTED', { player_id: data.player_id });
        }
        AnyBoard.Logger.log("Player with ID \"" + data.player_id + "\" is set to remote in game #" + data.game_pin);
        
        game.remote_player = game.players[data.player_id];
    }
});


AnyBoard.Server.onRemoteEvent('PHOTO', function(data) {
    if(data.game_pin in games) {
        var game = games[data.game_pin];

        for(var p in game.players) {
            var player = game.players[p];

            if(player != game.remote_player) {
                AnyBoard.Server.sendEvent(player.client, 'REMOTE_EVENT', 'PHOTO', { photo: data.photo });
            }
                
        }
    }
});

AnyBoard.Server.onSystemEvent('START_GAME', function(data) {
    if(data.game_pin in games) {
        var game = games[data.game_pin];

        if(game.running) {
            AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'GAME_STARTED', { success: false, error: "Game is already startet" });
        } else if(game.players.count < 2) {
            AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'GAME_STARTED', { success: false, error: "Not enough players (Only " + game.players.count + ")"});
        } else if(!game.remote_player) {
            AnyBoard.Server.sendEvent(data.client, 'SYSTEM_EVENT', 'GAME_STARTED', { success: false, error: "No remote player selected"});
        } else {
            game.running = true;
            for(var p in game.players) {
                var player = game.players[p];
                AnyBoard.Server.sendEvent(player.client, 'SYSTEM_EVENT', 'GAME_STARTED', { success: true });
            }
        }

        sendNextQuestion(game);
    }
});
 
AnyBoard.Server.onSystemEvent('CONNECTED', function(client) {
    AnyBoard.Logger.log("A client connected from " + client.remoteAddress);
});

AnyBoard.Server.onLocalEvent('POSITION_MESSAGE', function(data) {
    var game = games[data.game_pin];
    AnyBoard.Server.sendEvent(game.remote_player.client, 'LOCAL_EVENT', 'POSITION_MESSAGE', { text: data.text, position: data.position });
});

var sendNextQuestion = function(game) {
    for(var p in game.players) {
        var player = game.players[p];
        var q = quiz_qa[game.questionIdx];
        if(player != game.remote_player)
            AnyBoard.Server.sendEvent(player.client, 'SYSTEM_EVENT', 'NEXT_QUESTION', { qid: game.questionIdx, question: q.q, options: [ q.r, q.w ] });
    }
    game.questionIdx++;
}

AnyBoard.Server.onLocalEvent('CHECK_ANSWER', function(data) {
    if(data.game_pin in games) {
        var game = games[data.game_pin];
        
        for(var p in game.players) {
            var player = game.players[p];
            AnyBoard.Server.sendEvent(player.client, 'SYSTEM_EVENT', 'ANSWER_RESULT', { correct: data.answer == 0 });
        }
        
        if(game.questionIdx < quiz_qa.length) {
            sendNextQuestion(game);
        } else {
            for(var p in game.players) {
                var player = game.players[p];
                AnyBoard.Server.sendEvent(player.client, 'SYSTEM_EVENT', 'GAME_FINISHED', { });
            }
        }
    }
});