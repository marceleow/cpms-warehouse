import CreateMaterialForm from "#/components/materials/CreateMaterialForm";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export const Route = createFileRoute("/materials/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-dvh">
      <header className="flex justify-between p-6">
        <div className="flex gap-4 items-center">
          <Link to="/materials">
            <ChevronLeftIcon className="size-8" />
          </Link>
          <h1 className="text-xl font-bold">Create new material</h1>
        </div>
      </header>

      <CreateMaterialForm />
    </div>
  );
}
