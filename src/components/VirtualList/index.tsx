import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

type VirtualListProps<T> = {
  items: T[];
  height: number;
  rowHeight: number;
  overscan?: number;
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
};

export default function VirtualList<T extends { id?: string }>({ items, height, rowHeight, overscan = 3, children, className }: VirtualListProps<T>) {
  const totalHeight = items.length * rowHeight;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    const st = containerRef.current.scrollTop;
    // throttle with rAF
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        setScrollTop(st);
        rafRef.current = null;
      });
    }
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  // Math.ceil((scrollTop + height) / rowHeight) - 1, - 1 fix for Math.ceil get broken index
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + height) / rowHeight) - 1 + overscan);

  const visible = items.slice(startIndex, Math.max(startIndex, endIndex + 1));

  return (
    <Box
      ref={containerRef}
      onScroll={onScroll}
      height={`${height}px`}
      overflowY="auto"
      width="100%"
      className={className}
      role="list"
      aria-label="virtual-list"
      css={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <Box height={`${totalHeight}px`} position="relative" width="100%">
        {visible.map((item, i) => {
          const index = startIndex + i;
          const top = index * rowHeight;
          return (
            <Box
              as="div"
              key={item.id ?? index}
              position="absolute"
              top={`${top}px`}
              left={0}
              right={0}
              height={`${rowHeight}px`}
              boxSizing="border-box"
              fontSize="sm"
              role="listitem"
              aria-posinset={index + 1}
            >
              {children(item, index)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}