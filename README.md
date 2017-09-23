# ClusterWS (Node Cluster WebSocket) Client Javascript

[![npm version](https://badge.fury.io/js/clusterws-client-js.svg)](https://badge.fury.io/js/clusterws-client-js)

ClusterWS - is a minimal **Node JS http & real-time** framework which allows easily scale WebSocket ([uWS](https://github.com/uNetworking/uWebSockets) - one of the fastest WebSocket libraries) between node js clusters and utilize all available CPU.

This is official Client JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), which is written in TypeScript and compiling down to es5 modules. All development code you can find in `src/` folder and compiled code in `dist/`.

[ClusterWS CHANGELOG.](./information/CHANGELOG.md)

**Current minified version is less then 7KB.**

### Installation:

Use npm :

```js
npm install --save clusterws-client-js
```

Or globally with out npm:

1. Find ClusterWS.(min).js  in `dist/browser` folder
2. Use standard script tag to import library `<script src="path/to/ClusterWS.[min].js"></script>`
3. Done you can use it as `ClusterWS` :)

### Connect to the server:

**You must use [ClusterWS](https://github.com/goriunov/ClusterWS) on the server**


When library is global you can connect it like that:

**Code:**

```js
var clusterWS = new ClusterWS({
    url: 'url to the server without http' ex: 'localhost',
    port: 'port number' ex: 3000
});
```

If you installed library from npm then you have to use `require` or `import`:

**Code:**

```js
var ClusterWS = require('clusterws-client-js').ClusterWS

var clusterWS = new ClusterWS({
    url: 'url to the server without http' ex: 'localhost',
    port: 'port number' ex: 3000
});
```

*ClusterWS all options:*

```js
{
    url: '{string} url of the server without http or https',
    port: '{number} port of the server',
    autoReconnect: '{boolean} allow to auto-reconnect to the server on lost connection (default false)',
    reconnectionInterval: '{number} how often it will try to reconnect in ms (default 10000)',
    reconnectionAttempts: '{number} how many times try to reconnect 0 means without limit (default 0)'
}
```


### Listen on events from the server:

To listen on event use `'on'` method which is provided by ClusterWS:

```js
clusterWS.on('any event name', function(data){
       console.log(data);
});
```

You can listen on any event which you emit from the server also you can listen on **Reserved event** which are emitting by the server automatically :)

Data which you get in `function(data)` it what you send with event, you can send any type of data.

**Reserved events**: `'connect'`, `'error'`, `'disconnect'`.

### Emit an event:

To emit and event to the server you should use `send` method which provided by ClusterWS:

```js
clusterWS.send('event name', data);
```

`data` can be any type you want.

**Never emit reserved events**: `'connect'`, `'error'`, `'disconnect'`.

### Subscribe and publish to the channels:

After you subscribe to the channel you will be able to get all messages which are publishing on this channel. Also you will be able to publish your messages.

```js
var channel = clusterWS.subscribe('channel name');

channel.watch(function(data){
    console.log(data);
});
```

channel.publish('some data');

Or you can chain everything:

```js
var channel = clusterWS.subscribe('channel name').watch(function(data){
    console.log(data);
}).publish('some data');
```

`data` can be any type you want.


# Happy codding !!! :sunglasses:
