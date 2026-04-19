# NUCALAPP — Auditoria e Plano de Integração
> OTTO PWA · OTTO-IMUNE · Dr. Dario Hart Signorini · Abril 2026

---

## 1. Diagnóstico: O que cada versão tem

### Versão Legacy (`/legacy/frontend`)
Tecnologia: HTML + CSS + JS puro · Backend: Flask (Heroku)

**Pontos fortes:**
- UI limpa e focada — só o formulário, sem distrações
- Formulário funcional com 4 seções bem definidas (Sintomas, Extensão, Comorbidades, Biomarcadores)
- Botões claros: Calcular · Enviar · Imprimir · Resetar · Ajuda
- Popups com imagens de referência (EVA, Escore Pólipo, Lund-Mackay) — recurso clínico valioso
- Feedback de resultado visual simples: verde (indicado ≥14) / vermelho (não indicado)
- Link direto ao SNOT-22 validado em PT-BR
- Função de impressão funcional
- Rodapé com autoria

**Pontos fracos:**
- HTML/JS puro — sem tipagem, sem rotas, sem PWA
- Sem autenticação
- Backend Heroku (legado, custo variável)
- Fonte Arial — não alinhada ao OTTO PWA (Inter)
- Sem persistência estruturada / histórico
- Sem integração com outros módulos do OTTO

---

### Versão Nova (`/frontend` + `/backend`)
Tecnologia: Next.js 16 + TypeScript · Backend: FastAPI + Firebase + Firestore · Deploy: Vercel

**Pontos fortes:**
- Next.js com rotas prontas na Vercel — infraestrutura de produção sólida
- TypeScript — tipagem forte, manutenção facilitada
- Firebase Auth + Firestore — autenticação e persistência reais
- Bridge de dados com OTTO PWA (patientId, nome, birthDate, CID-10)
- Histórico de avaliações por paciente
- Geração de narrativa clínica automática
- Breakdown de pontuação por seção
- Rascunhos de relatórios e receitas (prescriptions/reports drafts)
- Lógica de elegibilidade bem estruturada em `/lib/eligibility.ts`
- API routes bem organizadas

**Pontos fracos:**
- Fontes erradas: Manrope + Newsreader — conflito com OTTO PWA (deve ser Inter)
- UI poluída com cards excessivos inseridos pelo Codex
- Design warm/bege (#f4efe5) inconsistente com paleta OTTO PWA
- Componente `EligibilityForm.tsx` com mais de 36KB — monolítico, difícil de manter
- Contexto clínico redundante em cards (poluição visual)
- Sem botão de impressão
- Sem popups de referência (EVA, Pólipo, Lund-Mackay)
- Sem botão de ajuda

---

## 2. O Que Manter · O Que Descartar · O Que Resgatar

| Elemento | Fonte | Decisão |
|---|---|---|
| Next.js + Vercel | Nova | ✅ Manter |
| TypeScript | Nova | ✅ Manter |
| Firebase Auth + Firestore | Nova | ✅ Manter |
| Bridge com OTTO PWA (patientId, etc.) | Nova | ✅ Manter |
| Lógica de eligibilidade (`eligibility.ts`) | Nova | ✅ Manter |
| API routes (`/api/calculations`, `/api/patients`) | Nova | ✅ Manter |
| Histórico de avaliações | Nova | ✅ Manter |
| Narrativa clínica | Nova | ✅ Manter — porém oculta por padrão |
| Drafts (relatórios/receitas) | Nova | ⚠️ Secundarizar — feature futura |
| Cards com contexto excessivo | Nova | ❌ Remover |
| Fontes Manrope + Newsreader | Nova | ❌ Substituir por Inter |
| Paleta warm/bege | Nova | ❌ Substituir pela paleta OTTO PWA |
| Estrutura de formulário em 4 seções | Legacy | ✅ Resgatar |
| Popups de imagem (EVA, Pólipo, Lund-Mackay) | Legacy | ✅ Resgatar |
| Botão Imprimir | Legacy | ✅ Resgatar |
| Botão Ajuda com passo a passo | Legacy | ✅ Resgatar |
| Resultado verde/vermelho simples | Legacy | ✅ Resgatar |
| Link SNOT-22 no label | Legacy | ✅ Resgatar |
| Botão Resetar | Legacy | ✅ Resgatar |
| Backend Flask/Heroku | Legacy | ❌ Aposentar (FastAPI + Vercel já cobre) |

---

## 3. Paleta e Identidade Visual — OTTO PWA

A versão curada deve seguir o design system do OTTO PWA:

```css
/* Tipografia */
font-family: 'Inter', sans-serif;  /* obrigatório — alinhado ao OTTO PWA */

/* Paleta base sugerida (a confirmar com tokens OTTO PWA) */
--otto-bg:        #f0f4f8;       /* fundo geral — cinza-azulado neutro */
--otto-surface:   #ffffff;       /* cards e formulário */
--otto-primary:   #0d6d6d;       /* teal — cor primária OTTO */
--otto-primary-dk:#0a4c4f;       /* teal escuro — hover, títulos */
--otto-text:      #1a2b2c;       /* texto principal */
--otto-muted:     #56717a;       /* labels, secundários */
--otto-border:    #d0dde0;       /* bordas suaves */
--otto-success:   #1c7a52;       /* resultado positivo */
--otto-warn:      #b15624;       /* resultado negativo */
--otto-shadow:    0 2px 12px rgba(0,0,0,0.08);
```

> O teal (`#0d6d6d`) já existe na versão nova e é compatível com o OTTO PWA — apenas a tipografia e o background precisam mudar.

---

## 4. Nova Arquitetura de Componentes (Next.js Curado)

```
src/
├── app/
│   ├── layout.tsx          ← Inter via next/font, metadata OTTO-IMUNE
│   ├── globals.css         ← tokens OTTO PWA
│   ├── page.tsx            ← entrada simples
│   └── api/
│       ├── calculations/   ← manter
│       ├── patients/       ← manter
│       └── health/         ← manter
├── components/
│   ├── EligibilityForm/
│   │   ├── index.tsx       ← orquestrador (substituir monolítico atual)
│   │   ├── FormSection.tsx ← seção reutilizável (Sintomas, Extensão, etc.)
│   │   ├── ScoreField.tsx  ← campo select individual
│   │   ├── ResultBadge.tsx ← resultado verde/vermelho
│   │   ├── ScoreTotal.tsx  ← pontuação total com feedback visual
│   │   ├── ReferencePopup.tsx ← popups EVA / Pólipo / Lund-Mackay
│   │   └── ActionBar.tsx   ← botões Calcular · Imprimir · Resetar · Ajuda
│   └── ui/
│       └── HelpModal.tsx   ← modal de ajuda passo a passo
└── lib/
    ├── eligibility.ts      ← manter como está ✅
    ├── firebase-client.ts  ← manter ✅
    ├── firebase-admin.ts   ← manter ✅
    └── firestore-store.ts  ← manter ✅
```

---

## 5. UI Curada — Princípios de Design

### Filosofia
> **"Ferramenta clínica, não dashboard."**
> O médico precisa de clareza e velocidade. Cada campo deve ter propósito. Nenhum card deve existir apenas para exibir contexto que o médico já sabe.

### Regras visuais
1. **Formulário em coluna única**, máximo 680px — igual ao legacy, focado
2. **Seções com separador visual leve**, não cards com sombra pesada
3. **Labels com link ou ícone ℹ️** para abrir popup de referência (EVA, Pólipo, Lund-Mackay) — resgatado do legacy
4. **Select com options claras** — manter formato `< 20 (0 ponto)` do legacy
5. **Pontuação total** — campo readonly com destaque, calculado em tempo real
6. **Resultado** — banner simples: verde se ≥ 14, laranja/vermelho se < 14
7. **Barra de ações** fixa no fundo do formulário: `Calcular | Enviar | Imprimir | Resetar | Ajuda`
8. **Narrativa clínica** — colapsável, abaixo do resultado, para não poluir o fluxo principal
9. **Histórico** — acessível via ícone/link lateral, não na tela principal
10. **Sem cards de contexto** automáticos — o Codex os gerou como preenchimento, não como UX intencional

---

## 6. Plano de Integração — Fases

### Fase 1 — Fundação visual (prioridade alta)
- [ ] Substituir `Manrope + Newsreader` por `Inter` no `layout.tsx`
- [ ] Reescrever `globals.css` com tokens OTTO PWA
- [ ] Remover todos os cards de contexto automático do `EligibilityForm.tsx`
- [ ] Ajustar cores: trocar paleta warm/bege pela paleta OTTO

### Fase 2 — Resgate do legacy (prioridade alta)
- [ ] Recriar `ReferencePopup.tsx` — modal com imagens EVA / Pólipo / Lund-Mackay
- [ ] Adicionar ícone ℹ️ nos labels correspondentes (VAS, Pólipo, Lund-Mackay)
- [ ] Restaurar link no label SNOT-22 → `dhsig86.github.io/Snot22score/`
- [ ] Implementar `ActionBar.tsx` com botões: Calcular · Enviar · Imprimir · Resetar · Ajuda
- [ ] Implementar função de impressão (print stylesheet adaptado)
- [ ] Implementar `HelpModal.tsx` com passo a passo

### Fase 3 — Refatoração do componente (prioridade média)
- [ ] Quebrar `EligibilityForm.tsx` (36KB monolítico) em componentes menores
- [ ] `FormSection.tsx` — seção reutilizável com título e separador
- [ ] `ScoreField.tsx` — campo select com label + ícone opcional
- [ ] `ResultBadge.tsx` — banner de resultado verde/laranja
- [ ] `ScoreTotal.tsx` — campo de pontuação total com feedback em tempo real

### Fase 4 — Features secundárias (prioridade baixa)
- [ ] Tornar narrativa clínica colapsável (accordion)
- [ ] Tornar histórico acessível via drawer/modal lateral
- [ ] Avaliar drafts (relatórios/receitas) como feature futura separada

### Fase 5 — Alinhamento OTTO PWA (prioridade média)
- [ ] Confirmar tokens de design com o design system OTTO PWA
- [ ] Garantir que o bridge de dados (`BridgePayload`) funciona com a versão atual do OTTO
- [ ] Testar embed mode (`?embed=true`) dentro do OTTO PWA
- [ ] Revisar CORS no FastAPI backend para domínios Vercel

---

## 7. Resumo Executivo

A versão nova tem a infraestrutura certa (Next.js, Vercel, Firebase, TypeScript) mas o visual errado. A versão legacy tem o visual e a UX certos mas a tecnologia limitada.

A estratégia é: **manter o esqueleto técnico da versão nova, e vestir ele com a alma do legacy** — formulário limpo, popups de referência, botões funcionais, resultado direto, e a fonte Inter do OTTO PWA.

O trabalho mais crítico é a Fase 1 (visual) + Fase 2 (resgate de UX), que juntas já entregariam 80% do valor. As fases 3–5 são melhorias incrementais que podem ser feitas em paralelo ou depois.
