"use client";

import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// Node setTimeout is a signed 32-bit int (max ~24.8 days). 30 days in ms
// overflows, so the timer is clamped to 1ms and queries get GC'd immediately.
const MAX_TIMEOUT_MS = 2_147_483_647;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: MAX_TIMEOUT_MS,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: MAX_TIMEOUT_MS,

  // ✅ v5 way
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      return query.meta?.persist === true;
    },
  },
});
