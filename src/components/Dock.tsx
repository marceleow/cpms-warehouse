import { Link, useRouterState } from "@tanstack/react-router";
import { DatabaseIcon, HistoryIcon, Home, PackageIcon, PlusIcon } from "lucide-react";
import { lazy, Suspense } from "react";
import { Button } from "./ui/button";

const QuickActionDrawer = lazy(() => import("./QuickActionDrawer"));

const items = [
  {
    to: "/",
    label: "Home",
    icon: Home,
  },
  {
    to: "/history",
    label: "History",
    icon: HistoryIcon,
  },
  {
    type: "action",
    icon: PlusIcon,
  },
  {
    to: "/stock",
    label: "Stock",
    icon: PackageIcon,
  },
  {
    to: "/master-data",
    label: "Data",
    icon: DatabaseIcon,
  },
];

export default function Dock() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const visible = items.some((item) => item.to === pathname);

  if (!visible) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t bg-background">
      <div className="grid py-4 grid-cols-5 items-center">
        {items.map((item) => {
          if (item.type === "action") {
            return (
              <div key={item.type} className="flex items-center justify-center">
                <Suspense
                  fallback={
                    <Button className="rounded-full bg-blue-500 hover:bg-blue-500/80 size-12 fixed">
                      <PlusIcon />
                    </Button>
                  }
                >
                  <QuickActionDrawer />
                </Suspense>
              </div>
            );
          }

          const Icon = item.icon;
          const active = pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
