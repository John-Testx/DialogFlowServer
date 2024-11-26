import { SessionsClient } from '@google-cloud/dialogflow-cx';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION || 'us-central1';
const agentId = process.env.DIALOGFLOW_AGENT_ID;
const environment = 'Draft'; // or your specific environment ID
const languageCode = 'es';

const client = new SessionsClient({
  apiEndpoint: `${location}-dialogflow.googleapis.com`,
});

export async function sendToDialogflowCX(message) {
  const sessionId = Math.random().toString(36).substring(7);
  console.log('Sending message to Dialogflow CX with session ID:', sessionId);

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

  console.log('Request:', JSON.stringify(request, null, 2));

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

    console.error('Error communicating with Dialogflow CX:', JSON.stringify(error, null, 2));
    return "Sorry, there was an error processing your request.";
    
  }
}