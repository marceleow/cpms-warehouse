import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/units/$id")({
  loader: (opt) =>
    opt.context.queryClient.ensureQueryData(
      convexQuery(api.units.getById, { id: opt.params.id as Id<"units"> }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(convexQuery(api.units.getById, { id: id as Id<"units"> }));

  return (
    <div className="flex flex-col">
      <header className="p-6 flex gap-4 items-center border-b">
        <Link to="/units">
          <ChevronLeftIcon className="size-8" />
        </Link>
        <h1 className="text-xl font-bold">{data?.name}</h1>
      </header>
    </div>
  );
}
