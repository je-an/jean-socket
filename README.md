## Description

Provides a client for browser-side WebSockets

## Support
Supports both CommonJS and AMD eco system. If there is no loader, Socket is registered as a browser variable.

## Code Example
- Use it as browser variable
```js
var socket = new Socket({ url: "www.example.com" });
// Send a message to the server
socket.sendMessage({ msg: "Message to server" });
//  Register callback for onopen event
socket.registerCallback(socket.eventType.OPEN, function(){
    // Called when socket connection is open
});
// Register callback for onmessage event
socket.registerCallback(socket.eventType.MESSAGE, function(msg){
    // Called when socket get a message from backend
    // <msg> is already parsed from JSON to object
});
// Register a callback to show how unregistration is done
var scratchFn = function(){};
socket.registerCallback(socket.eventType.MESSAGE, scratchFn);
// Unregister the function
socket.unregisterCallback(socket.eventType.MESSAGE, scratchFn);
```
- Use with require.js
```js
require(["path/to/Socket"], function(Socket){
    // Work with Socket
});
```
- Use with node.js
```js
var Socket = require("jean-socket");
```

## Installation

`npm install jean-socket --save --legacy-bundling`

## API Reference

### Socket.messageState

 Provides states for messages which shall be sended

- `SENT`: Message is sent to server
- `CACHED`: Message is cached, an will be send, if connection is established

### Socket.eventType
Provides socket event types
- `OPEN`: Socket is open
- `MESSAGE`: Socket get messages
- `ERROR`: Error happend
- `CLOSE`: Socket is closed

### Socket.sendMessage(message) 

Sends a message to the connected web socket. If connection is not established
already, the messages will be cached, an send if connection is open.

**Parameters**

- **message**: `Any` - Anything which shall be passed to server

**Returns**
- `Socket.messageState` 

### Socket.registerCallback(eventType, callback) 

Registers a callback for socket events. It is possible to register multiple callbacks for each
event.

**Parameters**

- **eventType**: `Socket.eventType` - Type for which the passed function should be registered
- **callback**: `function` - Function which should be notified

**Returns**
- `Boolean` - True if registration is successful, false otherwise

### Socket.unregisterCallback(eventType, callback) 

Unregisters a callback

**Parameters**
- **eventType**: `Socket.eventType` - type for which the passed function should be registered
- **callback**: `function` - function which should be notified

**Returns**
- `Boolean` - True if unregistration is successful, false otherwise

## Tests
- Open spec/spec-runner.html in browser to see the test cases.

## License

MIT