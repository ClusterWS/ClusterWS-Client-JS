"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages/messages");
var Channel = (function () {
    function Channel(channel, client) {
        this.channel = channel;
        this.client = client;
        this.client.webSocket.send(messages_1.MessageFactory.systemMessage('subscribe', this.channel));
    }
    Channel.prototype.on = function (fn) {
        this.client.channels[this.channel] = fn;
    };
    Channel.prototype.publish = function (data) {
        this.client.webSocket.send(messages_1.MessageFactory.publishMessage(this.channel, data));
    };
    return Channel;
}());
exports.Channel = Channel;
