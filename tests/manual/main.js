let socket = new ClusterWSClient({
  url: "ws://localhost:3001",
  autoReconnect: true
});

socket.on('message', async (message) => {
  console.log(message);
});

socket.on('ping', () => {
  console.log('Received ping');
});

socket.on('close', (code, reason) => {
  console.log(code, reason);
});
