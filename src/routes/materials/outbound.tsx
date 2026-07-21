import OutboundMaterialForm from "#/components/materials/OutboundMaterialForm";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export const Route = createFileRoute("/materials/outbound")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-dvh">
      <header className="flex justify-between p-6">
        <div className="flex gap-4 items-center">
          <Link to="/">
            <ChevronLeftIcon className="size-8" />
          </Link>
          <h1 className="text-xl font-bold">Record outbound material</h1>
        </div>
      </header>

      <OutboundMaterialForm />
    </div>
  );
}
