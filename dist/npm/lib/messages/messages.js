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
var InternalMessage = (function () {
    function InternalMessage(event, data) {
        this.event = event;
        this.data = data;
        this.action = 'internal';
    }
    return InternalMessage;
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
    MessageFactory.internalMessage = function (event, data) {
        return JSON.stringify(new InternalMessage(event, data));
    };
    return MessageFactory;
}());
exports.MessageFactory = MessageFactory;
