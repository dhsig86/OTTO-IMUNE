# Prompt para Antigravity — Auditoria Arquitetural: OTTO-IMUNE Hub

> **Autor:** Claude (auditor sênior do ecossistema OTTO)  
> **Data:** Abril 2026  
> **Repositórios auditados:** `_TEMP_PORTAL_IMUNOBIO`, `_TEMP_CALCHUB`, `NUCALAPP/frontend`

---

## Contexto

Revisei pessoalmente o código-fonte dos três repositórios antes de escrever este prompt. Os pareceres abaixo são baseados no que existe nos arquivos, não em suposições. As decisões marcadas com **[DECIDIDO]** foram confirmadas pelo Dr. Dario e não estão abertas para debate — execute conforme especificado.

---

## 1. Decisões fechadas pelo usuário

### 1.1 — Roteamento do Hub **[DECIDIDO]**

**A rota `/` permanece como a Calculadora de Elegibilidade.** O Hub entra em `/hub`.

Motivo: o OTTO PWA hoje aponta o iframe para `/` esperando a calculadora. Manter `/` preserva o fluxo existente sem precisar atualizar o PWA agora.

**Estrutura de rotas resultante:**

```
/                  → Calculadora de Elegibilidade (atual — não mover)
/hub               → Menu Hub (novo — ponto de entrada do portal)
/lund-mackay       → Calculadora Lund-Mackay (novo)
/snot-22           → Calculadora SNOT-22 (novo)
/report            → Gerador de Relatório Médico (novo)
/info              → Informações sobre imunobiológicos (novo)
```

O Hub Menu em `/hub` terá cards apontando para cada ferramenta, incluindo um card para a própria `/` (Elegibilidade). Dentro do iframe do OTTO PWA, a navegação entre rotas acontece por Next.js client-side routing — sem recarregar o iframe.

---

### 1.2 — O Gerador de Relatório deve auto-injetar scores de Lund-Mackay e SNOT-22 da sessão ativa? **[DECIDIDO]**

**Não injetar automaticamente. Pré-preencher como sugestão confirmável.**

Olhei o `relatorio.js` original. O design já estava correto no legado: Lund-Mackay e SNOT-22 são **campos de input manuais** no formulário do relatório — o médico digita o número. Isso é clinicamente correto porque:

- O score pode ser de uma consulta anterior, não da sessão atual
- O relatório médico é um documento legal — o médico precisa confirmar cada valor deliberadamente
- Auto-injeção silenciosa cria risco de laudo com dados desatualizados

**Implementação:** Se o PatientContext tiver valores de Lund-Mackay ou SNOT-22 da sessão, **pré-preencher os campos** com um indicador visual sutil ("Sugerido pela sessão — confirme antes de gerar"). O médico vê, confirma ou edita, e só então gera. Nunca auto-injetar sem indicação visual.

---

### 1.3 — Design System: migrar tudo para Tailwind **[DECIDIDO]**

**O projeto inteiro será migrado para Tailwind CSS.** Não misturar sistemas.

Isso significa duas coisas em paralelo:

**A) Instalar e configurar Tailwind no projeto existente:**

```bash
npm install tailwindcss @tailwindcss/typography
```

Configurar `tailwind.config.ts` com os tokens do OTTO PWA como tema customizado:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "otto-bg":        "#f0f4f8",
        "otto-surface":   "#ffffff",
        "otto-primary":   "#0d6d6d",
        "otto-primary-dk":"#0a4c4f",
        "otto-text":      "#1a2b2c",
        "otto-muted":     "#56717a",
        "otto-border":    "#d0dde0",
        "otto-success":   "#1c7a52",
        "otto-warn":      "#b15624",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

Adicionar ao `globals.css`:
```css
@import "tailwindcss";
```

**B) Converter os componentes existentes de `otto-*` para Tailwind:**

Todos os componentes atuais em `src/components/EligibilityForm/` usam classes CSS customizadas (`otto-container`, `otto-btn`, `otto-section`, etc.). Eles precisam ser reescritos com classes Tailwind equivalentes usando os tokens acima.

Exemplos de mapeamento:

| Classe atual       | Equivalente Tailwind                                         |
|--------------------|--------------------------------------------------------------|
| `otto-container`   | `max-w-[680px] mx-auto my-8 p-8 bg-white rounded-xl shadow-md` |
| `otto-btn-primary` | `bg-otto-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-otto-primary-dk transition-colors` |
| `otto-section`     | `mb-8`                                                       |
| `otto-section-title`| `text-otto-primary-dk font-semibold text-lg mb-4 pb-2 border-b border-otto-border` |
| `otto-field`       | `flex flex-col mb-5`                                         |
| `otto-label`       | `flex items-center gap-1.5 font-semibold text-sm text-otto-text mb-1.5` |
| `otto-select`      | `w-full px-3 py-2.5 border border-otto-border rounded-lg bg-otto-bg text-otto-text focus:outline-none focus:border-otto-primary focus:ring-2 focus:ring-otto-primary/20` |
| `otto-result.success` | `bg-green-50 border-2 border-otto-success text-otto-success p-4 rounded-lg text-center font-semibold` |
| `otto-result.error`| `bg-red-50 border-2 border-otto-warn text-otto-warn p-4 rounded-lg text-center font-semibold` |

Após a conversão, **deletar o bloco inteiro de classes `otto-*`** do `globals.css`, mantendo apenas os tokens CSS (`:root { --otto-* }`) e as regras de `@media print`.

Novos componentes (Hub Menu, LundMckay, SNOT-22, /report, /info) usam Tailwind diretamente desde o início — sem criar nenhuma classe customizada nova.

---

## 2. Riscos técnicos confirmados — execute com atenção

### 🔴 Crítico — PatientContext sem validação de origem

O plano menciona `window.addEventListener('message')` no PatientContext sem especificar validação de origem. **Isso é uma vulnerabilidade.** Qualquer janela pode injetar dados de paciente.

A validação já existe no `EligibilityForm/index.tsx` atual via `NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN`. O PatientContext **deve usar a mesma lógica:**

```typescript
// src/contexts/PatientContext.tsx — validação obrigatória
function handleMessage(event: MessageEvent) {
  const allowed = process.env.NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN?.trim() || null;
  if (allowed && event.origin !== allowed) return;
  if (event.data?.type !== "otto:set-context") return;
  // aplicar contexto...
}
```

O PatientContext **deve estar no `src/app/layout.tsx`** (root layout), não em páginas individuais. O `otto:set-context` é enviado uma única vez quando o iframe carrega — se o contexto estiver em páginas, ele se perde na navegação entre rotas.

Após criar o PatientContext no root layout, **remova** a lógica de bridge duplicada que existe atualmente no `EligibilityForm/index.tsx` e substitua pelo consumo do contexto compartilhado.

---

### 🔴 Confirmado — As calculadoras do CALC-HUB precisam ser reescritas em React

Verificado nos repositórios:

- `_TEMP_CALCHUB/temp_calcs/LundMckay/` → vanilla HTML + `lundmckay.js` + CSS puro
- `_TEMP_CALCHUB/temp_calcs/SNOT22/` → pasta com zip não extraído (sem código utilizável)
- `frontend_draft/` → vazio

**Não há componentes React para importar.** Use os arquivos `.js` e `.html` como referência de lógica e reescreva em React com Tailwind. Inclua isso no escopo de tempo — não é uma cópia, é uma reescrita.

---

### 🟡 Importante — `gender` não existe no BridgePayload atual

O PatientContext proposto lista `gender` como campo. O BridgePayload atual tem: `patientName`, `birthDate`, `age`, `cid10`, `embed`, `sourcePatientId`, `ottoImunePatientId`. **`gender` não é enviado pelo OTTO PWA.**

Solução: manter `gender` como `<select>` manual no formulário `/report`, igual ao legado. Não depende de atualização no PWA e é clinicamente mais seguro (médico confirma explicitamente).

---

### 🟡 Importante — PWA Manifest ausente

Criar `src/app/manifest.ts` (Next.js 16 suporta nativo):

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OTTO-IMUNE",
    short_name: "IMUNE",
    description: "Portal de Imunobiológicos para RSC com Polipose",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f4f8",
    theme_color: "#0d6d6d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
```

Adicionar ao `globals.css` os fixes de mobile para iframe:

```css
body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

button, select, input {
  -webkit-tap-highlight-color: transparent;
}
```

---

### 🟡 Importante — ResizeObserver precisa sair do EligibilityForm

O `EligibilityForm/index.tsx` atual reporta altura via `postMessage("otto-imune:height")` com um `ResizeObserver` no `<form>`. No Hub, diferentes páginas têm alturas diferentes. Mover o ResizeObserver para o **root layout**, observando um wrapper de altura total do app. Remover do EligibilityForm após mover.

---

## 3. O que está correto no plano — confirmo sem ressalvas

- **`PatientContext` no root layout** compartilhado por todas as rotas → arquitetura correta
- **`/report` reescrevendo `relatorio.js`** → principal ganho da migração
- **`/info` a partir de `info.html`** → implementação direta
- **`public/lme/LME_Outubro_2022.pdf`** → arquivo já existe em `_TEMP_PORTAL_IMUNOBIO/`, copiar diretamente
- **Gerador de relatório com `contenteditable` e `window.print()`** → funcionou no legado, manter a abordagem
- **`firestore.rules` e `firestore.indexes.json`** → já criados pelo Claude, não alterar

---

## 4. Ordem de execução

```
1.  Instalar Tailwind + configurar tailwind.config.ts com tokens OTTO
2.  Converter componentes EligibilityForm existentes de otto-* para Tailwind
3.  Limpar globals.css (remover classes otto-*, manter :root tokens e @media print)
4.  Criar PatientContext.tsx no root layout (com validação de origem)
5.  Remover lógica de bridge duplicada do EligibilityForm/index.tsx
6.  Mover ResizeObserver para o root layout
7.  Criar /hub/page.tsx — Hub Menu com cards Tailwind
8.  Reescrever LundMckay em React+Tailwind → /lund-mackay/page.tsx
9.  Reescrever SNOT-22 em React+Tailwind → /snot-22/page.tsx
10. Criar /info/page.tsx a partir de info.html
11. Criar /report/page.tsx — MedicalReportGenerator (campos manuais + sugestão de sessão)
12. Copiar LME_Outubro_2022.pdf para public/lme/
13. Criar manifest.ts + ícones em public/icons/
14. Adicionar mobile iframe fixes ao globals.css
15. npm run typecheck — zero erros antes de qualquer commit
```

---

## 5. Checklist de verificação para o Claude auditar depois

Quando terminar, envie para auditoria com confirmação dos seguintes itens:

- [ ] `PatientContext` valida `event.origin` antes de aceitar mensagem
- [ ] `PatientContext` está em `src/app/layout.tsx` (root), não em páginas individuais
- [ ] Lógica de bridge removida do `EligibilityForm/index.tsx` — consumindo PatientContext
- [ ] ResizeObserver movido para o root layout
- [ ] Tailwind instalado e `tailwind.config.ts` com tokens OTTO PWA
- [ ] Nenhuma classe `otto-*` remanescente nos componentes (somente tokens `:root` e print CSS)
- [ ] Nenhum arquivo novo tem null bytes (bug recorrente nas versões anteriores)
- [ ] `npm run typecheck` passa com zero erros
- [ ] `manifest.ts` criado com ícones reais em `public/icons/`
- [ ] `globals.css` tem `overscroll-behavior: none` e `touch-action: manipulation`
- [ ] `/hub` existe e renderiza os cards de navegação corretamente
- [ ] `/report` — `gender` é `<select>` manual; Lund-Mackay e SNOT-22 são inputs com sugestão visual de sessão
- [ ] `LME_Outubro_2022.pdf` acessível em `/lme/LME_Outubro_2022.pdf`
- [ ] TypeScript check: zero erros
