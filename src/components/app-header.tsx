"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MediaImage,
  Folder,
  Trash,
  Settings as SettingsIcon,
  SunLight,
  HalfMoon,
  EyeSolid,
  EditPencil,
} from "iconoir-react";
import { useAppModeStore } from "@/lib/stores/app-mode";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "전체 사진", icon: MediaImage },
  { href: "/tags", label: "사진전", icon: Folder },
  { href: "/trash", label: "휴지통", icon: Trash },
];

export function AppHeader() {
  const pathname = usePathname();
  const mode = useAppModeStore((s) => s.mode);
  const toggleMode = useAppModeStore((s) => s.toggle);
  const { setTheme } = useTheme();

  const navItems = mode === "curator" ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.href !== "/trash");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-6">
        <Link href="/" className="mr-2 shrink-0 font-semibold tracking-tight">
          사진전
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon width={16} height={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {mode === "curator" && (
            <Link href="/settings">
              <Button variant="ghost" size="icon" aria-label="설정">
                <SettingsIcon width={18} height={18} />
              </Button>
            </Link>
          )}

          <Button
            variant={mode === "curator" ? "default" : "outline"}
            size="sm"
            onClick={toggleMode}
            className="gap-1.5"
          >
            {mode === "curator" ? (
              <EditPencil width={16} height={16} />
            ) : (
              <EyeSolid width={16} height={16} />
            )}
            <span className="hidden sm:inline">
              {mode === "curator" ? "큐레이터 모드" : "관람 모드"}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="테마 전환">
                  <SunLight className="dark:hidden" width={18} height={18} />
                  <HalfMoon className="hidden dark:inline" width={18} height={18} />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>라이트</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>다크</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>시스템</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2 sm:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              <Icon width={16} height={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
