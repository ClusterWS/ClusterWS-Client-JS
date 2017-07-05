# ClusterWS (Node Cluster WebSocket) Client Javascript

### Under development. [Server](https://github.com/goriunov/ClusterWS)

This is small official JavaScript library for [ClusterWS](https://github.com/goriunov/ClusterWS), this library is using standard browser WebSocket.

### 1. Installation

Use npm : (Will be upload after all main function will be completed);

Use in script tag:

    1. Find ClusterWS.(min).js  in dist/browser
    2. Use standard script to import library <script src="path/to/ClusterWS.(min).js"></script>
    3. You can run it :)

    * All the code must be written after import the library

### 2. Connect to the server:

    var clusterWS = new ClusterWS({
        url: 'url to the server with out http' ex: 'localhost',
        port: 'port number' ex: 3000
    })

### 3. Listen on events:

    clusterWS.on('any event name', function(data){
           console.log(data);
    })

     * Reserved events:
            connect, (use to listen on connect)
            error,  (use to listen on error)
            disconnect, (use to listen on disconnect)


### 4. Emit an event:

    clusterWS.send('event name', data);

     * Reserved events do not emit this events:
            connect,
            error,
            disconnect