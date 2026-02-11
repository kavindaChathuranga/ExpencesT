import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const SwipeableExpenseItem = ({ children, onDelete, threshold = 80 }) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow swiping left
    if (diff > 0) {
      setOffset(Math.min(diff, threshold * 1.5));
    } else {
      setOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (offset > threshold) {
      // Trigger delete
      setOffset(threshold * 1.5);
      setTimeout(() => {
        onDelete();
      }, 200);
    } else {
      // Reset position
      setOffset(0);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setOffset(Math.min(diff, threshold * 1.5));
    } else {
      setOffset(0);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (offset > threshold) {
      setOffset(threshold * 1.5);
      setTimeout(() => {
        onDelete();
      }, 200);
    } else {
      setOffset(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, offset]);

  const deleteOpacity = Math.min(offset / threshold, 1);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background */}
      <div 
        className="absolute inset-0 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-end px-6"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 className="w-5 h-5 text-white animate-pulse" />
      </div>
      
      {/* Swipeable content */}
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-gray-800 touch-pan-y transition-transform"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableExpenseItem;
