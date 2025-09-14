import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug Firebase configuration
console.log('Firebase config check:');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing');
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing');
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing');
console.log('Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing');
console.log('Messaging Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing');
console.log('App ID:', import.meta.env.VITE_FIREBASE_APP_ID ? 'Present' : 'Missing');

// Validate Firebase configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  console.error('Please create a .env file with your Firebase configuration.');
  console.error('See .env.example for the required variables.');
} else {
  console.log('✅ All Firebase environment variables are present');
}

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('This might be due to:');
  console.error('1. Invalid Firebase configuration');
  console.error('2. Firebase project not properly set up');
  console.error('3. Network connectivity issues');
  console.error('4. Firebase project permissions');
}

export { auth, db };
export default app;
