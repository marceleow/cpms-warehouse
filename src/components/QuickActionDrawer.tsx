import { PackageMinusIcon, PackagePlusIcon, PlusIcon, TruckIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Link } from "@tanstack/react-router";

const items = [
  {
    to: "/materials/inbound",
    label: "Material In",
    description: "From head office, container delivery",
    icon: PackagePlusIcon,
  },
  {
    to: "/materials/inbound",
    label: "Material In (Local Supplier)",
    description: "Natural materials from local supplier",
    icon: TruckIcon,
  },
  {
    to: "/materials/outbound",
    label: "Material Out",
    description: "Record material usage per house unit",
    icon: PackageMinusIcon,
  },
] as const;

export default function QuickActionDrawer() {
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button className="rounded-full bg-blue-500 hover:bg-blue-500/80 size-12 fixed">
            <PlusIcon />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold">Quick Actions</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 p-6 pt-2">
          {items.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-4 rounded-lg border p-4 bg-muted hover:bg-muted/80 transition-colors"
              >
                <Icon className="size-5" />
                <div className="flex flex-col">
                  <span className="font-semibold">{action.label}</span>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
