import MaterialList from "#/components/materials/MaterialList";
import { buttonVariants } from "#/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, PlusIcon } from "lucide-react";

export const Route = createFileRoute("/materials/")({
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
          <h1 className="text-xl font-bold">Master Data Material</h1>
        </div>
        <Link to="/materials/new" className={buttonVariants({ size: "icon" })}>
          <PlusIcon />
        </Link>
      </header>

      <MaterialList />
    </div>
  );
}
