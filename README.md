# ClusterWS (Node Cluster WebSocket) Client JavaScript

[![npm version](https://badge.fury.io/js/clusterws-client-js.svg)](https://badge.fury.io/js/clusterws-client-js)

ClusterWS - is a minimal **Node JS http & real-time** framework which allows to scale WebSocket ([uWS](https://github.com/uNetworking/uWebSockets) - one of the fastest WebSocket libraries) between node js clusters and utilize all available CPU.

This is official Client JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), which is written in TypeScript and compiling down to es5 modules. All development code can be found in `src/` folder and compiled code in `dist/`.

[ClusterWS CHANGELOG.](./information/CHANGELOG.md)

**Current minified version is less then 7KB.**

**You must use [ClusterWS](https://github.com/goriunov/ClusterWS) on the server with this library**

## Installation

Use npm :

```js
npm install --save clusterws-client-js
```

Or globally without npm:

1. Find ClusterWS.(min).js  in `dist/browser` folder
2. Use standard script tag to import library `<script src="path/to/ClusterWS.[min].js"></script>`
3. Done, now you can use it as `ClusterWS` :)

## Socket

### 1. Connect to the server

When library is global you can connect it like following:

#### **Code:**

```js
var clusterWS = new ClusterWS({
    url: 'localhost',
    port: 3000
});
```

If you have installed library from `npm` then you have to use `require` or `import`:

#### **Code:**

```js
var ClusterWS = require('clusterws-client-js').ClusterWS

var clusterws = new ClusterWS({
    url: 'localhost',
    port: 3000
});
```

*ClusterWS all options:*

```js
{
    url: '{string} url of the server without http or https',
    port: '{number} port of the server',
    autoReconnect: '{boolean} allow to auto-reconnect to the server on lost connection (default false)',
    reconnectionInterval: '{number} how often it will try to reconnect in ms (default 10000)',
    reconnectionAttempts: '{number} how many attempts, 0 means without limit (default 0)'
}
```

### 2. Listen on events from the server

To listen on event use `'on'` method which is provided by ClusterWS:

#### **Code:**

```js
clusterws.on('any event name', function(data){
       console.log(data);
});
```

*You can listen on any event which you emit from the server, also you can listen on **Reserved events** which are emitted by the server automatically.*

*Data which you get in `function(data){}` is what you send with event, you can send `any type of data`.*

***Reserved events**: `'connect'`, `'error'`, `'disconnect'`*

### 3. Emit an event

To emit an event to the server you should use `send` method which is provided by ClusterWS:

```js
clusterws.send('event name', data);
```

*`'data'` can be any type you want such as array, string, object, ...*

***Try to avoid emitting reserved events:** `'connect'`, `'error'`, `'disconnect'`, or any events which start with `'#'`*

## Pub/Sub

### 1. Subscribe watch and publish to the channels

You can subscribe to `any channels`:

#### **Code:**


```js
// Subscribe to channel
var channel = clusterws.subscribe('channel name');
```

After you subscribe to the `channel` you will be able to get all messages which are published to this `channel` and you will also be able to publish your messages there:

#### **Code:**

```js
// Listen on the data from channel
channel.watch(function(data){
    console.log(data);
});

// Publish data to channel
channel.publish('some data');
```

Or you can chain everything:

#### **Code:**

```js
var channel = clusterws.subscribe('channel name').watch(function(data){
    console.log(data);
}).publish('some data');
```

*`'data'` can be any type you want such as array, string, object, ...*

**To make sure that user is connected to the server before subscribing, do it on `connect` event or on any other events which you emit from the server, otherwise subscription will not work properly**

# Happy codding !!! :sunglasses:
