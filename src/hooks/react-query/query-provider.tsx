"use client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useState } from "react";
import { createQueryClient } from "./query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </PersistQueryClientProvider>
  );
}
