import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import HistoryList from "#/components/history/HistoryList";

export const Route = createFileRoute("/history")({
  loader: (opt) => opt.context.queryClient.ensureQueryData(convexQuery(api.history.list)),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-dvh">
      <header className="flex justify-between p-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-bold">Activity History</h1>
        </div>
      </header>

      <HistoryList />
    </div>
  );
}
