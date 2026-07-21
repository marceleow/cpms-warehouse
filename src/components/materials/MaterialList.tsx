import { cn } from "#/lib/utils";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import Fuse from "fuse.js";
import { ChevronRightIcon, HashIcon, RulerIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "../ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";

export default function MaterialList() {
  const units = useQuery(api.materials.list);
  const [search, setSearch] = useState("");

  const fuse = units ? new Fuse(units, { keys: ["name", "code"], threshold: 0.3 }) : null;
  const filteredMaterials = !units
    ? []
    : !search.trim() || !fuse
      ? units
      : fuse.search(search).map((r) => r.item);

  const trackingModeConfig = {
    calculated: {
      label: "CALCULATED",
      className: "bg-blue-500 text-white hover:bg-blue-500",
    },
    log_only: {
      label: "LOG ONLY",
      className: "bg-yellow-400 text-white hover:bg-amber-500",
    },
    supplier_local: {
      label: "SUPPLIER LOCAL",
      className: "bg-green-700/90 text-white hover:bg-emerald-600",
    },
  } as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 py-0">
        <InputGroup className="bg-muted">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="search-material"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material..."
          />
        </InputGroup>
      </div>

      <ScrollArea className="h-[calc(100dvh-160px)]">
        <div className="flex flex-col gap-4">
          {filteredMaterials &&
            filteredMaterials.map((material) => {
              const trackingMode = trackingModeConfig[material.trackingMode];

              return (
                <Link
                  key={material._id}
                  to="/materials/$id"
                  params={{ id: material._id }}
                  className="border-b py-3 px-6 grid grid-cols-2"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-0.5">
                      <h1 className="text-left font-semibold">{material.name}</h1>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="rounded-sm" variant="secondary">
                        <RulerIcon /> {material.unit}
                      </Badge>
                      {material.code && (
                        <Badge className="rounded-sm" variant="secondary">
                          <HashIcon /> {material.code}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 items-center justify-end">
                    <Badge className={cn("rounded-sm font-semibold", trackingMode.className)}>
                      {trackingMode.label}
                    </Badge>
                    <ChevronRightIcon className="size-4" />
                  </div>
                </Link>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
