import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItemComponent from "../material-create/ItemComponent"; // Adjust path accordingly
import { SortableItemProps } from "./itemComponent";

export function SortableItem({
  id,
  item,
  deleteItem,
  updateItem,
  isError = false, // Make sure it's in the props
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    // Add this to track active state
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create clean drag handle props
  const dragHandleProps = {
    attributes,
    listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItemComponent
        item={item}
        deleteItem={deleteItem}
        updateItem={updateItem}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
        isError={isError}
      />
    </div>
  );
}
