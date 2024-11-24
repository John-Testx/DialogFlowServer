const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const dotenv = require('dotenv');

dotenv.config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION || 'us-central1';
const agentId = process.env.DIALOGFLOW_AGENT_ID;
const environment = 'Draft'; // or your specific environment ID
const languageCode = 'es';

const client = new SessionsClient({
  apiEndpoint: `${location}-dialogflow.googleapis.com`,
});



async function sendToDialogflowCX(message) {
    const sessionId = Math.random().toString(36).substring(7);
  
    // Construct the session path manually for CX
    const sessionPath = `projects/${projectId}/locations/${location}/agents/${agentId}/environments/${environment}/sessions/${sessionId}`;
  
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
        },
        languageCode,
      },
    };
  
    try {
      const [response] = await client.detectIntent(request);
      if (response.queryResult && response.queryResult.responseMessages) {
        return response.queryResult.responseMessages
          .filter((msg) => msg.text && msg.text.text)
          .map((msg) => msg.text.text.join(' '))
          .join(' ');
      }
      return "Sorry, I couldn't understand that. Could you try again?";
    } catch (error) {
      console.error('Error communicating with Dialogflow CX:', error);
      return "Sorry, there was an error processing your request.";
    }
  }
  
  module.exports = { sendToDialogflowCX };