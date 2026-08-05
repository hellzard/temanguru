"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Palette, User } from "lucide-react";
import { LogoutButton } from "./logout-button";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Buka menu akun"
        aria-expanded={isOpen}
        className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tg-primary)_14%,transparent)] font-semibold text-[var(--tg-primary)]"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="tg-surface absolute right-0 z-50 mt-2 w-60 rounded-xl border py-1 shadow-lg">
          <div className="border-b border-[var(--tg-border)] px-4 py-2">
            <p className="text-sm font-semibold">Akun Saya</p>
          </div>
          <Link
            href="/settings/appearance"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center px-4 py-2 text-sm hover:bg-[var(--tg-surface-muted)]"
          >
            <Palette size={16} className="mr-2" />
            Tampilan & Tema
          </Link>
          <div className="mt-1 border-t border-[var(--tg-border)] pt-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
