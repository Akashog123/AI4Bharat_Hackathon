import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserProfile } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProfileCompletion(profile: UserProfile): number {
  let score = 0;
  if (profile.name) score += 15;
  if (profile.education_level) score += 15;
  if (profile.skills?.length > 0) score += 20;
  if (profile.work_experience?.length > 0) score += 20;
  if (profile.location_preference) score += 15;
  if (profile.job_type_preference) score += 15;
  return score;
}
