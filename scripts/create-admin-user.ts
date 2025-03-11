// Create a setup script at scripts/create-admin-user.ts
// import { initializeApp } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';

// const app = initializeApp();
// const auth = getAuth(app);

// async function createAdminUser() {
//   try {
//     const user = await auth.createUser({
//       email: 'terahjones3@gmail.com',
//       password: '104006768tj3.',
//       emailVerified: true
//     });
    
//     await auth.setCustomUserClaims(user.uid, { admin: true });
//     console.log('Admin user created:', user.uid);
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//   }
// }

// createAdminUser();

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Admin SDK
const serviceAccount = require('../firebase-admin-key.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
});

async function createAdminUser(email: string, password: string) {
  try {
    const user = await getAuth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });

    // Set custom admin claim
    await getAuth().setCustomUserClaims(user.uid, { 
      admin: true,
      ieeeMember: true
    });

    console.log(`✅ Successfully created admin user: ${email}`);
    console.log(`UID: ${user.uid}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Get credentials from environment
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  process.exit(1);
}

// Execute creation
createAdminUser(adminEmail, adminPassword);