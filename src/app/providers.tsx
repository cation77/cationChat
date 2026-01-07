'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App } from 'antd';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const antdConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ConfigProvider theme={antdConfig}>
          <App>{children}</App>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
