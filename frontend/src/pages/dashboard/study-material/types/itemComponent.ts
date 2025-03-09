import { DraggableSyntheticListeners } from "@dnd-kit/core";

export interface StudyItem {
  id: number;
  item_number: number;
  term: string;
  definition: string;
  image?: string | File | null;
}

export interface DragHandleProps {
  listeners?: DraggableSyntheticListeners;
  attributes?: {
    role?: string;
    tabIndex?: number;
    "aria-pressed"?: boolean;
    "aria-roledescription"?: string;
    "aria-describedby"?: string;
  };
}

export interface ItemComponentProps {
  item: StudyItem;
  deleteItem: () => void;
  updateItem: (field: string, value: string | File | null) => void;
  dragHandleProps?: DragHandleProps;
  isDragging?: boolean;
}

export interface SortableItemProps {
  id: number;
  item: StudyItem;
  deleteItem: () => void;
  updateItem: (field: string, value: string | File | null) => void;
}
