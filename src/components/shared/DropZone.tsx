import React, { ReactNode, useCallback } from "react";
import { useDrop } from "react-dnd";
import { cn } from "@/lib/utils";

type ItemType = 'order' | 'cmo';

interface DropZoneProps<T = any> {
  accept: ItemType | ItemType[];
  onDrop: (item: T) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const DropZone = <T extends { id: string }>({ 
  accept, 
  onDrop, 
  children, 
  className,
  disabled = false
}: DropZoneProps<T>) => {
  const handleDrop = useCallback((item: T) => {
    if (!disabled) {
      onDrop(item);
    }
  }, [onDrop, disabled]);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: handleDrop,
    canDrop: () => !disabled,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const showHighlight = isOver && canDrop && !disabled;

  return (
    <div 
      ref={drop}
      className={cn(
        "relative w-full min-h-24 rounded-lg transition-colors duration-200",
        "border-2 border-transparent",
        showHighlight 
          ? "border-primary bg-primary/5" 
          : "border-dashed border-muted-foreground/20 hover:border-muted-foreground/40",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        minHeight: '6rem',
      }}
    >
      <div className={cn(
        "h-full w-full flex flex-col items-center justify-center",
        "transition-opacity duration-200",
        showHighlight ? "opacity-100" : "opacity-0"
      )}>
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          Drop here to assign
        </div>
      </div>
      
      <div className={cn(
        "w-full h-full",
        showHighlight && "opacity-20"
      )}>
        {React.Children.count(children) === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground/50 p-4">
            <p>Drop {typeof accept === 'string' ? accept : 'items'} here</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
