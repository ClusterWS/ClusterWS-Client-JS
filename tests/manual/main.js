let socket = new ClusterWSClient({
  url: "ws://localhost:3001"
});


socket.on('message', async (message) => {
  console.log(message);
});

socket.on('ping', () => {
  console.log('Received ping');
});
