import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { SearchIcon, ClockIcon, XIcon } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const RECENT_MATERIALS_KEY = "cpms:recent-materials";
const MAX_RECENT = 8;

type Material = Doc<"materials">;

function getRecentMaterialIds(): Id<"materials">[] {
  try {
    const raw = localStorage.getItem(RECENT_MATERIALS_KEY);
    return raw ? (JSON.parse(raw) as Id<"materials">[]) : [];
  } catch {
    return [];
  }
}

function saveRecentMaterialIds(ids: Id<"materials">[]) {
  try {
    localStorage.setItem(RECENT_MATERIALS_KEY, JSON.stringify(ids));
  } catch {}
}

interface MaterialPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (material: Material) => void;
  allowedTrackingModes?: Material["trackingMode"][];
}

export function MaterialPicker({
  open,
  onOpenChange,
  onSelect,
  allowedTrackingModes,
}: MaterialPickerProps) {
  const materials = useQuery(api.materials.list);

  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState(getRecentMaterialIds);

  const keyword = search.trim();

  const scopedMaterials = !materials
    ? []
    : !allowedTrackingModes
      ? materials
      : materials.filter((m) => allowedTrackingModes.includes(m.trackingMode));

  const fuse = useMemo(
    () =>
      new Fuse(scopedMaterials, {
        keys: ["name", "code"],
        threshold: 0.3,
      }),
    [scopedMaterials],
  );

  const searchResults = keyword ? fuse.search(keyword).map((r) => r.item) : null;

  const materialMap = new Map(scopedMaterials.map((material) => [material._id, material]));

  const recentMaterials = recentIds.map((id) => materialMap.get(id)).filter(Boolean) as Material[];

  const isShowingRecent = !keyword && recentMaterials.length > 0;

  const listToShow = searchResults ?? (isShowingRecent ? recentMaterials : scopedMaterials);

  function handleSelect(material: Material) {
    const updated = [material._id, ...recentIds.filter((id) => id !== material._id)].slice(
      0,
      MAX_RECENT,
    );

    saveRecentMaterialIds(updated);
    setRecentIds(updated);

    onSelect(material);
    setSearch("");
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-dvh max-h-dvh flex-col rounded-none">
        <DrawerHeader className="flex flex-row items-center justify-between border-b">
          <DrawerTitle>Select Material</DrawerTitle>

          <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
            <XIcon className="size-5" />
          </Button>
        </DrawerHeader>

        <div className="border-b px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              autoFocus
              placeholder="Search material name or code..."
              className="bg-muted pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {materials === undefined && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading materials...
            </div>
          )}

          {isShowingRecent && (
            <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-muted-foreground">
              <ClockIcon className="size-3.5" />
              Recently Used
            </div>
          )}

          {listToShow.map((material) => (
            <button
              key={material._id}
              type="button"
              onClick={() => handleSelect(material)}
              className="flex w-full items-center justify-between border-b p-4 text-left transition-colors active:bg-muted"
            >
              <div>
                <p className="font-medium">{material.name}</p>

                {material.code && <p className="text-sm text-muted-foreground">{material.code}</p>}
              </div>

              <div className="text-right text-sm">
                <p className="text-muted-foreground">{material.unit}</p>

                {material.trackingMode === "calculated" && (
                  <p
                    className={
                      (material.currentStock ?? 0) <= 0
                        ? "font-medium text-red-500"
                        : "text-muted-foreground"
                    }
                  >
                    Stock: {material.currentStock ?? 0}
                  </p>
                )}
              </div>
            </button>
          ))}

          {materials !== undefined && listToShow.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No materials found for "{keyword}"
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
