# ClusterWS (Node Cluster WebSocket) Client Javascript

[![npm version](https://badge.fury.io/js/clusterws-client-js.svg)](https://badge.fury.io/js/clusterws-client-js)

This is a **Beta Version** that is why library may lack some important features :) . You can see main changes in [HERE](./information/CHANGELOG.md). Possible next versions fetchers in [HERE](./information/PLANS.md).

This is small official JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), which is using standard browser WebSocket.
Library has been written in TypeScript and compile down to es5. You can find all development code in `src/` folder  and all compiled code in `dist/` folder.

**Current minified size is less then 5KB.**

### Installation:

Use npm :

```js
npm install --save clusterws-client-js
```

Or globally:

1. Find ClusterWS.(min).js  in dist/browser
2. Use standard script to import library `<script src="path/to/ClusterWS.(min).js"></script>`
3. Done you can use it 'ClusterWS' :)


### Connect to the server:

When library is global you can connect like that:

```js
var clusterWS = new ClusterWS({
    url: 'url to the server with out http' ex: 'localhost',
    port: 'port number' ex: 3000
});
```

If you installed library from npm then you have to use require or import:

```js
var ClusterWS = require('clusterws-client-js').ClusterWS

var clusterWS = new ClusterWS({
    url: 'url to the server with out http' ex: 'localhost',
    port: 'port number' ex: 3000
});
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
