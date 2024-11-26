import { SessionsClient } from '@google-cloud/dialogflow-cx';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION || 'us-central1';
const agentId = process.env.DIALOGFLOW_AGENT_ID;
const environment = 'Draft'; // or your specific environment ID
const languageCode = 'es';

// Decode the base64 encoded service account JSON from environment variable
const keyFileBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

if (!keyFileBase64) {
  console.error('Base64 encoded service account key is not set.');
  process.exit(1);
}

const decodedKey = Buffer.from(keyFileBase64, 'base64').toString('utf8');

// Parse the decoded string to a JSON object
let credentials;
try {
  credentials = JSON.parse(decodedKey);
} catch (error) {
  console.error('Failed to parse service account key:', error);
  process.exit(1);
}

const client = new SessionsClient({
  apiEndpoint: `${location}-dialogflow.googleapis.com`,
  credentials: {
    private_key: credentials.private_key,
    client_email: credentials.client_email,
  },
});

export async function sendToDialogflowCX(message) {
  const sessionId = Math.random().toString(36).substring(7);
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