define([
    "TypeCheck",
    "Callback"
], function (TypeCheck, Callback) {
    /**
     * Provides a basic wrapper for web sockets
     * @alias Socket 
     * @constructor
     * @throws {TypeError} - If passed url is not a string
     * @param {Object} options - options object
     * @param {String} options.url - web socket connection url
     */  
    var Socket = function (options) {
        if (TypeCheck.isString(options.url)) {
            this._socket = new WebSocket(options.url);
        } else {
            throw new TypeError("Passed url is not a string");
        }
        this._onOpenCallback = new Callback({ id: "onopen" });
        this._onMessageCallback = new Callback({ id: "onmessage" });
        this._onErrorCallback = new Callback({ id: "onerror" });
        this._onCloseCallback = new Callback({ id: "onclose" });
        this._socketReady = false;
        this._socketCache = [];
        this._socket.onopen = (function () { //jscs:ignore
            var cache = this._socketCache, length = cache.length;
            // If there are messages in the cache, send it to server
            if (length > 0) {
                for (var i = 0; i < length; i++) {
                    this._socket.send(JSON.stringify(cache[i]));
                }
            }
            this._socketReady = true;
            this._onOpenCallback.broadcastToFunctions();
        }).bind(this);
        this._socket.onmessage = (function (msg) {
            if (TypeCheck.isDefined(msg) && TypeCheck.isDefined(msg.data)) {
                var data = JSON.parse(msg.data);
                this._onMessageCallback.broadcastToFunctions(data);
            }
        }).bind(this);
        this._socket.onerror = (function (err) {
            if (TypeCheck.isDefined(err)) {
                this._onErrorCallback.broadcastToFunctions(err);
            }
        }).bind(this);
        this._socket.onclose = (function (cls) {
            if (TypeCheck.isDefined(cls)) {
                this._onCloseCallback.broadcastToFunctions(cls);
            }
        }).bind(this);
    };
    /**
     * Provides states for messages which shall be sended
     * @enum
     */
    Socket.messageType = Socket.prototype.messageState = {
        SENT: "sent",
        CACHED: "cached"
    };
    /**
     * Provides socket event types
     * @enum
     */
    Socket.eventType = Socket.prototype.eventType = {
        OPEN: "onopen",
        MESSAGE: "onmessage",
        ERROR: "onerror",
        CLOSE: "onclose"
    };
    /**
     * Sends a message to the connected web socket. If connection is not established
     * already, the messages will be cached, an send if connection is open.
     * @param {Any} message - Anything which shall be passed to server
     * @returns {Socket.messageState} - SENT: If the message is sent
     *                                  CACHED: If the message is cached, and sent
     *                                          when the connection is established
     */
    Socket.prototype.sendMessage = function (message) {
        var state = "";
        if (this._socketReady) {
            this._socket.send(JSON.stringify(message));
            state = this.messageState.SENT;
        } else {
            this._socketCache.push(message);
            state = this.messageState.CACHED;
        }
        return state;
    };
    /**
     * Registers a callback for socket events
     * @throws {TypeError} - If callback is not a function
     * @param {Socket.eventType} eventType - type for which the passed function should be registered
     * @param {Function} callback - function which should be notified
     * @return {Boolean} - True if registration is successful, false otherwise
     */
    Socket.prototype.registerCallback = function (eventType, callback) {
        return this._processCallbackLogic("register", eventType, callback);
    };
    /**
     * Unregisters a callback
     * @throws {TypeError} - If callback is not a function
     * @param {Socket.eventType} eventType - type for which the passed function should be registered
     * @param {Function} callback - function which should be notified
     * @return {Boolean} - True if unregistration is successful, false otherwise
     */
    Socket.prototype.unregisterCallback = function (eventType, callback) {
        return this._processCallbackLogic("unregister", eventType, callback);
    };
    /**
     * Process the callback registration
     * @private
     * @param {String} action - Indicates whether a registration or a unregistration should be processed
     * @param {Socket.eventType} eventType - type for which the passed function should be registered
     * @param {Function} callback - function which should be notified
     */
    Socket.prototype._processCallbackLogic = function (action, eventType, callback) {
        var type = this.eventType, isSuccessfully = false, oCb = this._onOpenCallback, mCb = this._onMessageCallback,
            eCb = this._onErrorCallback, cCb = this._onCloseCallback;
        if (!TypeCheck.isFunction(callback)) {
            throw new TypeError("callback is not a function");
        }
        switch (eventType) {
            case type.OPEN:
                isSuccessfully = (action === "register") ? oCb.registerFunction(callback) : oCb.unregisterFunction(callback);
                break;
            case type.MESSAGE:
                isSuccessfully = (action === "register") ? mCb.registerFunction(callback) : mCb.unregisterFunction(callback);
                break;
            case type.ERROR:
                isSuccessfully = (action === "register") ? eCb.registerFunction(callback) : eCb.unregisterFunction(callback);
                break;
            case type.CLOSE:
                isSuccessfully = (action === "register") ? cCb.registerFunction(callback) : cCb.unregisterFunction(callback);
                break;
        }
        return isSuccessfully;
    };
    return Socket;
});