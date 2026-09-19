import { QueryClient } from '@tanstack/react-query'

export function getRouterContext() {
  return {
    queryClient: new QueryClient(),
  }
}

export type RouterContext = ReturnType<typeof getRouterContext>
