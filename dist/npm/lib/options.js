"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Options = (function () {
    function Options(url, port) {
        if (!url) {
            throw new Error('Url must be provided');
        }
        if (!port) {
            throw new Error('Port must be provided');
        }
        this.url = url;
        this.port = port;
    }
    return Options;
}());
exports.Options = Options;
