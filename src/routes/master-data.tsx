import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRightIcon, HouseIcon, PackageIcon, UserIcon } from "lucide-react";

export const Route = createFileRoute("/master-data")({
  component: RouteComponent,
});

const items = [
  {
    to: "/units",
    label: "Units",
    icon: HouseIcon,
  },
  {
    to: "/materials",
    label: "Materials",
    icon: PackageIcon,
  },
  {
    to: "/suppliers",
    label: "Suppliers",
    icon: UserIcon,
  },
];

function RouteComponent() {
  return (
    <div className="flex flex-col h-dvh">
      <header className="flex justify-between p-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-bold">Master Data Menu</h1>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-6">
        {items.map((item) => (
          <Link
            to={item.to}
            key={item.to}
            className="border bg-muted p-4 rounded-md flex gap-2 items-center justify-between"
          >
            <div className="flex gap-4 items-center">
              <item.icon className="size-5" />
              <h1 className="text-lg font-semibold">{item.label}</h1>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRightIcon />
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
