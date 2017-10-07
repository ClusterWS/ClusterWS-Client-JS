# ClusterWS Client JavaScript
[![npm version](https://badge.fury.io/js/clusterws-client-js.svg)](https://badge.fury.io/js/clusterws-client-js)

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

1. Find ClusterWS.(min).js  in `dist/browser` folder.
2. Use standard script tag to import library `<script src="path/to/ClusterWS.[min].js"></script>`.
3. Done, now you can use it as `ClusterWS`.