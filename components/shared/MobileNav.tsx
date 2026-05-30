"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Target, Bot, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Início" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/ai", icon: Bot, label: "IA" },
  { href: "/reports", icon: BarChart3, label: "Relatórios" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-0",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] leading-none truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
