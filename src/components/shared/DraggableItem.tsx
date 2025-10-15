import { ReactNode, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";

type ItemType = 'order' | 'cmo';

interface DraggableItemProps<T = any> {
  id: string;
  type: ItemType;
  children: ReactNode;
  data?: T;
  className?: string;
  onDrop?: (item: { id: string; type: ItemType; data?: T }) => void;
  disabled?: boolean;
}

export const DraggableItem = <T extends object>({ 
  id, 
  type, 
  children, 
  data, 
  className, 
  onDrop,
  disabled = false 
}: DraggableItemProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, type, data },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: type,
    canDrop: (item: { id: string; type: ItemType }) => item.id !== id,
    drop: (item) => onDrop?.(item),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full transition-all duration-200 rounded-lg",
        "border border-transparent",
        isDragging 
          ? "opacity-50 scale-95" 
          : "hover:shadow-md hover:border-border",
        isActive && "ring-2 ring-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      draggable={!disabled}
    >
      {children}
      {isActive && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};
