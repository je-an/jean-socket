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
        describe("Socket", function () {
            beforeEach(function () {
                url = "ws://echo.websocket.org/";
                socket = new Socket({ url: url });
                setTimeout(function () {
                    socket._socket._open();
                }, 1000);
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            });
            it("All necessary members are available", function () {
                var numberOfMembers = 7;
                expect(Object.keys(socket).length).toEqual(numberOfMembers);
            });
            it("All necessary methods are available", function () {
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
            it("Caches a message, if connection is not already established", function () {
                expect(socket.sendMessage({ name: "name" })).toEqual(socket.messageState.CACHED);
            });
            it("Sends message, if connection is established", function (done) {
                var result = "";
                setTimeout(function () {
                    result = socket.sendMessage({ name: "name" });
                    expect(result).toEqual(socket.messageState.SENT);
                    done();
                }, 2000);
            });
            it("Sends undefined as a message", function (done) {
                var result = "";
                setTimeout(function () {
                    result = socket.sendMessage(undefined);
                    expect(result).toEqual(socket.messageState.SENT);
                    done();
                }, 2000);
            });
            it("Sends null as a message", function (done) {
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
            it("Registers callback for onopen event", function () {
                expect(socket.registerCallback(socket.eventType.OPEN, function () { })).toBe(true);
            });
            it("Registers callback for onmessage event", function () {
                expect(socket.registerCallback(socket.eventType.MESSAGE, function () { })).toBe(true);
            });
            it("Registers callback for onerror event", function () {
                expect(socket.registerCallback(socket.eventType.ERROR, function () { })).toBe(true);
            });
            it("Registers callback for onclose event", function () {
                expect(socket.registerCallback(socket.eventType.CLOSE, function () { })).toBe(true);
            });
            it("Notifies a callback which was registered for onopen event", function (done) {
                socket.registerCallback(socket.eventType.OPEN, function () {
                    expect(true).toEqual(true);
                    done();
                });
                socket.sendMessage({ name: "name1" });
            });
            it("Notifies a callback which was registered for onmessage event", function (done) {
                socket.registerCallback(socket.eventType.MESSAGE, function (message) {
                    expect(message.name).toEqual("name2");
                    done();
                });
                socket.sendMessage({ name: "name2" });
            });
            it("Notifies a callback which was registered for onerror event", function (done) {
                socket.registerCallback(socket.eventType.ERROR, function (message) {
                    expect(message).toEqual("New Error");
                    expect(socket._socket.readyState).toEqual(3);
                    done();
                });
                socket._socket._error();
            });
            it("Notifies a callback which was registered for onclose event", function (done) {
                socket.registerCallback(socket.eventType.CLOSE, function (message) {
                    expect(message).toEqual("Connection closed");
                    expect(socket._socket.readyState).toEqual(3);
                    done();
                });
                socket._socket._close();
            });
            it("Responds with false, if a callback shall be registered for a invalid event type", function () {
                expect(socket.registerCallback("FalseEventType", function () { })).toBe(false);
            });
            it("Throws exception, if something else as a function shall be registered as callback", function () {
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
            it("Unregisters callback for onopen event", function () {
                socket.registerCallback(socket.eventType.OPEN, f);
                expect(socket.unregisterCallback(socket.eventType.OPEN, f)).toBe(true);
            });
            it("Unregisters callback for onmessage event", function () {
                socket.registerCallback(socket.eventType.MESSAGE, f);
                expect(socket.unregisterCallback(socket.eventType.MESSAGE, f)).toBe(true);
            });
            it("Unregisters callback for onerror event", function () {
                socket.registerCallback(socket.eventType.ERROR, f);
                expect(socket.unregisterCallback(socket.eventType.ERROR, f)).toBe(true);
            });
            it("Unregisters callback for onclose event", function () {
                socket.registerCallback(socket.eventType.CLOSE, f);
                expect(socket.unregisterCallback(socket.eventType.CLOSE, f)).toBe(true);
            });
            it("Responds with false, if a callback shall be unregistered for a invalid message type", function () {
                socket.registerCallback(socket.eventType.MESSAGE, f);
                expect(socket.unregisterCallback("socket.eventType.MESSAGE", f)).toBe(false);
            });
            it("Responds with false, if a callback shall be unregistered, which are not registered before", function () {
                expect(socket.unregisterCallback(socket.eventType.MESSAGE, f)).toBe(false);
            });
        });
    });
});

