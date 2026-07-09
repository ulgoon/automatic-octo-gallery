"use client";

import { Fragment, useEffect, useState } from "react";
import { Folder, NavArrowRight, Home } from "iconoir-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ExplorerEntry {
  name: string;
  relPath: string;
  isDirectory: boolean;
}

interface FileExplorerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: "explorer" | "photos";
  title: string;
  confirmLabel?: string;
  onSelect: (relPath: string) => void;
}

export function FileExplorerDialog({
  open,
  onOpenChange,
  scope,
  title,
  confirmLabel = "이 폴더 선택",
  onSelect,
}: FileExplorerDialogProps) {
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState<ExplorerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPath("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/explorer?scope=${scope}&path=${encodeURIComponent(path)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "폴더를 불러오지 못했습니다");
        if (!cancelled) setEntries(data.entries);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "폴더를 불러오지 못했습니다");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, scope, path]);

  const segments = path ? path.split("/") : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <button
                type="button"
                onClick={() => setPath("")}
                className={cn(
                  "flex items-center gap-1 hover:text-foreground",
                  path === "" && "font-medium text-foreground"
                )}
              >
                <Home width={14} height={14} />
              </button>
            </BreadcrumbItem>
            {segments.map((seg, i) => {
              const segPath = segments.slice(0, i + 1).join("/");
              return (
                <Fragment key={segPath}>
                  <BreadcrumbSeparator>
                    <NavArrowRight width={12} height={12} />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <button
                      type="button"
                      onClick={() => setPath(segPath)}
                      className={cn(
                        "hover:text-foreground",
                        segPath === path && "font-medium text-foreground"
                      )}
                    >
                      {seg}
                    </button>
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex-1 overflow-y-auto rounded-md border">
          {loading ? (
            <div className="flex flex-col gap-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-destructive">{error}</p>
          ) : entries.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">하위 폴더가 없습니다</p>
          ) : (
            <ul className="divide-y">
              {entries.map((entry) => (
                <li key={entry.relPath}>
                  <button
                    type="button"
                    onClick={() => setPath(entry.relPath)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/60"
                  >
                    <Folder width={16} height={16} className="text-muted-foreground" />
                    <span className="truncate">{entry.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onSelect(path)}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
