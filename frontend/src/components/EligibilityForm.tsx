"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { type User, onIdTokenChanged } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { getFirebaseClientServices } from "@/lib/firebase-client";
import {
  buildEligibilityBreakdown,
  createEmptyScores,
  eligibilitySections,
  getEligibilityDecision,
  getEligibilityNarrative,
  sumEligibilityScore,
  type EligibilityDecision,
  type EligibilityScores,
  type EligibilitySectionBreakdown,
  type ScoreKey
} from "@/lib/eligibility";

type ReferenceCard = {
  id: string;
  title: string;
  body: string;
};

type SubmissionState = {
  persisted: boolean;
  message: string;
  recordId: string | null;
};

type HistoryItem = {
  id: string;
  createdAt?: string;
  totalScore?: number;
  result?: {
    label?: string;
    eligible?: boolean;
  };
};

type DraftDocument = {
  id: string;
  kind: "report" | "prescription";
  draft: {
    title: string;
    summary: string;
    sections: Array<{
      title: string;
      body: string;
    }>;
  };
  createdAt?: string;
};

type CalculationDetail = {
  id: string;
  patientId?: string;
  totalScore: number;
  result: EligibilityDecision;
  breakdown: EligibilitySectionBreakdown[];
  narrative: string;
  createdAt?: string;
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

  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export default function EligibilityForm() {
  const searchParams = useSearchParams();
  const shellRef = useRef<HTMLElement | null>(null);
  const [scores, setScores] = useState<EligibilityScores>(createEmptyScores);
  const [patient, setPatient] = useState<PatientState>(emptyPatient);
  const [decision, setDecision] = useState<EligibilityDecision | null>(null);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [references, setReferences] = useState<ReferenceCard[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDetail | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<DraftDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ ready: false, user: null });
  const [internalPatientId, setInternalPatientId] = useState<string | null>(null);
  const [bridgeContext, setBridgeContext] = useState<BridgePayload | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDraftPending, startDraftTransition] = useTransition();

  const totalScore = sumEligibilityScore(scores);
  const liveBreakdown = buildEligibilityBreakdown(scores);
  const liveNarrative = getEligibilityNarrative(totalScore, liveBreakdown);
  const embedMode = bridgeContext?.embed === true || searchParams.get("embed") === "1";
  const sourcePatientId =
    bridgeContext?.sourcePatientId ??
    searchParams.get("patientId") ??
    searchParams.get("sourcePatientId");
  const ottoImunePatientId =
    bridgeContext?.ottoImunePatientId ?? searchParams.get("ottoImunePatientId");
  const allowedParentOrigin =
    process.env.NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN?.trim() || "*";

  const postToParent = useEffectEvent((type: string, payload: Record<string, unknown>) => {
    if (typeof window === "undefined" || window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        type,
        payload
      },
      allowedParentOrigin === "*" ? "*" : allowedParentOrigin
    );
  });

  const applyBridgeContext = useEffectEvent((payload: BridgePayload) => {
    setBridgeContext((current) => ({
      ...current,
      ...payload
    }));

    setPatient((current) => ({
      name: current.name || payload.patientName || "",
      birthDate: current.birthDate || payload.birthDate || "",
      age:
        current.age ||
        (payload.age === null || payload.age === undefined ? "" : String(payload.age)),
      cid10: current.cid10 || payload.cid10 || ""
    }));

    if (payload.ottoImunePatientId) {
      setInternalPatientId((current) => current || payload.ottoImunePatientId || null);
    }
  });

  useEffect(() => {
    setPatient((current) => ({
      name: current.name || bridgeContext?.patientName || searchParams.get("patientName") || "",
      birthDate:
        current.birthDate || bridgeContext?.birthDate || searchParams.get("birthDate") || "",
      age:
        current.age ||
        (bridgeContext?.age === null || bridgeContext?.age === undefined
          ? searchParams.get("age") || ""
          : String(bridgeContext.age)),
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
      if (
        allowedParentOrigin !== "*" &&
        event.origin !== allowedParentOrigin &&
        event.origin !== "null"
      ) {
        return;
      }

      if (!event.data || typeof event.data !== "object") {
        return;
      }

      const message = event.data as {
        type?: string;
        payload?: BridgePayload;
      };

      if (message.type === "otto:set-context" && message.payload) {
        applyBridgeContext(message.payload);
      }
    }

    window.addEventListener("message", handleWindowMessage);

    return () => window.removeEventListener("message", handleWindowMessage);
  }, [allowedParentOrigin, applyBridgeContext]);

  useEffect(() => {
    if (!shellRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      postToParent("otto-imune:height", {
        height: Math.ceil(entry.contentRect.height)
      });
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

    return onIdTokenChanged(services.auth, (user) => {
      setSession({ ready: true, user });
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/references/immunobiologics", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Falha ao carregar o painel clínico.");
        }

        return (await response.json()) as { items: ReferenceCard[] };
      })
      .then((payload) => {
        setReferences(payload.items);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!internalPatientId) {
      setHistoryItems([]);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const token = await session.user?.getIdToken();

        const response = await fetch(`/api/patients/${internalPatientId}/calculations`, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        });

        const payload = (await response.json()) as {
          items?: HistoryItem[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar o histórico.");
        }

        setHistoryItems(payload.items ?? []);
        setHistoryMessage(null);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Não foi possível carregar o histórico.";
        setHistoryMessage(message);
      }
    })();

    return () => controller.abort();
  }, [internalPatientId, session.user, submission?.recordId]);

  function updateScore(key: ScoreKey, value: number) {
    setScores((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updatePatient<K extends keyof PatientState>(key: K, value: PatientState[K]) {
    setPatient((current) => ({
      ...current,
      [key]: value
    }));
  }

  function calculateDecision() {
    const nextDecision = getEligibilityDecision(totalScore);
    setDecision(nextDecision);
    setSubmission(null);
    setErrorMessage(null);
    return nextDecision;
  }

  async function loadCalculation(calculationId: string) {
    const token = await getAuthToken();
    const response = await fetch(`/api/calculations/${calculationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const payload = (await response.json()) as CalculationDetail & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error || "Falha ao carregar a avaliação.");
    }

    setSelectedCalculation(payload);
    setGeneratedDraft(null);
    setDraftMessage(null);
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

        const payload = (await response.json()) as {
          id?: string | null;
          patientId?: string | null;
          persisted?: boolean;
          message?: string;
          error?: string;
          totalScore?: number;
          result?: EligibilityDecision;
          breakdown?: EligibilitySectionBreakdown[];
          narrative?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Erro ao registrar a avaliação.");
        }

        if (payload.patientId) {
          setInternalPatientId(payload.patientId);
        }

        if (payload.id && payload.result && payload.breakdown && payload.narrative) {
          setSelectedCalculation({
            id: payload.id,
            patientId: payload.patientId ?? undefined,
            totalScore: payload.totalScore ?? totalScore,
            result: payload.result,
            breakdown: payload.breakdown,
            narrative: payload.narrative,
            createdAt: new Date().toISOString()
          });
        }

        setDecision(nextDecision);
        setSubmission({
          persisted: Boolean(payload.persisted),
          message: payload.message || "Avaliação concluída.",
          recordId: payload.id ?? null
        });
        setGeneratedDraft(null);
        setDraftMessage(null);
        setErrorMessage(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Não foi possível concluir a avaliação.";
        setSubmission(null);
        setErrorMessage(message);
      }
    });
  }

  function handleDraftGeneration(kind: "report" | "prescription") {
    if (!selectedCalculation?.id || !internalPatientId) {
      setDraftMessage("Salve ou selecione uma avaliação antes de gerar o rascunho.");
      return;
    }

    startDraftTransition(async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch(
          kind === "report" ? "/api/reports/draft" : "/api/prescriptions/draft",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              patientId: internalPatientId,
              calculationId: selectedCalculation.id
            })
          }
        );

        const payload = (await response.json()) as {
          draft?: DraftDocument;
          error?: string;
        };

        if (!response.ok || !payload.draft) {
          throw new Error(payload.error || "Falha ao gerar o rascunho.");
        }

        setGeneratedDraft(payload.draft);
        setDraftMessage(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Não foi possível gerar o rascunho.";
        setDraftMessage(message);
      }
    });
  }

  return (
    <main ref={shellRef} className={`page-shell${embedMode ? " page-shell--embed" : ""}`}>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Portal clínico de imunobiológicos</span>
          <h1>OTTO-IMUNE</h1>
          <p className="lead">
            Remodelagem do ecossistema OTTO com foco em elegibilidade, registro clínico e
            preparação para relatórios, receitas e novas calculadoras.
          </p>
          <div className="hero-badges">
            <span>Vercel-first</span>
            <span>Firebase ready</span>
            <span>Webview friendly</span>
          </div>
        </div>
        <aside className="hero-aside">
          <p className="aside-label">Fluxo principal</p>
          <strong>Elegibilidade para imunobiológicos</strong>
          <p>
            A base nova preserva a calculadora atual e já abre espaço para histórico, relatórios e
            integração com a OTTO PWA.
          </p>
        </aside>
      </section>

      <section className="content-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <span className="section-label">Dados mínimos</span>
              <h2>Identificação clínica inicial</h2>
            </div>
            <div className="score-chip">
              <span>Pontuação total</span>
              <strong>{totalScore}</strong>
            </div>
          </div>

          <div className="patient-grid">
            <label>
              Nome do paciente
              <input
                name="patientName"
                value={patient.name}
                onChange={(event) => updatePatient("name", event.target.value)}
                placeholder="Nome completo"
              />
            </label>
            <label>
              Data de nascimento
              <input
                name="birthDate"
                type="date"
                value={patient.birthDate}
                onChange={(event) => updatePatient("birthDate", event.target.value)}
              />
            </label>
            <label>
              Idade
              <input
                name="age"
                inputMode="numeric"
                value={patient.age}
                onChange={(event) => updatePatient("age", event.target.value)}
                placeholder="Opcional se já informou a data"
              />
            </label>
            <label className="patient-grid__wide">
              CID-10
              <textarea
                name="cid10"
                value={patient.cid10}
                onChange={(event) => updatePatient("cid10", event.target.value)}
                placeholder="Ex.: J45, J32.4"
                rows={3}
              />
            </label>
          </div>

          <div className="section-stack">
            {eligibilitySections.map((section) => (
              <section key={section.id} className="criteria-panel">
                <div className="criteria-heading">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
                <div className="criteria-fields">
                  {section.fields.map((field) => (
                    <label key={field.key}>
                      <span>{field.label}</span>
                      {field.help ? <small>{field.help}</small> : null}
                      <select
                        value={scores[field.key]}
                        onChange={(event) => updateScore(field.key, Number(event.target.value))}
                      >
                        {field.options.map((option) => (
                          <option key={`${field.key}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="action-row">
            <button type="button" className="secondary-button" onClick={calculateDecision}>
              Calcular agora
            </button>
            <button type="submit" className="primary-button" disabled={isPending}>
              {isPending ? "Salvando avaliação..." : "Salvar avaliação"}
            </button>
          </div>

          {decision ? (
            <div
              className={`result-panel ${decision.eligible ? "result-panel--good" : "result-panel--warn"}`}
            >
              <div>
                <strong>{decision.label}</strong>
                <p>{decision.message}</p>
              </div>
              <span>Limiar atual: {decision.threshold} pontos</span>
            </div>
          ) : null}

          <section className="insight-panel">
            <div className="insight-header">
              <h3>Leitura clínica imediata</h3>
              <span>{liveNarrative}</span>
            </div>
            <div className="breakdown-grid">
              {liveBreakdown.map((item) => (
                <article key={item.id}>
                  <strong>{item.title}</strong>
                  <p>
                    {item.score}/{item.maxScore} pontos
                  </p>
                </article>
              ))}
            </div>
          </section>

          {submission ? (
            <div className="status-banner">
              <strong>{submission.persisted ? "Registro salvo" : "Persistência pendente"}</strong>
              <p>{submission.message}</p>
              {submission.recordId ? <span>ID: {submission.recordId}</span> : null}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="status-banner status-banner--error">
              <strong>Não foi possível concluir o envio</strong>
              <p>{errorMessage}</p>
            </div>
          ) : null}
        </form>

        <aside className="side-rail">
          <section className="rail-card">
            <span className="section-label">Sessão OTTO</span>
            <h2>Contexto de autenticação</h2>
            <p>
              {session.ready
                ? session.user
                  ? `Sessão identificada para ${session.user.email ?? "usuário OTTO"}.`
                  : "Nenhuma sessão OTTO foi detectada nesta superfície."
                : "Verificando sessão OTTO..."}
            </p>
            <div className="session-tags">
              <span>{embedMode ? "Modo webview" : "Modo web"}</span>
              <span>
                {sourcePatientId ? `Paciente origem: ${sourcePatientId}` : "Sem paciente de origem"}
              </span>
              <span>
                {internalPatientId
                  ? `Paciente OTTO-IMUNE: ${internalPatientId}`
                  : "Novo paciente interno"}
              </span>
            </div>
          </section>

          <section className="rail-card">
            <span className="section-label">Painel clínico</span>
            <h2>Reaproveitamento guiado do legado</h2>
            <p>
              A estrutura antiga entra como referência de conteúdo, imagens, fluxo e linguagem
              clínica, sem reintroduzir a arquitetura Flask/Heroku no novo portal.
            </p>
          </section>

          <section className="rail-card rail-card--references">
            <span className="section-label">Pontos de apoio</span>
            <div className="reference-list">
              {references.map((item) => (
                <article key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rail-card rail-card--history">
            <span className="section-label">Histórico</span>
            <h2>Últimas avaliações do paciente</h2>
            {historyItems.length > 0 ? (
              <div className="history-list">
                {historyItems.slice(0, 5).map((item) => (
                  <article key={item.id}>
                    <strong>{item.result?.label ?? "Avaliação registrada"}</strong>
                    <p>
                      {item.totalScore ?? "-"} pontos
                      {item.createdAt
                        ? ` • ${new Date(item.createdAt).toLocaleString("pt-BR")}`
                        : ""}
                    </p>
                    <button
                      type="button"
                      className="history-button"
                      onClick={() => void loadCalculation(item.id)}
                    >
                      Abrir avaliação
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p>
                {historyMessage ??
                  "O histórico aparecerá aqui quando houver um paciente interno salvo e uma sessão OTTO válida."}
              </p>
            )}
          </section>

          <section className="rail-card rail-card--selected">
            <span className="section-label">Avaliação selecionada</span>
            <h2>Resumo estruturado</h2>
            {selectedCalculation ? (
              <div className="selected-stack">
                <p>{selectedCalculation.narrative}</p>
                <div className="breakdown-grid">
                  {selectedCalculation.breakdown.map((item) => (
                    <article key={item.id}>
                      <strong>{item.title}</strong>
                      <p>
                        {item.score}/{item.maxScore} pontos
                      </p>
                    </article>
                  ))}
                </div>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isDraftPending}
                    onClick={() => handleDraftGeneration("report")}
                  >
                    {isDraftPending ? "Gerando..." : "Gerar relatório"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isDraftPending}
                    onClick={() => handleDraftGeneration("prescription")}
                  >
                    {isDraftPending ? "Gerando..." : "Gerar prescrição"}
                  </button>
                </div>
              </div>
            ) : (
              <p>Salve uma nova avaliação ou abra um item do histórico para habilitar os drafts.</p>
            )}
            {draftMessage ? <p className="draft-message">{draftMessage}</p> : null}
          </section>

          <section className="rail-card rail-card--draft">
            <span className="section-label">Draft atual</span>
            <h2>{generatedDraft?.draft.title ?? "Relatório ou prescrição"}</h2>
            {generatedDraft ? (
              <div className="draft-stack">
                <p>{generatedDraft.draft.summary}</p>
                {generatedDraft.draft.sections.map((section) => (
                  <article key={section.title}>
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>
                Depois de selecionar uma avaliação, você poderá gerar e revisar aqui o rascunho
                estruturado do relatório ou da prescrição.
              </p>
            )}
          </section>
        </aside>
      </section>

      <style jsx>{`
        .page-shell {
          width: min(1360px, calc(100vw - 32px));
          margin: 0 auto;
          padding: calc(24px + env(safe-area-inset-top, 0px)) 0
            calc(48px + env(safe-area-inset-bottom, 0px));
        }

        .page-shell--embed {
          width: min(1360px, calc(100vw - 12px));
          padding-top: calc(12px + env(safe-area-inset-top, 0px));
        }

        .hero-panel {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.8fr);
          gap: 20px;
          align-items: stretch;
          margin-bottom: 20px;
        }

        .hero-copy,
        .hero-aside,
        .form-card,
        .rail-card {
          border: 1px solid var(--line);
          background: var(--paper);
          border-radius: 28px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(20px);
        }

        .hero-copy {
          padding: 32px;
        }

        .hero-copy h1 {
          margin: 12px 0;
          font-family: var(--font-display), serif;
          font-size: clamp(2.9rem, 5vw, 5rem);
          font-weight: 500;
          line-height: 0.95;
        }

        .eyebrow,
        .section-label,
        .aside-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--teal);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .lead {
          max-width: 48rem;
          margin: 0;
          color: var(--muted);
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .hero-badges,
        .session-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .hero-badges span,
        .score-chip,
        .session-tags span {
          border: 1px solid rgba(13, 109, 109, 0.16);
          background: rgba(255, 255, 255, 0.72);
          border-radius: 999px;
        }

        .hero-badges span,
        .session-tags span {
          padding: 10px 14px;
          color: var(--teal-deep);
          font-size: 0.94rem;
          font-weight: 700;
        }

        .hero-aside {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(180deg, rgba(228, 213, 189, 0.62), rgba(255, 249, 240, 0.94));
        }

        .hero-aside strong {
          margin: 12px 0;
          font-size: 1.2rem;
        }

        .hero-aside p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
          gap: 20px;
        }

        .form-card {
          padding: 28px;
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .panel-heading h2,
        .rail-card h2 {
          margin: 8px 0 0;
          font-family: var(--font-display), serif;
          font-size: 2rem;
          font-weight: 500;
        }

        .score-chip {
          min-width: 110px;
          padding: 10px 14px;
          text-align: right;
        }

        .score-chip span {
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .score-chip strong {
          font-size: 1.8rem;
          color: var(--teal-deep);
        }

        .patient-grid,
        .criteria-fields,
        .breakdown-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .patient-grid__wide {
          grid-column: 1 / -1;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: var(--ink);
          font-size: 0.95rem;
          font-weight: 700;
        }

        label small {
          color: var(--muted);
          font-size: 0.82rem;
          font-weight: 600;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid rgba(31, 42, 44, 0.12);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.82);
          color: var(--ink);
          padding: 14px 16px;
          transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: rgba(13, 109, 109, 0.42);
          box-shadow: 0 0 0 4px rgba(13, 109, 109, 0.1);
          transform: translateY(-1px);
        }

        textarea {
          resize: vertical;
          min-height: 88px;
        }

        .section-stack,
        .selected-stack,
        .draft-stack {
          display: grid;
          gap: 18px;
          margin-top: 24px;
        }

        .criteria-panel,
        .insight-panel {
          border: 1px solid rgba(31, 42, 44, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.5);
          padding: 22px;
        }

        .criteria-heading,
        .insight-header {
          margin-bottom: 16px;
        }

        .criteria-heading h3,
        .insight-header h3 {
          margin: 0 0 6px;
          font-size: 1.2rem;
        }

        .criteria-heading p,
        .insight-header span,
        .rail-card p,
        .reference-list p,
        .roadmap-list p,
        .history-list p,
        .draft-stack p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .breakdown-grid article {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.74);
          padding: 14px 16px;
          border: 1px solid rgba(31, 42, 44, 0.08);
        }

        .breakdown-grid strong {
          display: block;
          margin-bottom: 6px;
        }

        .action-row,
        .draft-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .primary-button,
        .secondary-button,
        .history-button {
          border: none;
          border-radius: 999px;
          padding: 14px 20px;
          font-size: 0.96rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;
        }

        .primary-button {
          background: linear-gradient(135deg, var(--teal), var(--teal-deep));
          color: white;
          box-shadow: 0 16px 34px rgba(10, 76, 79, 0.22);
        }

        .secondary-button,
        .history-button {
          background: rgba(255, 255, 255, 0.9);
          color: var(--ink);
          border: 1px solid rgba(31, 42, 44, 0.1);
        }

        .history-button {
          padding: 10px 14px;
          margin-top: 12px;
          font-size: 0.88rem;
        }

        .primary-button:hover,
        .secondary-button:hover,
        .history-button:hover {
          transform: translateY(-1px);
        }

        .primary-button:disabled,
        .secondary-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .result-panel,
        .status-banner {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-top: 18px;
          border-radius: 22px;
          padding: 18px 20px;
        }

        .result-panel strong,
        .status-banner strong {
          display: block;
          margin-bottom: 6px;
        }

        .result-panel p,
        .status-banner p {
          margin: 0;
          line-height: 1.5;
        }

        .result-panel span,
        .status-banner span {
          white-space: nowrap;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .result-panel--good {
          border: 1px solid rgba(28, 122, 82, 0.18);
          background: rgba(28, 122, 82, 0.08);
        }

        .result-panel--warn {
          border: 1px solid rgba(177, 86, 36, 0.18);
          background: rgba(177, 86, 36, 0.08);
        }

        .status-banner {
          border: 1px solid rgba(13, 109, 109, 0.14);
          background: rgba(255, 255, 255, 0.72);
        }

        .status-banner--error,
        .draft-message {
          border-color: rgba(177, 86, 36, 0.18);
          background: rgba(177, 86, 36, 0.08);
        }

        .draft-message {
          margin-top: 16px;
          padding: 14px 16px;
          border-radius: 16px;
          color: var(--warn);
        }

        .side-rail {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .rail-card {
          padding: 24px;
        }

        .reference-list,
        .roadmap-list,
        .history-list {
          display: grid;
          gap: 16px;
          margin-top: 16px;
        }

        .reference-list article,
        .roadmap-list article,
        .history-list article,
        .draft-stack article {
          border-top: 1px solid rgba(31, 42, 44, 0.08);
          padding-top: 14px;
        }

        .reference-list article:first-child,
        .roadmap-list article:first-child,
        .history-list article:first-child,
        .draft-stack article:first-child {
          border-top: none;
          padding-top: 0;
        }

        .reference-list h3,
        .roadmap-list h3,
        .draft-stack h3 {
          margin: 0 0 8px;
          font-size: 1rem;
        }

        @media (max-width: 1180px) {
          .hero-panel,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .side-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: start;
          }
        }

        @media (max-width: 1024px) {
          .hero-copy,
          .hero-aside,
          .form-card,
          .rail-card {
            border-radius: 24px;
          }
        }

        @media (max-width: 900px) {
          .patient-grid,
          .criteria-fields,
          .breakdown-grid,
          .side-rail {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-shell {
            width: min(100vw - 12px, 100%);
            padding: 10px 0 18px;
          }

          .hero-copy,
          .hero-aside,
          .form-card,
          .rail-card {
            padding: 18px;
          }

          .panel-heading,
          .result-panel,
          .status-banner {
            flex-direction: column;
          }

          .patient-grid,
          .criteria-fields,
          .breakdown-grid {
            grid-template-columns: 1fr;
          }

          .score-chip {
            text-align: left;
          }

          .action-row,
          .draft-actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .hero-copy,
          .hero-aside,
          .form-card,
          .rail-card {
            padding: 16px;
          }

          .hero-copy h1,
          .panel-heading h2,
          .rail-card h2 {
            font-size: clamp(2rem, 9vw, 2.6rem);
          }

          .hero-badges span,
          .session-tags span,
          .primary-button,
          .secondary-button,
          .history-button {
            width: 100%;
            justify-content: center;
          }

          .score-chip {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
