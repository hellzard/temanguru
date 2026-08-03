"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (online) return null;
  return <div role="status" className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950"><WifiOff size={16} aria-hidden="true" />Koneksi terputus. Simpan pekerjaan sebagai draf lokal.</div>;
}
