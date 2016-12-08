ServerHandler = {
    socket: null
};

AnyBoard.ServerHandler.triggerEvent = function(dict, event, args) { 
    AnyBoard.Logger.log('Event triggered: ' + event);

    if (dict[event]) {
        for (var i in dict[event]) {
            if (dict[event].hasOwnProperty(i))
                dict[event][i].apply(null, args);
        }
    }    
    
}

ServerHandler._socket = {};

var socketId = null;

ServerHandler.connect = function(hostaddress, port, win, fail) {
    AnyBoard.Logger.log("Trying to connect..");
    
    chrome.sockets.tcp.create({}, function(createInfo) {
        socketId = createInfo.socketId;

        chrome.sockets.tcp.connect(createInfo.socketId, hostaddress, port, function(result) {
            if(result < 0) {
                fail(result);
                return;
            }
            win();
        });
       
        chrome.sockets.tcp.onReceive.addListener(function(info) {
            var encodedString = String.fromCharCode.apply(null, new Uint8Array(info.data));
            AnyBoard.Logger.log("Received: " + encodedString.toString());
            if (info.socketId != socketId)
                return;
        });

        chrome.sockets.tcp.onReceiveError.addListener(function(info) {
            AnyBoard.Logger.log("Socket #" + info.socketId + " failed to receive: " + info.resultCode);     
        });
    });
};

ServerHandler.joinGame = function(userid, team) {
    var request = {
        type: "JOIN",
        userid: userid,
        team: team
    };
    AnyBoard.ServerHandler._rawSend(JSON.stringify(request));
}

ServerHandler._rawSend = function(string) {
    chrome.sockets.tcp.send(socketId, AnyBoard.Utils.str2ab(string), function(sendInfo) {
        if(sendInfo.resultCode >= 0) {
            AnyBoard.Logger.log("String sent: " + string);
        } else {
            AnyBoard.Logger.log("Failed to send string: " + string);
        }
    });
}

ServerHandler.listeners = {
    localEvent: {},
    remoteEvent: {}
};

ServerHandler.onLocalEvent = function(eventName, callbackFunction) {
    AnyBoard.Logger.log('Added listener to Local-event: ' + eventName);
    if (!this.listeners.localEvent[eventName])
        this.listeners.localEvent[eventName] = [];
    this.listeners.localEvent[eventName].push(callbackFunction);
};

ServerHandler.onRemoteEvent = function(eventName, callbackFunction) {
    AnyBoard.Logger.log('Added listener to Remote-event: ' + eventName);
    if (!this.listeners.remoteEvent[eventName])
        this.listeners.remoteEvent[eventName] = [];
    this.listeners.remoteEvent[eventName].push(callbackFunction);
};