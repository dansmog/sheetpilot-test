import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,

    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,

    networkMode: "online",
  },
  mutations: {
    retry: 0,
    networkMode: "online",
  },
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}
