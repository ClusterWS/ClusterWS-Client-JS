let socket = new ClusterWSClient({
  url: "ws://localhost:3001",
  // autoReconnect: true,
  // autoReconnectOptions: {
  //   attempts: 10,
  //   minInterval: 10000,
  //   maxInterval: 100000
  // }
});

socket.on('message', async (message) => {
  console.log(message);
  socket.processMessage(message);
});

socket.on('ping', () => {
  console.log('Received ping');
});

socket.on('close', (code, reason) => {
  console.log(code, reason);
});


setTimeout(() => {
  let helloWorldChannel = socket.subscribe('hello world', (message) => {
    console.log(message);
    // out messages will be here
  });

  helloWorldChannel.on('subscribed', () => {
    console.log("Recieved from here", helloWorldChannel);
  });

  helloWorldChannel.on('canceled', () => {
    console.log('This channel is canceled', helloWorldChannel);
  })

  setInterval(() => {
    helloWorldChannel.publish("Testing if it works correctly");
  }, 1000);

  console.log(helloWorldChannel);
}, 5000)