export interface Item {
  term: string;
  definition: string;
  image?: string | null;
}

export interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: number;
  created_by: string;
  total_views: number;
  created_at: string;
  items: Item[];
  study_material_id: string;
  visibility: number;
}
