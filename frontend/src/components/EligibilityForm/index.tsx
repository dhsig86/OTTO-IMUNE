"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { type User, onIdTokenChanged } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { getFirebaseClientServices } from "@/lib/firebase-client";
import {
  eligibilitySections,
  getEligibilityDecision,
  getEligibilityNarrative,
  buildEligibilityBreakdown,
  sumEligibilityScore,
  createEmptyScores,
  type EligibilityDecision,
  type EligibilityScores,
  type ScoreKey
} from "@/lib/eligibility";

import ReferencePopup from "./ReferencePopup";
import HelpModal from "../ui/HelpModal";
import FormSection from "./FormSection";
import ScoreField from "./ScoreField";
import ScoreTotal from "./ScoreTotal";
import ResultBadge from "./ResultBadge";
import ActionBar from "./ActionBar";
import ClinicalNarrative from "./ClinicalNarrative";
import HistoryDrawer from "./HistoryDrawer";

type SubmissionState = {
  persisted: boolean;
  message: string;
  recordId: string | null;
};

type SessionState = {
  ready: boolean;
  user: User | null;
};

type PatientState = {
  name: string;
  birthDate: string;
  age: string;
  cid10: string;
};

type BridgePayload = {
  sourcePatientId?: string | null;
  ottoImunePatientId?: string | null;
  patientName?: string | null;
  birthDate?: string | null;
  age?: string | number | null;
  cid10?: string | null;
  embed?: boolean;
};

const emptyPatient: PatientState = {
  name: "",
  birthDate: "",
  age: "",
  cid10: ""
};

async function getAuthToken() {
  const services = getFirebaseClientServices();
  const user = services?.auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export default function EligibilityForm() {
  const searchParams = useSearchParams();
  const shellRef = useRef<HTMLFormElement | null>(null);
  
  const [scores, setScores] = useState<EligibilityScores>(createEmptyScores());
  const [patient, setPatient] = useState<PatientState>(emptyPatient);
  const [decision, setDecision] = useState<EligibilityDecision | null>(null);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [session, setSession] = useState<SessionState>({ ready: false, user: null });
  const [internalPatientId, setInternalPatientId] = useState<string | null>(null);
  const [bridgeContext, setBridgeContext] = useState<BridgePayload | null>(null);
  const [isPending, startTransition] = useTransition();

  const [popupConfig, setPopupConfig] = useState<{ isOpen: boolean; src: string; alt: string }>({ isOpen: false, src: "", alt: "" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const totalScore = sumEligibilityScore(scores);
  
  // Narrativa clínica: calculada apenas quando há uma decisão ativa
  const liveBreakdown = decision ? buildEligibilityBreakdown(scores) : null;
  const liveNarrative = liveBreakdown ? getEligibilityNarrative(totalScore, liveBreakdown) : null;

  const embedMode = bridgeContext?.embed === true || searchParams.get("embed") === "1";
  const sourcePatientId = bridgeContext?.sourcePatientId ?? searchParams.get("patientId") ?? searchParams.get("sourcePatientId");
  const ottoImunePatientId = bridgeContext?.ottoImunePatientId ?? searchParams.get("ottoImunePatientId");
  
  const allowedParentOrigin = process.env.NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN?.trim() || "*";

  const postToParent = useEffectEvent((type: string, payload: Record<string, unknown>) => {
    if (typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage({ type, payload }, allowedParentOrigin === "*" ? "*" : allowedParentOrigin);
  });

  const applyBridgeContext = useEffectEvent((payload: BridgePayload) => {
    setBridgeContext((current) => ({ ...current, ...payload }));
    setPatient((current) => ({
      name: current.name || payload.patientName || "",
      birthDate: current.birthDate || payload.birthDate || "",
      age: current.age || (payload.age === null || payload.age === undefined ? "" : String(payload.age)),
      cid10: current.cid10 || payload.cid10 || ""
    }));
    if (payload.ottoImunePatientId) {
      setInternalPatientId((current) => current || payload.ottoImunePatientId || null);
    }
  });

  useEffect(() => {
    setPatient((current) => ({
      name: current.name || bridgeContext?.patientName || searchParams.get("patientName") || "",
      birthDate: current.birthDate || bridgeContext?.birthDate || searchParams.get("birthDate") || "",
      age: current.age || (bridgeContext?.age === null || bridgeContext?.age === undefined ? searchParams.get("age") || "" : String(bridgeContext.age)),
      cid10: current.cid10 || bridgeContext?.cid10 || searchParams.get("cid10") || ""
    }));
    setInternalPatientId((current) => current || ottoImunePatientId || null);
  }, [bridgeContext, ottoImunePatientId, searchParams]);

  useEffect(() => {
    postToParent("otto-imune:ready", {
      version: "2026-04-19",
      embedMode,
      capabilities: ["eligibility", "history", "reportDraft", "prescriptionDraft"]
    });
  }, [embedMode, postToParent]);

  useEffect(() => {
    function handleWindowMessage(event: MessageEvent) {
      if (allowedParentOrigin !== "*" && event.origin !== allowedParentOrigin && event.origin !== "null") return;
      if (!event.data || typeof event.data !== "object") return;
      const message = event.data as { type?: string; payload?: BridgePayload };
      if (message.type === "otto:set-context" && message.payload) applyBridgeContext(message.payload);
    }
    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [allowedParentOrigin, applyBridgeContext]);

  useEffect(() => {
    if (!shellRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      postToParent("otto-imune:height", { height: Math.ceil(entries[0].contentRect.height) });
    });
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, [postToParent]);

  useEffect(() => {
    const services = getFirebaseClientServices();
    if (!services) {
      setSession({ ready: true, user: null });
      return undefined;
    }
    return onIdTokenChanged(services.auth, (user) => setSession({ ready: true, user }));
  }, []);

  function updateScore(key: ScoreKey, value: number) {
    setScores((current) => ({ ...current, [key]: value }));
  }

  function calculateDecision() {
    const nextDecision = getEligibilityDecision(totalScore);
    setDecision(nextDecision);
    setSubmission(null);
    setErrorMessage(null);
    return nextDecision;
  }

  function handleReset() {
    setScores(createEmptyScores());
    setDecision(null);
    setSubmission(null);
    setErrorMessage(null);
  }

  function handlePrint() {
    window.print();
  }

  function openPopup(src: string, alt: string) {
    setPopupConfig({ isOpen: true, src, alt });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDecision = calculateDecision();

    startTransition(async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch("/api/calculators/eligibility", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            patientId: internalPatientId,
            sourcePatientId,
            embedMode,
            source: embedMode ? "otto-pwa-webview" : "otto-imune-web",
            patient,
            scores
          })
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Erro ao registrar a avaliação.");

        if (payload.patientId) setInternalPatientId(payload.patientId);
        
        setDecision(nextDecision);
        setSubmission({
          persisted: Boolean(payload.persisted),
          message: payload.message || "Avaliação concluída.",
          recordId: payload.id ?? null
        });
        setErrorMessage(null);
      } catch (error) {
        setSubmission(null);
        setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir a avaliação.");
      }
    });
  }

  return (
    <div style={{ padding: "16px 0", width: "100%" }}>
      <form ref={shellRef} className="otto-container" onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="otto-title" style={{ borderBottom: "none", margin: 0 }}>Questionário de Elegibilidade</h1>
          <h3 style={{ margin: "4px 0", color: "var(--otto-primary)", fontWeight: "500" }}>para uso de Imunobiológicos</h3>
          <h4 style={{ margin: 0, color: "var(--otto-muted)", fontWeight: "normal" }}>na Rinossinusite Crônica com Polipose Nasossinusal</h4>
        </div>

        {eligibilitySections.map((section) => (
          <FormSection key={section.id} title={section.title}>
            {section.fields.map((field) => {
              const popupSrc = field.key === "vas" ? "/images/eva.png" : 
                               field.key === "polypSize" ? "/images/polyp.png" : 
                               field.key === "sinusOpacification" ? "/images/lundmckay.jpeg" : null;

              return (
                <ScoreField 
                  key={field.key}
                  fieldKey={field.key}
                  label={field.label}
                  options={field.options}
                  currentValue={scores[field.key]}
                  onChange={updateScore}
                  isSnot={field.key === "snot22"}
                  onInfoClick={popupSrc ? () => openPopup(popupSrc, field.label) : undefined}
                />
              );
            })}
          </FormSection>
        ))}

        <ScoreTotal totalScore={totalScore} />

        <ActionBar 
          onCalculate={calculateDecision}
          isPending={isPending}
          onPrint={handlePrint}
          onReset={handleReset}
          onHelp={() => setHelpOpen(true)}
          onHistory={() => setHistoryOpen(true)}
        />

        <ResultBadge
          decision={decision}
          totalScore={totalScore}
          submission={submission}
          errorMessage={errorMessage}
        />

        {decision && liveNarrative && (
          <ClinicalNarrative narrative={liveNarrative} />
        )}

        <footer style={{ marginTop: "40px", textAlign: "center", color: "var(--otto-muted)", fontSize: "0.9rem" }}>
          <p>Guideline for the use of immunobiologicals in chronic rhinosinusitis with nasal polyps (CRSWNP) in Brazil</p>
          <p>Criado pelo Dr. Dario Hart Signorini</p>
        </footer>
      </form>

      <ReferencePopup src={popupConfig.src} alt={popupConfig.alt} isOpen={popupConfig.isOpen} onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} internalPatientId={internalPatientId} user={session.user} submissionId={submission?.recordId ?? null} />
    </div>
  );
}
