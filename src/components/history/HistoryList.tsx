// components/history/HistoryList.tsx
import { useQuery } from "convex/react";
import { useState } from "react";
import { ArrowDownLeftIcon, ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { api } from "../../../convex/_generated/api";

type HistoryFilter = "all" | "in" | "out";

export default function HistoryList() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const entries = useQuery(api.history.list, { type: filter });

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 px-4 py-3 border-b overflow-x-auto">
        {(["all", "in", "out"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border"
            }`}
          >
            {f === "all" ? "All" : f === "in" ? "Material In" : "Material Out"}
          </button>
        ))}
      </div>

      {entries === undefined && (
        <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
      )}

      {entries?.length === 0 && (
        <div className="p-10 text-center text-muted-foreground text-sm">No transactions yet</div>
      )}

      <div className="flex flex-col">
        {entries?.map((entry) => (
          <Link
            key={entry._id}
            to={entry.type === "in" ? "/history/delivery/$id" : "/history/usage/$id"}
            params={{ id: entry._id }}
            className="flex items-center gap-3 p-4 border-b active:bg-muted transition-colors"
          >
            <div
              className={`flex items-center justify-center size-10 rounded-full shrink-0 ${
                entry.type === "in" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              }`}
            >
              {entry.type === "in" ? (
                <ArrowDownLeftIcon className="size-5" />
              ) : (
                <ArrowUpRightIcon className="size-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{entry.primaryLabel}</div>
              <div className="text-sm text-muted-foreground truncate">{entry.secondaryLabel}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {new Date(entry._creationTime).toLocaleString()}
                </span>
                {entry.meta && <span className="text-xs text-muted-foreground">{entry.meta}</span>}
                {entry.status === "pending_document" && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Pending Document
                  </span>
                )}
              </div>
            </div>

            <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
