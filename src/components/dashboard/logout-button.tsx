"use client";

import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Clear offline PWA queue/cache (IndexedDB)
      if (typeof window !== "undefined" && window.indexedDB) {
        const dbs = await window.indexedDB.databases();
        dbs.forEach((db) => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }

      // Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Force reload to clear memory and cache
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error", err);
      // Fallback
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
    >
      <LogOut size={16} className="mr-2" /> Keluar
    </button>
  );
}
