import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export interface WaterRating {
  id?: string;
  location: string;
  rating: string;
  comment: string;
  name: string;
  date: string;
  drawing: string; // Base64 data URL or storage URL
  createdAt?: Timestamp;
}

const COLLECTION_NAME = "waterRatings";

/**
 * Upload a drawing to Firebase Storage and return the download URL
 */
export async function uploadDrawing(
  drawingDataUrl: string,
  ratingId: string
): Promise<string> {
  // If empty canvas or no drawing, return empty string
  if (!drawingDataUrl || drawingDataUrl === "data:,") {
    return "";
  }

  const storageRef = ref(storage, `drawings/${ratingId}.png`);
  await uploadString(storageRef, drawingDataUrl, "data_url");
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

/**
 * Add a new water rating to Firestore
 */
export async function addWaterRating(
  rating: Omit<WaterRating, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...rating,
    drawing: "", // Will be updated after upload
    createdAt: Timestamp.now(),
  });

  // If there's a drawing, upload it and update the document
  if (rating.drawing && rating.drawing !== "data:,") {
    const drawingUrl = await uploadDrawing(rating.drawing, docRef.id);
    // We'll store the drawing URL but for simplicity, we include it in the initial add
    // For a more robust solution, you'd update the doc after upload
    await addDoc(collection(db, COLLECTION_NAME), {
      ...rating,
      drawing: drawingUrl,
      createdAt: Timestamp.now(),
    });
  }

  return docRef.id;
}

/**
 * Add a water rating with drawing upload in one operation
 */
export async function submitWaterRating(
  rating: Omit<WaterRating, "id" | "createdAt">
): Promise<string> {
  console.log("submitWaterRating called with:", { ...rating, drawing: rating.drawing ? "exists" : "none" });

  // First, create the document to get an ID
  const tempId = `temp_${Date.now()}`;
  let drawingUrl = "";

  // Upload drawing first if exists
  if (rating.drawing && rating.drawing !== "data:,") {
    console.log("Uploading drawing...");
    try {
      drawingUrl = await uploadDrawing(rating.drawing, tempId);
      console.log("Drawing uploaded successfully:", drawingUrl);
    } catch (error) {
      console.error("Error uploading drawing:", error);
      // Continue without drawing if upload fails
    }
  } else {
    console.log("No drawing to upload");
  }

  // Add document with drawing URL
  console.log("Adding document to Firestore...");
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      location: rating.location,
      rating: rating.rating,
      comment: rating.comment,
      name: rating.name,
      date: rating.date,
      drawing: drawingUrl,
      createdAt: Timestamp.now(),
    });
    console.log("Document added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document to Firestore:", error);
    throw error;
  }
}

/**
 * Get all water ratings from Firestore, ordered by creation date
 */
export async function getAllWaterRatings(): Promise<WaterRating[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const ratings: WaterRating[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    ratings.push({
      id: doc.id,
      location: data.location || "",
      rating: data.rating || "",
      comment: data.comment || "",
      name: data.name || "",
      date: data.date || "",
      drawing: data.drawing || "",
      createdAt: data.createdAt,
    });
  });

  return ratings;
}

/**
 * Get a single water rating by ID
 */
export async function getWaterRating(id: string): Promise<WaterRating | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      location: data.location || "",
      rating: data.rating || "",
      comment: data.comment || "",
      name: data.name || "",
      date: data.date || "",
      drawing: data.drawing || "",
      createdAt: data.createdAt,
    };
  }

  return null;
}
