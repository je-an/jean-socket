define([
    "Socket"
], function (Socket) {
    describe('Socket.spec.js', function () {
        var url, socket;
        beforeAll(function () { // jshint ignore:line
            window.WebSocket = (function () {
                var WebSocket = function (url) {
                    this.url = url;
                    this.readyState = WebSocket.CONNECTING;
                };
                WebSocket.CONNECTING = 0;
                WebSocket.OPEN = 1;
                WebSocket.CLOSING = 2;
                WebSocket.CLOSED = 3;

                WebSocket.prototype.send = function (params) {
                    this._message(params);
                };
                WebSocket.prototype.close = function () {
                    this.readyState = WebSocket.CLOSING;
                };
                WebSocket.prototype._open = function () {
                    this.readyState = WebSocket.OPEN;
                    this.onopen && this.onopen();
                };
                WebSocket.prototype._message = function (msg) {
                    this.onmessage && this.onmessage({ data: msg });
                };
                WebSocket.prototype._error = function () {
                    this.readyState = WebSocket.CLOSED;
                    this.onerror && this.onerror("New Error");
                };
                WebSocket.prototype._close = function () {
                    this.readyState = WebSocket.CLOSED;
                    this.onclose && this.onclose("Connection closed");
                };
                return WebSocket;
            })();
        });

        /*  afterEach(function(){
             socket = {};
         }); */
        describe("Socket", function () {
            beforeEach(function () {
                url = "ws://echo.websocket.org/";
                socket = new Socket({ url: url });
                setTimeout(function () {
                    socket._socket._open();
                }, 1000);
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            });
            it("TODO: Check if all members are available | EXPECTATION: Callback has all necessary members", function () {
                var numberOfMembers = 7;
                expect(Object.keys(socket).length).toEqual(numberOfMembers);
            });
            it("TODO: Check if all methods are available | EXPECTATION: Callback has all necessary  methods", function () {
                var numberOfMethods = 6;
                var methodCount = Object.keys(Object.getPrototypeOf(socket)).length;
                expect(methodCount).toEqual(numberOfMethods);
            });
        });
        describe("Socket.prototype.sendMessage", function () {
            beforeEach(function () {
                url = "ws://echo.websocket.org/";
                socket = new Socket({ url: url });
                setTimeout(function () {
                    socket._socket._open();
                }, 1000);
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            });
            it("TODO: Send message (Connection is not open already)| EXPECTATION: Message is cached and send after connection is established", function () {
                expect(socket.sendMessage({ name: "name" })).toEqual(socket.messageState.CACHED);
            });
            it("TODO: Send message (Connection is open)| EXPECTATION: Message is send successfully", function (done) {
                var result = "";
                setTimeout(function () {
                    result = socket.sendMessage({ name: "name" });
                    expect(result).toEqual(socket.messageState.SENT);
                    done();
                }, 2000);
            });
            it("TODO: Send undefined as message (Connection is open)| EXPECTATION: Message is send successfully", function (done) {
                var result = "";
                setTimeout(function () {
                    result = socket.sendMessage(undefined);
                    expect(result).toEqual(socket.messageState.SENT);
                    done();
                }, 2000);
            });
            it("TODO: Send null as message (Connection is open)| EXPECTATION: Message is send successfully", function (done) {
                var result = "";
                setTimeout(function () {
                    result = socket.sendMessage(null);
                    expect(result).toEqual(socket.messageState.SENT);
                    done();
                }, 2000);
            });
        });
        describe("Socket.prototype.registerCallback", function () {
            var socket;
            beforeEach(function () {
                url = "ws://echo.websocket.org/";
                socket = new Socket({ url: url });
                setTimeout(function () {
                    socket._socket._open();
                }, 1000);
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            });
            it("TODO: Register Callback for onopen event | Callback  registered successful", function () {
                expect(socket.registerCallback(socket.eventType.OPEN, function () { })).toBe(true);
            });
            it("TODO: Register Callback for onmessage event | Callback registered successful", function () {
                expect(socket.registerCallback(socket.eventType.MESSAGE, function () { })).toBe(true);
            });
            it("TODO: Register Callback for onerror event | Callback registered successful", function () {
                expect(socket.registerCallback(socket.eventType.ERROR, function () { })).toBe(true);
            });
            it("TODO: Register Callback for onclose event | Callback registered successful", function () {
                expect(socket.registerCallback(socket.eventType.CLOSE, function () { })).toBe(true);
            });
            it("TODO: Register Callback for onopen event and get notification | Callback get notified successful", function (done) {
                socket.registerCallback(socket.eventType.OPEN, function () {
                    expect(true).toEqual(true);
                    done();
                });
                socket.sendMessage({ name: "name1" });
            });
            it("TODO: Register Callback for onmessage event and get notification | Callback get notified successful", function (done) {
                socket.registerCallback(socket.eventType.MESSAGE, function (message) {
                    expect(message.name).toEqual("name2");
                    done();
                });
                socket.sendMessage({ name: "name2" });
            });
            it("TODO: Register Callback for onerror event and get notification | Callback get notified successful", function (done) {
                socket.registerCallback(socket.eventType.ERROR, function (message) {
                    expect(message).toEqual("New Error");
                    expect(socket._socket.readyState).toEqual(3);
                    done();
                });
                socket._socket._error();
            });
            it("TODO: Register Callback for onclose event and get notification | Callback get notified successful", function (done) {
                socket.registerCallback(socket.eventType.CLOSE, function (message) {
                    expect(message).toEqual("Connection closed");
                    expect(socket._socket.readyState).toEqual(3);
                    done();
                });
                socket._socket._close();
            });
            it("TODO: Try to register Callback but pass a non valid event type | Callback dont get registered", function () {
                expect(socket.registerCallback("FalseEventType", function () { })).toBe(false);
            });
            it("TODO: Try to register something else as callback | Throws type error", function () {
                try {
                    socket.registerCallback(socket.eventType.OPEN, {});
                } catch (e) {
                    expect(e instanceof TypeError).toBe(true);
                }
                try {
                    socket.registerCallback(socket.eventType.OPEN, "{}");
                } catch (e) {
                    expect(e instanceof TypeError).toBe(true);
                }
                try {
                    socket.registerCallback(socket.eventType.OPEN, 123);
                } catch (e) {
                    expect(e instanceof TypeError).toBe(true);
                }
                try {
                    socket.registerCallback(socket.eventType.OPEN, true);
                } catch (e) {
                    expect(e instanceof TypeError).toBe(true);
                }
            });
        });
        describe("Socket.prototype.unregisterCallback", function () {
            var socket, f;
            beforeEach(function () {
                url = "ws://echo.websocket.org/";
                socket = new Socket({ url: url });
                setTimeout(function () {
                    socket._socket._open();
                }, 1000);
                f = function () { };
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            });
            it("TODO: Unregister Callback for onopen event | Callback unregistered successful", function () {
                socket.registerCallback(socket.eventType.OPEN, f);
                expect(socket.unregisterCallback(socket.eventType.OPEN, f)).toBe(true);
            });
            it("TODO: Unregister Callback for onmessage event | Callback unregistered successful", function () {
                socket.registerCallback(socket.eventType.MESSAGE, f);
                expect(socket.unregisterCallback(socket.eventType.MESSAGE, f)).toBe(true);
            });
            it("TODO: Unregister Callback for onerror event | Callback unregistered successful", function () {
                socket.registerCallback(socket.eventType.ERROR, f);
                expect(socket.unregisterCallback(socket.eventType.ERROR, f)).toBe(true);
            });
            it("TODO: Unregister Callback for onclose event | Callback unregistered successful", function () {
                socket.registerCallback(socket.eventType.CLOSE, f);
                expect(socket.unregisterCallback(socket.eventType.CLOSE, f)).toBe(true);
            });
            it("TODO: Try to unregister Callback for invalid event | Callback dont get unregistered", function () {
                socket.registerCallback(socket.eventType.MESSAGE, f);
                expect(socket.unregisterCallback("socket.eventType.MESSAGE", f)).toBe(false);
            });
            it("TODO: Try to unregister Callback which are not registered | Callback dont get unregistered", function () {
                expect(socket.unregisterCallback(socket.eventType.MESSAGE, f)).toBe(false);
            });
        });
    });
});

