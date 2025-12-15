import { useCallback, useRef } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 0.8,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

      // Load more when user scrolls to threshold of the content
      if (scrollPercentage > threshold && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore, threshold]
  )

  return {
    containerRef,
    handleScroll,
  }
}

