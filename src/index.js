import express from 'express'
import paymentRoutes from './routes/payment.routes.js';
import { PORT } from './config.js'; // Import your config
import { Server } from 'http';
import { sendToDialogflowCX } from './utils/dialogflow.js';
import { Server as SocketIO } from 'socket.io';
import path from 'path'
import fs from 'fs'

// Firebase Admin
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Environment Variables
dotenv.config();

const firebaseCredentialsBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;

// Check if credentials are available
if (!firebaseCredentialsBase64) {
  console.error('Firebase credentials are missing in the .env file');
  process.exit(1);
}

// Decode the base64 string to get the JSON data
const firebaseCredentials = JSON.parse(Buffer.from(firebaseCredentialsBase64, 'base64').toString('utf-8'));


// const credentialsPath = path.resolve('firebase-credentials.json');
// if (!fs.existsSync(credentialsPath)) {
//   console.error(`Firebase credentials file not found at: ${credentialsPath}`);
//   process.exit(1);
// }

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials)
});

const app = express()
const server = Server(app); // Create HTTP server
const io = new SocketIO(server); // Initialize Socket.IO

// Middleware
app.use(express.json());
app.use(express.static(path.resolve('src/public'))); // Static folder for public assets

// Routes
app.use('/payments', paymentRoutes); // Payment routes

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle 'new_message' events
  socket.on('new_message', async (chatMessage) => {
    try {
      console.log('Received new message:', chatMessage);
      const response = await sendToDialogflowCX(chatMessage.message);
      console.log('Dialogflow response:', response);
  
      // Emit response back to client
      socket.emit('broadcast', response);
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process your message.' });
    }
  });
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});