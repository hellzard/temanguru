"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Building2, Palette, Settings, User } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function UserMenu({ multipleSchools }: { multipleSchools: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Buka menu akun"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tg-primary)_14%,transparent)] font-semibold text-[var(--tg-primary)]"
      >
        <User size={20} />
      </button>

      {isOpen ? (
        <div role="menu" className="tg-surface absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border py-1 shadow-xl">
          <div className="border-b border-[var(--tg-border)] px-4 py-3">
            <p className="text-sm font-semibold">Akun dan perangkat</p>
          </div>
          {multipleSchools ? (
            <Link role="menuitem" href="/school/select?change=1" onClick={() => setIsOpen(false)} className="flex min-h-10 items-center px-4 text-sm hover:bg-[var(--tg-surface-muted)]">
              <Building2 size={16} className="mr-2" />Ganti sekolah
            </Link>
          ) : null}
          <Link role="menuitem" href="/settings/appearance" onClick={() => setIsOpen(false)} className="flex min-h-10 items-center px-4 text-sm hover:bg-[var(--tg-surface-muted)]">
            <Palette size={16} className="mr-2" />Tampilan & Tema
          </Link>
          <Link role="menuitem" href="/settings" onClick={() => setIsOpen(false)} className="flex min-h-10 items-center px-4 text-sm hover:bg-[var(--tg-surface-muted)]">
            <Settings size={16} className="mr-2" />Pengaturan
          </Link>
          <div className="mt-1 border-t border-[var(--tg-border)] pt-1"><LogoutButton /></div>
        </div>
      ) : null}
    </div>
  );
}
