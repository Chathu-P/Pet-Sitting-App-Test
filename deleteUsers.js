const admin = require('firebase-admin');

// You need to download your service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in this directory
const serviceAccount = require('./pet-sitting-app-cc7e7-firebase-adminsdk-fbsvc-9f3446d4fc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteUsersCollection() {
  try {
    const collectionRef = db.collection('Users');
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
      console.log('No documents found in Users collection');
      return;
    }
    
    console.log(`Found ${snapshot.size} documents to delete`);
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      console.log(`Deleting document: ${doc.id}`);
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✓ Users collection deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting Users collection:', error);
    process.exit(1);
  }
}

deleteUsersCollection();
