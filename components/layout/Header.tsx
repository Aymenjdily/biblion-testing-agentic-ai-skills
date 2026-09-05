"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavAuth } from "@/components/auth/NavAuth";
import { BiblionMark } from "@/components/icons";
import { clsx } from "@/lib/clsx";

const NAV_LINKS = [
  { href: "/catalog", label: "Catalog" },
] as const;

/** Shared site nav. `transparent` sits it on the hero gradient (no bottom border); otherwise it sits on plain background with a border. */
export function Header({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();

  return (
    <header
      className={clsx(
        "mx-auto flex h-18 max-w-6xl items-center justify-between px-6 sm:px-10",
        !transparent && "border-b border-border"
      )}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <BiblionMark className="h-8 w-8" />
        <span className="font-logo text-[22px] font-bold text-ink-900">Biblion</span>
      </Link>

      <nav className="hidden items-center gap-10 text-sm text-neutral-600 md:flex">
        <a href="#" className="transition-colors hover:text-ink-900">
          Product
        </a>
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "transition-colors hover:text-ink-900",
                active ? "font-semibold text-ink-900" : "text-neutral-600"
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <a href="#" className="transition-colors hover:text-ink-900">
          Instructors
        </a>
        <a href="#" className="transition-colors hover:text-ink-900">
          Pricing
        </a>
      </nav>

      <NavAuth />
    </header>
  );
}
