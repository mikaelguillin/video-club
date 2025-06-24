"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SimpleGrid, Skeleton } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

interface PaginationResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GridListProps<T> {
  fetchUrl: string;
  renderItem: (
    item: T,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => React.ReactNode;
  initialLimit?: number;
  loadingSkeletonHeight?: string;
  initialItems: T[];
  initialPage: number;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function GridList<T extends { _id: string }>({
  fetchUrl,
  renderItem,
  initialLimit = 10,
  loadingSkeletonHeight = "350px",
  initialItems,
  initialPage,
  initialPagination,
}: GridListProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialPagination.page < initialPagination.totalPages
  );
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  const observerRef = useRef<HTMLDivElement | null>(null);
  const observerInstance = useRef<IntersectionObserver | null>(null);

  // const router = useRouter();
  // const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchItems = useCallback(
    async (pageNumber: number) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${fetchUrl}?page=${pageNumber}&limit=${initialLimit}`
        );
        const { items: itemsData, pagination } = (await response.json()) as PaginationResponse<T>;

        if (pageNumber === 1) {
          setItems(itemsData);
        } else {
          setItems((prev) => [...prev, ...itemsData]);
        }
        setHasMore(pagination.page < pagination.totalPages);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUrl, initialLimit, isLoading]
  );

  useEffect(() => {
    if (page > initialPage) {
      fetchItems(page);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      // router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    }, [page]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    if (observerInstance.current) observerInstance.current.disconnect();
    observerInstance.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });
    if (observerRef.current) {
      observerInstance.current.observe(observerRef.current);
    }
    return () => {
      if (observerInstance.current) observerInstance.current.disconnect();
    };
  }, [hasMore, isLoading]);

  const handleImageLoad = (itemId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const gridColumns = {
    base: 2,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };

  return (
    <>
      <SimpleGrid
        columns={gridColumns}
        gap="20px"
      >
        {items.map((item) => {
          const isImageLoaded = loadedImages[item._id];
          return renderItem(item, isImageLoaded, handleImageLoad);
        })}
      </SimpleGrid>
      <div ref={observerRef} style={{ height: 1 }} />
      {isLoading && hasMore && (
        <SimpleGrid
          columns={gridColumns}
          gap="20px"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={loadingSkeletonHeight} />
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
