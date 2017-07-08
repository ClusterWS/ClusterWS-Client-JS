# ClusterWS (Node Cluster WebSocket) Client Javascript

This is Beta version 0.0.3. You can see main changes in [CHANGELOG](./information/CHANGELOG.md).

This is small official JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), which is using standard browser WebSocket.
Library has been written in TypeScript and compile down to es5. You can find all development code in `src/` folder  and all compiled code in `dist/` folder.

### Installation:

Use npm :

    npm i --save clusterws-client-js

Use in script tag:

    1. Find ClusterWS.(min).js  in dist/browser
    2. Use standard script to import library <script src="path/to/ClusterWS.(min).js"></script>
    3. You can run it :)


### Connect to the server:

When you use global variable you can do like that:

    var clusterWS = new ClusterWS({
        url: 'url to the server with out http' ex: 'localhost',
        port: 'port number' ex: 3000
    });

If if you installed library from npm then use require or import:

    var ClusterWS = require('clusterws-client-js').ClusterWS

    var clusterWS = new ClusterWS({
        url: 'url to the server with out http' ex: 'localhost',
        port: 'port number' ex: 3000
    });

### Listen on events from the server:

To listen on event use `'on'` method:

    clusterWS.on('any event name', function(data){
           console.log(data);
    });

You can listen on any event which you emit from the server also you can listen on Reserve event which are emitting from the server when time comes:)

Data which you get in function it what you send with event, it can be any type of data.

Reserved events: `'connect'`, `'error'`, `'disconnect'`.

### Emit an event:

    clusterWS.send('event name', data);  // Can send any type of data

Reserved, do not emit this events: `'connect'`, `'error'`, `'disconnect'`.

### Subscribe and publish to the channels:

    var channel = clusterWS.subscribe('channel name');

    channel.watch(function(data){
        console.log(data);
    });

    channel.publish('some data');  // Can publish any type of data

    Or you can chain:

    var channel = clusterWS.subscribe('channel name').watch(function(data){
        console.log(data);
    }).publish('some data');

## Happy codding !!! :sunglasses:
