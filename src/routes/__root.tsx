import { Toaster } from "#/components/ui/sonner";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "../global.css";
import Dock from "#/components/Dock";
import NotFound from "#/components/NotFound";

interface RootRoute {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RootRoute>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <>
      <Toaster position="top-center" />
      <Outlet />
      <Dock />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
