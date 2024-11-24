const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const dialogflow = require('./dialogflow'); 
const webpayRoutes = require('./webpay'); 

dotenv.config();

// Initialize Firebase Admin with the credentials file
admin.initializeApp({
  credential: admin.credential.cert('./firebase-credentials.json')
});

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Create session client and path
const client = new SessionsClient({
  apiEndpoint: 'us-central1-dialogflow.googleapis.com'  // Specify the correct regional endpoint
});

app.use(express.json());

// Use the webpay routes
app.use('/', webpayRoutes);

io.on('connection', socket => {
  // Listen for 'new_message' events from the client
  socket.on('new_message', async (chatMessage) => {
    console.log('Received new message:', chatMessage); // Check this log
    const response = await dialogflow.sendToDialogflowCX(chatMessage.message);
    console.log('Dialogflow response:', response); // Log the response from Dialogflow
    
    // Send the response from Dialogflow back to the client
    socket.emit('broadcast', response);
  
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
  console.log('A user disconnected');
  });

})

app.get('/', (req, res) => {
    res.send('Server is running')
});


const port = 3000;
server.listen(port, () => {
    console.log(`server running at ${port}...`)
})