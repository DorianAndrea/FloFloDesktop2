import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import FloCard from "./FloCard";

const DraggableFloCard = ({
  id,
  data = {},
  disabled = false,
  className = "",
  ...floCardProps
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : "auto",
    touchAction: "none",
  };

  return (
    <FloCard
      ref={setNodeRef}
      {...floCardProps}
      draggable={!disabled}
      disabled={disabled}
      dragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
      style={style}
      className={className}
    />
  );
};

export default DraggableFloCard;