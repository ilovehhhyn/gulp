/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
}

export interface WaterEntry {
  id?: string;
  date: string;           // ISO date string e.g. "2026-05-31"
  waterLocation: string;  // specific water location
  city?: string;          // city (Princeton for existing data)
  name: string;           // person who created the entry
  rating: number;         // 0–10
  description: string;
  drawing?: string;       // legacy field — kept for backward compat
  createdAt?: unknown;
}
