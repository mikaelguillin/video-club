import { useCallback, useEffect, useState } from "react";
import useDebounce from "../utils/useDebounce";
import { SimpleGrid, Skeleton } from "@chakra-ui/react";

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
    index: number,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => React.ReactNode;
  initialLimit?: number;
  loadingSkeletonCount?: number;
  loadingSkeletonHeight?: string;
}

export default function GridList<T extends { _id: string }>({
  fetchUrl,
  renderItem,
  initialLimit = 10,
  loadingSkeletonCount = 10,
  loadingSkeletonHeight = "350px",
}: GridListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {}
  );

  const fetchItems = useCallback(
    async (pageNumber: number) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${fetchUrl}?page=${pageNumber}&limit=${initialLimit}`
        );
        const { items: itemsData, pagination } =
          (await response.json()) as PaginationResponse<T>;

        if (pageNumber === 1) {
          setItems(itemsData);
        } else {
          setItems((prev) => [...prev, ...itemsData]);
        }
        setHasMore(pagination.page < pagination.totalPages);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUrl, initialLimit, isLoading]
  );

  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const scrollThreshold = 100;

    if (
      hasMore &&
      !isLoading &&
      !isInitialLoad &&
      scrollTop + clientHeight >= scrollHeight - scrollThreshold
    ) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading, isInitialLoad]);

  const debouncedHandleScroll = useDebounce(handleScroll, 200);

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  useEffect(() => {
    // Reset states when fetchUrl changes
    setItems([]);
    setPage(1);
    setIsInitialLoad(true);
    setIsLoading(false);
    setLoadedImages({});

    // Fetch initial data
    fetchItems(1);
  }, []);

  useEffect(() => {
    if (!isInitialLoad && page > 1) {
      fetchItems(page);
    }
  }, [page, isInitialLoad]);

  const handleImageLoad = (itemId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  return (
    <SimpleGrid
      columns={{
        base: 2,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
      }}
      gap="20px"
    >
      {!items.length &&
        Array.from({ length: loadingSkeletonCount }).map((_, index) => (
          <Skeleton key={index} height={loadingSkeletonHeight} />
        ))}
      {items.map((item, index) => {
        const isImageLoaded = loadedImages[item._id];
        return renderItem(item, index, isImageLoaded, handleImageLoad);
      })}
    </SimpleGrid>
  );
}
