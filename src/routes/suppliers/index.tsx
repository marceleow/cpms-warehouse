import CreateSupplierDrawer from "#/components/suppliers/CreateSupplierDrawer";
import SupplierList from "#/components/suppliers/SupplierList";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";

export const Route = createFileRoute("/suppliers/")({
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
          <h1 className="text-xl font-bold">Master Data Supplier</h1>
        </div>
        <CreateSupplierDrawer />
      </header>

      <SupplierList />
    </div>
  );
}
