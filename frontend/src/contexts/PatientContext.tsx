"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PatientState = {
  name: string;
  birthDate: string;
  age: string;
  cid10: string;
  sourcePatientId: string | null;
  ottoImunePatientId: string | null;
  embedMode: boolean;
  lundMackayScore: number | null;
  snot22Score: number | null;
};

type PatientContextType = {
  patient: PatientState;
  setPatientData: (data: Partial<PatientState>) => void;
  postToParent: (type: string, payload: Record<string, unknown>) => void;
};

const defaultPatient: PatientState = {
  name: "",
  birthDate: "",
  age: "",
  cid10: "",
  sourcePatientId: null,
  ottoImunePatientId: null,
  embedMode: false,
  lundMackayScore: null,
  snot22Score: null
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientState>(defaultPatient);
  
  const allowedParentOrigin = process.env.NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN?.trim() || "*";

  const postToParent = (type: string, payload: Record<string, unknown>) => {
    if (typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage({ type, payload }, allowedParentOrigin === "*" ? "*" : allowedParentOrigin);
  };

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (allowedParentOrigin !== "*" && event.origin !== allowedParentOrigin && event.origin !== "null") return;
      if (!event.data || typeof event.data !== "object") return;
      
      const message = event.data;
      if (message.type === "otto:set-context" && message.payload) {
        setPatient(current => ({
          ...current,
          name: message.payload.patientName || current.name,
          birthDate: message.payload.birthDate || current.birthDate,
          age: (message.payload.age === null || message.payload.age === undefined) ? current.age : String(message.payload.age),
          cid10: message.payload.cid10 || current.cid10,
          sourcePatientId: message.payload.sourcePatientId || current.sourcePatientId,
          ottoImunePatientId: message.payload.ottoImunePatientId || current.ottoImunePatientId,
          embedMode: message.payload.embed === true || current.embedMode
        }));
      }
    }

    // Report ready to parent on mount so it triggers context injection
    postToParent("otto-imune:ready", {
      version: "2026-04-19",
      embedMode: patient.embedMode,
      capabilities: ["hub", "eligibility", "history", "reportDraft"]
    });

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const setPatientData = (data: Partial<PatientState>) => {
    setPatient(current => ({ ...current, ...data }));
  };

  return (
    <PatientContext.Provider value={{ patient, setPatientData, postToParent }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
