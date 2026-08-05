"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings } from "lucide-react";
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
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka menu akun"
        className="grid size-11 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition hover:bg-indigo-200"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 py-1 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Akun Saya</p>
          </div>
          <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Settings size={16} className="mr-2" /> Pengaturan
          </button>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
