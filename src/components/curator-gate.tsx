"use client";

import type { ReactNode } from "react";
import { EditPencil } from "iconoir-react";
import { useAppModeStore } from "@/lib/stores/app-mode";
import { Button } from "@/components/ui/button";

export function CuratorGate({ children }: { children: ReactNode }) {
  const mode = useAppModeStore((s) => s.mode);
  const toggle = useAppModeStore((s) => s.toggle);

  if (mode !== "curator") {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <p>큐레이터 모드에서만 사용할 수 있는 화면입니다</p>
        <Button onClick={toggle}>
          <EditPencil width={16} height={16} className="mr-1.5" />
          큐레이터 모드로 전환
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
