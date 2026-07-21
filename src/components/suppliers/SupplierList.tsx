import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import Fuse from "fuse.js";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";

export default function SupplierList() {
  const suppliers = useQuery(api.suppliers.list);
  const [search, setSearch] = useState("");

  const fuse = suppliers ? new Fuse(suppliers, { keys: ["name"], threshold: 0.3 }) : null;
  const filteredSuppliers = !suppliers
    ? []
    : !search.trim() || !fuse
      ? suppliers
      : fuse.search(search).map((r) => r.item);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 py-0">
        <InputGroup className="bg-muted">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="search-unit"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search unit..."
          />
        </InputGroup>
      </div>

      <ScrollArea className="h-[calc(100dvh-160px)]">
        <div className="flex flex-col gap-4">
          {filteredSuppliers &&
            filteredSuppliers.map((supplier) => (
              <Link
                key={supplier._id}
                to="/suppliers/$id"
                params={{ id: supplier._id }}
                className="border-b py-3 px-8 flex justify-between"
              >
                <h1 className="text-left font-semibold">{supplier.name}</h1>
                <Button variant="ghost">
                  <ChevronRightIcon />
                </Button>
              </Link>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
