let socket = new ClusterWSClient({
  url: "ws://localhost:3001",
  autoReconnect: true,
  autoReconnectOptions: {
    attempts: 10,
    minInterval: 10000,
    maxInterval: 100000
  }
});

socket.on('open', () => {
  console.log('Socket has been open');
});

// socket.on('message', async (message) => {
//   console.log(message);
//   socket.processMessage(message);
// });

socket.on('ping', () => {
  console.log('Received ping');
});

socket.on('close', (code, reason) => {
  console.log(code, reason);
});


let helloWorldChannel = socket.subscribe('hello world', (message) => {
  console.log("Received message in hello world", message);
});

helloWorldChannel.on('subscribed', () => {
  console.log('Channels hello world has been subscribed');
});
