"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Avoid logging private context; registration failure is non-fatal.
      });
    }
  }, []);
  return null;
}
