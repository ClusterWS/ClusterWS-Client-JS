# ClusterWS (Node Cluster WebSocket) Client Javascript

### Under development. [Server](https://github.com/goriunov/ClusterWS)

This is small official JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), this library is using standard browser WebSocket.
Library has been written in TypeScript and compile down to es5. You can find all code in to `src/` and all compiled code in `dist/`.

### Installation:

Use npm :

`(Will be upload after all main function will be completed);`

Use in script tag:

    1. Find ClusterWS.(min).js  in dist/browser
    2. Use standard script to import library <script src="path/to/ClusterWS.(min).js"></script>
    3. You can run it :)

    * All the code must be written after installation

### Connect to the server:

    var clusterWS = new ClusterWS({
        url: 'url to the server with out http' ex: 'localhost',
        port: 'port number' ex: 3000
    });

### Listen to events:

    clusterWS.on('any event name', function(data){
           console.log(data);
    });

Reserved events: `'connect'`, `'error'`, `'disconnect'`.

### Emit an event:

    clusterWS.send('event name', data);  // Can send any type of data

Reserved, do not emit this events: `'connect'`, `'error'`, `'disconnect'`.

### Subscribe and publish to the channels:

    var channel = clusterWS.subscribe('channel name');

    channel.watch(function(data){
        console.log(data);
    });

    channel.publish('some data');

    Or you can chain:

    var channel = clusterWS.subscribe('channel name').watch(function(data){
        console.log(data);
    }).publish('some data');


## Happy codding !!! :smile:
