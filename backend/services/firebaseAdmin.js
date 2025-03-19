import dotenv from "dotenv";
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

dotenv.config();

const credentialsPath = "./duel-learn-firebase-adminsdk-65lmy-22bd9929f6.json";

if (!credentialsPath) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not defined in environment variables.");
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://duel-learn-default-rtdb.firebaseio.com/',
});

export default admin;