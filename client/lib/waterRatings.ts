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
import { db } from "./firebase";
import { WaterEntry } from "@shared/api";

export type { WaterEntry };

// Legacy shape still in Firestore from old entries
export interface WaterRating {
  id?: string;
  location: string;
  rating: string;
  comment: string;
  name: string;
  date: string;
  drawing: string;
  createdAt?: Timestamp;
}

const COLLECTION_NAME = "waterRatings";

function docToEntry(id: string, data: Record<string, unknown>): WaterEntry {
  const rawRating = data.rating;
  const rating =
    typeof rawRating === "number"
      ? rawRating
      : parseFloat(String(rawRating ?? "0")) || 0;

  return {
    id,
    date: String(data.date ?? ""),
    waterLocation: String(data.waterLocation ?? data.location ?? data.city ?? ""),
    city: typeof data.city === "string" ? data.city : undefined,
    name: String(data.name ?? ""),
    rating,
    description: String(data.description ?? data.comment ?? ""),
    drawing: typeof data.drawing === "string" ? data.drawing : undefined,
    createdAt: data.createdAt,
  };
}

export async function submitWaterEntry(
  entry: Omit<WaterEntry, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    waterLocation: entry.waterLocation,
    location: entry.waterLocation, // backward compat alias
    city: entry.city ?? "",
    name: entry.name,
    date: entry.date,
    rating: entry.rating,
    description: entry.description,
    comment: entry.description, // backward compat alias
    drawing: "",
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAllWaterEntries(): Promise<WaterEntry[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const entries: WaterEntry[] = [];
  snapshot.forEach((d) => {
    entries.push(docToEntry(d.id, d.data() as Record<string, unknown>));
  });
  return entries;
}

export async function getWaterEntry(id: string): Promise<WaterEntry | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToEntry(docSnap.id, docSnap.data() as Record<string, unknown>);
}

// Legacy helpers kept so old code paths compile
export async function getAllWaterRatings(): Promise<WaterRating[]> {
  const entries = await getAllWaterEntries();
  return entries.map((e) => ({
    id: e.id,
    location: e.waterLocation,
    rating: String(e.rating),
    comment: e.description,
    name: e.name,
    date: e.date,
    drawing: e.drawing ?? "",
    createdAt: e.createdAt as Timestamp | undefined,
  }));
}

export async function submitWaterRating(
  rating: Omit<WaterRating, "id" | "createdAt">
): Promise<string> {
  return submitWaterEntry({
    waterLocation: rating.location,
    name: rating.name,
    date: rating.date,
    rating: parseFloat(rating.rating) || 0,
    description: rating.comment,
  });
}
