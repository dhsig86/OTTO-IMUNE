"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { PatientProvider, usePatient } from "@/contexts/PatientContext";

function ResizeObserverLayout({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const { postToParent } = usePatient();

  useEffect(() => {
    if (!shellRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      postToParent("otto-imune:height", { height: Math.ceil(entries[0].contentRect.height) });
    });
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, [postToParent]);

  return (
    <div ref={shellRef} className="w-full min-h-screen">
      {children}
    </div>
  );
}

export default function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PatientProvider>
      <ResizeObserverLayout>
        {children}
      </ResizeObserverLayout>
    </PatientProvider>
  );
}
