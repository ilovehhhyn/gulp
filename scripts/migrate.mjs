/**
 * One-time migration script.
 * Run AFTER `npm install` with:  node scripts/migrate.mjs
 *
 * What it does:
 *   1. Deletes all documents where name is "awa" or "jupy" (case-insensitive).
 *   2. For every remaining document:
 *      - Sets waterLocation = existing location (or city) field.
 *      - Sets city = "Princeton".
 *      - Keeps all other fields intact.
 */

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

config(); // loads .env

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION = "waterRatings";
const DELETE_NAMES = new Set(["awa", "jupy"]);
const DELETE_LOCATIONS = new Set(["zephyrhills", "zephyhills", "florida"]);

async function migrate() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  let deleted = 0;
  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const name = String(data.name ?? "").toLowerCase().trim();

    const locationCheck = String(data.waterLocation ?? data.location ?? data.city ?? "").toLowerCase().trim();
    if (DELETE_NAMES.has(name) || DELETE_LOCATIONS.has(locationCheck)) {
      await deleteDoc(doc(db, COLLECTION, docSnap.id));
      console.log(`  DELETED ${docSnap.id}  (name: ${data.name}, location: ${data.location ?? data.city})`);
      deleted++;
      continue;
    }

    // waterLocation = the most specific location field already stored
    const waterLocation =
      data.waterLocation ||
      data.location ||
      data.city ||
      "";

    await updateDoc(doc(db, COLLECTION, docSnap.id), {
      waterLocation,
      city: "Princeton",
    });
    console.log(`  UPDATED ${docSnap.id}  (waterLocation: "${waterLocation}")`);
    updated++;
  }

  console.log(`\nDone.  deleted=${deleted}  updated=${updated}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
