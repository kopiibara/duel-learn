import admin from 'firebase-admin';

let serviceAccount;

try {
  // Decode the base64 credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable is not set');
  }
  
  serviceAccount = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8')
  );
  
  console.log('Successfully parsed Firebase admin credentials from base64');
} catch (error) {
  console.error('Error initializing Firebase admin:', error);
  throw new Error(`Failed to initialize Firebase: ${error.message}`);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://duel-learn-default-rtdb.firebaseio.com/',
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export default admin;
