import { StudyMaterial } from "../types/studyMaterialObject";

// Persistent cache across navigations
export const tabDataCache = {
  initialized: false,
  data: {} as { [key: number]: { items: StudyMaterial[]; timestamp: number } },
};

export const libraryCache = {
  initialized: false,
  userMaterials: [] as StudyMaterial[],
  bookmarkedMaterials: [] as StudyMaterial[],
  userMaterialsTimestamp: 0,
  bookmarkedMaterialsTimestamp: 0,
};

// Check if data needs refresh
export const needsRefresh = (timestamp?: number): boolean => {
  if (!timestamp) return true;
  // Refresh if data is older than 2 minutes
  return Date.now() - timestamp > 120000;
};
