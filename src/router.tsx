import { createRouter } from '@tanstack/react-router'
import { NotFound } from "@/components/NotFound"
// Import the generated route tree
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <NotFound />,
  })

  return router
}
