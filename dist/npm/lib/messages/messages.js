"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmitMessage = (function () {
    function EmitMessage(event, data) {
        this.event = event;
        this.data = data;
        this.action = 'emit';
    }
    return EmitMessage;
}());
var PublishMessage = (function () {
    function PublishMessage(channel, data) {
        this.channel = channel;
        this.data = data;
        this.action = 'publish';
    }
    return PublishMessage;
}());
var SystemMessage = (function () {
    function SystemMessage(event, data) {
        this.event = event;
        this.data = data;
        this.action = 'sys';
    }
    return SystemMessage;
}());
var MessageFactory = (function () {
    function MessageFactory() {
    }
    MessageFactory.emitMessage = function (event, data) {
        return JSON.stringify(new EmitMessage(event, data));
    };
    MessageFactory.publishMessage = function (channel, data) {
        return JSON.stringify(new PublishMessage(channel, data));
    };
    MessageFactory.systemMessage = function (event, data) {
        return JSON.stringify(new SystemMessage(event, data));
    };
    return MessageFactory;
}());
exports.MessageFactory = MessageFactory;
