# ClusterWS Client JavaScript
[![npm version](https://badge.fury.io/js/clusterws-client-js.svg)](https://badge.fury.io/js/clusterws-client-js)
[![GitHub version](https://badge.fury.io/gh/goriunov%2FClusterWS-Client-JS.svg)](https://badge.fury.io/gh/goriunov%2FClusterWS-Client-JS)

This is official JavaScript client for [ClusterWS](https://github.com/goriunov/ClusterWS).

[ClusterWS](https://github.com/goriunov/ClusterWS) - is a minimal **Node JS http & real-time** framework which allows to scale WebSocket ([uWS](https://github.com/uNetworking/uWebSockets) - one of the fastest WebSocket libraries) between [Node JS Clusters](https://nodejs.org/api/cluster.html) and utilize all available CPU.

**Current minified version is under 6KB.**

**This library require [ClusterWS](https://github.com/goriunov/ClusterWS) on the server**

### Installation
To install ClusterWS Client JS run:
```js
npm install --save clusterws-client-js
```
or use globally: 

1. Find `ClusterWS.(min).js`  in `dist/browser` folder.
2. Use standard script tag to import library `<script src="path/to/ClusterWS.[min].js"></script>`.
3. Done, now you can use it as `ClusterWS`.


## Socket
### 1. Connecting
You can connect to the server with the following code: 
```js
var cws = new ClusterWS({
    url: 'localhost',
    port: 80
})
```

in case if you are using builders like `webpack` and `npm` then you need to import library at the top with: 
```js
var ClusterWS = require('clusterws-client-js').ClusterWS
```

*All available options of ClusterWS:*
```js
{
    url: '{string} url of the server without http or https. (must be provided)',
    port: '{number} port of the server. (must be provided)',
    autoReconnect: '{boolean} allow to auto-reconnect to the server on lost connection. (default false)',
    reconnectionInterval: '{number} how often it will try to reconnect. (default 5000) in ms',
    reconnectionAttempts: '{number} how many times to try, 0 means without limit. (default 0)'
}
```

### 2. Listen on events
To listen on events from the server you should use `on` method witch is provided by `cws`
```js
/**
    event name: string - can be any string you wish
    data: any - is what you send from the client
*/
cws.on('event name', function(data){
    // in here you can write any logic
})
```

*Also `cws` gets **Reserved Events** such as `'connect'`, `'disconnect'` and `'error'`*
```js
cws.on('connect', function(){
    // in here you can write any logic
})

/**
    err: any - display the problem with your weboscket
*/
cws.on('error', function(err){
    // in here you can write any logic
})

/**
    code: number - represent the reason in number
    reason: string - reason why your socket was disconnected
*/
cws.on('disconnect', function(code, reason){
    // in here you can write any logic
})
```

### 3. Send events
To send events to the server use `send` method witch is provided by `cws`
```js
/**
    event name: string - can be any string you wish (client must listen on this event name)
    data: any - is what you want to send to the client
*/
cws.send('event name', data)
```

*Avoid emitting **Reserved Events** such as `'connect'`, `'connection'`, `'disconnect'` and `'error'`. Also avoid emitting  event and events with `'#'` at the start.*

## Pub/Sub
You can subscribe, watch, unsubscribe and publish to the channels
```js
/**
    channel name: string - can be any string you wish
*/
var channel = cws.subscribe('channel name')

/**
    data: any - is what you get when you or some one else publish to the channel
*/
channel.watch(function(data){
 // in here you can write any logic
})

/**
    data: any - is what you want to publish to the channel (everyone who is subscribe will get it)
*/
channel.publish(data)

/**
    This method is used to unsubscribe from the channel
*/
channel.unsubscribe()

/**
    Also you can chain everything in one expression
*/
var channel = cws.subscribe('channel name').watch(function(data){
 // in here you can write any logic
}).publish(data)
```

**To make sure that user is connected to the server before subscribing, do it on `connect` event or on any other events which you emit from the server, otherwise subscription may not work properly**

*Docs is still under development.*

## Happy codding !!! :sunglasses: