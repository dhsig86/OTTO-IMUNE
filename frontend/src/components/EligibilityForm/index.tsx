"use client";

import { useEffect, useState, useTransition } from "react";
import { type User, onIdTokenChanged } from "firebase/auth";
import { getFirebaseClientServices } from "@/lib/firebase-client";
import { usePatient } from "@/contexts/PatientContext";
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

async function getAuthToken() {
  const services = getFirebaseClientServices();
  const user = services?.auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export default function EligibilityForm() {
  const { patient, setPatientData } = usePatient();
  
  const [scores, setScores] = useState<EligibilityScores>(createEmptyScores());
  const [decision, setDecision] = useState<EligibilityDecision | null>(null);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [session, setSession] = useState<SessionState>({ ready: false, user: null });
  const [isPending, startTransition] = useTransition();

  const [popupConfig, setPopupConfig] = useState<{ isOpen: boolean; src: string; alt: string }>({ isOpen: false, src: "", alt: "" });
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const totalScore = sumEligibilityScore(scores);
  
  const liveBreakdown = decision ? buildEligibilityBreakdown(scores) : null;
  const liveNarrative = liveBreakdown ? getEligibilityNarrative(totalScore, liveBreakdown) : null;

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
            patientId: patient.ottoImunePatientId,
            sourcePatientId: patient.sourcePatientId,
            embedMode: patient.embedMode,
            source: patient.embedMode ? "otto-pwa-webview" : "otto-imune-web",
            patient: {
              name: patient.name,
              birthDate: patient.birthDate,
              age: patient.age,
              cid10: patient.cid10
            },
            scores
          })
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Erro ao registrar a avaliação.");

        if (payload.patientId) {
          setPatientData({ ottoImunePatientId: payload.patientId });
        }
        
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
    <div className="w-full py-4 print:p-0">
      <form className="max-w-[680px] mx-auto my-8 p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] print:shadow-none print:m-0 print:max-w-full print:p-0" onSubmit={handleSubmit}>
        
        {/* Patient Info Header if exists */}
        {(patient.name || patient.age || patient.cid10) && (
           <div className="mb-6 p-4 rounded-lg bg-otto-bg border border-otto-border text-sm flex gap-4 text-otto-text no-print">
             {patient.name && <div><strong>Paciente:</strong> {patient.name}</div>}
             {patient.age && <div><strong>Idade:</strong> {patient.age}</div>}
             {patient.cid10 && <div><strong>CID:</strong> {patient.cid10}</div>}
           </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-otto-primary-dk font-bold text-[1.6rem] m-0 border-none pb-0">Questionário de Elegibilidade</h1>
          <h3 className="text-otto-primary font-medium my-1">para uso de Imunobiológicos</h3>
          <h4 className="text-otto-muted font-normal m-0">na Rinossinusite Crônica com Polipose Nasossinusal</h4>
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

        <footer className="mt-10 text-center text-otto-muted text-[0.9rem] border-t border-otto-border pt-4">
          <p>Guideline for the use of immunobiologicals in chronic rhinosinusitis with nasal polyps (CRSWNP) in Brazil</p>
          <p>Criado pelo Dr. Dario Hart Signorini</p>
        </footer>
      </form>

      <ReferencePopup src={popupConfig.src} alt={popupConfig.alt} isOpen={popupConfig.isOpen} onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} internalPatientId={patient.ottoImunePatientId} user={session.user} submissionId={submission?.recordId ?? null} />
    </div>
  );
}
