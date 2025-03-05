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
  created_by_id: string;
  total_views: number;
  updated_at: string;

  items: Item[];
  study_material_id: string;
  visibility: number;
}
