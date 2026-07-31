import type { Lead } from "@/generated/prisma/client";

type DateKeys = "postedAt" | "foundAt" | "draftGeneratedAt" | "repliedAt" | "createdAt" | "updatedAt";

/** Shape of a Lead after it round-trips through JSON (Dates become ISO strings). */
export type SerializedLead = Omit<Lead, DateKeys> & {
  [K in DateKeys]: null extends Lead[K] ? string | null : string;
};

export interface ContactInfo {
  emails: string[];
  discord: string[];
  dmsOpen: boolean;
  otherNotes: string;
}
