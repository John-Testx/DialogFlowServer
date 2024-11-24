const express = require('express');
const Transbank = require('transbank-sdk');
const uuid = require('uuid');
const router = express.Router();

const webpay = new Transbank.WebpayPlus.Transaction(
  'YOUR_COMMERCE_CODE',
  'YOUR_API_KEY',
  'https://webpay3gint.transbank.cl' // Use .Production for live payments
);

const returnUrl = 'http://localhost:3000/transaction-result';
const finalUrl = 'http://localhost:3000/payment-completed';



router.post('/create-payment', async (req, res) => {
    const orderId = uuid.v4(); // Generate a unique identifier for the order
    const sessionId = uuid.v4(); // Generate a unique session ID
    const { amount } = req.body; // Destructure only 'amount' from the request body
  
    console.log('Request Body:', req.body);
  
    if (!amount) {
      return res.status(400).json({ error: "'amount' is required" });
    }
  
    try {
      const createResponse = await webpay.create(
        orderId, // Unique order identifier
        sessionId, // Unique session identifier
        amount,
        returnUrl,
        finalUrl
      );
  
      res.json({
        url: createResponse.url,
        token: createResponse.token,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });
  

router.post('/transaction-result', async (req, res) => {
  const { token_ws } = req.body;

  try {
    const commitResponse = await webpay.commit(token_ws);

    if (commitResponse.status === 'AUTHORIZED') {
      res.status(200).send('Payment Successful');
    } else {
      res.status(400).send('Payment Failed');
    }
  } catch (error) {
    console.error('Error during transaction:', error);
    res.status(500).send('Transaction Error');
  }
});

module.exports = router;
