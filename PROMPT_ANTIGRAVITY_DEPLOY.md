# Prompt para Antigravity — Deploy OTTO-IMUNE na Vercel

## Contexto

Você é o **Antigravity**, IA desenvolvedora do ecossistema OTTO PWA. O módulo **OTTO-IMUNE** (calculadora de elegibilidade para imunobiológicos em RSC com polipose) foi auditado, refatorado e está pronto para deploy. Toda a base de código está em `NUCALAPP/frontend/`.

Stack: **Next.js 16 + TypeScript + Firebase Auth + Firestore**, deploy na **Vercel**, região `gru1` (São Paulo).

O projeto Firebase já existe: `otto-ecosystem` (o usuário já tem acesso ao Firebase Console).

---

## Sua tarefa: guiar o deploy em 4 etapas

### Etapa 1 — Preencher `.env.local`

O arquivo `NUCALAPP/frontend/.env.example` já existe com todas as variáveis documentadas. O usuário precisa:

1. Copiar `.env.example` → `.env.local` na mesma pasta
2. Preencher as variáveis em branco

**Onde encontrar cada valor:**

- `NEXT_PUBLIC_FIREBASE_API_KEY` e `NEXT_PUBLIC_FIREBASE_APP_ID`:  
  Firebase Console → Configurações do projeto (ícone de engrenagem) → Seus apps → selecionar o app Web → "Configuração do SDK"

- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`:  
  Mesma tela acima, campo `messagingSenderId`

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (opcional — Analytics):  
  Mesma tela, campo `measurementId` (pode deixar vazio se Analytics não estiver ativo)

- `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` (Admin SDK — servidor):  
  Firebase Console → Configurações do projeto → **Contas de serviço** → "Gerar nova chave privada" → baixar o JSON → copiar `client_email` e `private_key`  
  ⚠️ No valor de `FIREBASE_PRIVATE_KEY`, substituir as quebras de linha reais por `\n` (tudo em uma linha só, com aspas)

- `NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN`:  
  Usar `https://otto-pwa.vercel.app` para produção, ou `http://localhost:3001` para teste local

Após preencher, teste localmente com `npm run dev` dentro de `NUCALAPP/frontend/`.

---

### Etapa 2 — Configurar variáveis de ambiente na Vercel

As mesmas variáveis do `.env.local` precisam existir no painel da Vercel (elas não sobem com o código).

1. Acesse [vercel.com](https://vercel.com) → seu projeto OTTO-IMUNE
2. Vá em **Settings → Environment Variables**
3. Adicione **cada variável** do `.env.local` com o mesmo nome e valor
4. Para `FIREBASE_PRIVATE_KEY`: o valor deve estar com `\n` literais (não quebras de linha reais) — a Vercel cuida da interpolação corretamente
5. Marque o escopo como **Production** (e Preview se quiser testar em PRs)

---

### Etapa 3 — Deploy das regras e índices do Firestore

Antes do primeiro deploy do app, as regras e índices precisam ser publicados no Firebase.

**Pré-requisito:** Firebase CLI instalado (`npm install -g firebase-tools`) e autenticado (`firebase login`).

```bash
# Na pasta NUCALAPP/frontend/
firebase use otto-ecosystem
firebase deploy --only firestore:rules,firestore:indexes
```

Isso publica:
- `firestore.rules` — regras de segurança (escrita bloqueada no cliente, leitura restrita ao dono)
- `firestore.indexes.json` — índice composto em `calculator_runs` necessário para o histórico do paciente funcionar

Se o usuário ainda não tiver o `firebase.json` na raiz do projeto, crie um com:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

### Etapa 4 — Push para a branch da Vercel

```bash
# Na raiz do repositório
git add NUCALAPP/frontend/
git commit -m "feat(otto-imune): deploy-ready — 5 fases concluídas"
git push origin main
```

A Vercel detecta o push automaticamente e faz o build. Acompanhe em **vercel.com → Deployments**.

Após o deploy, verificar:
- `https://<url-do-projeto>.vercel.app/api/health` → deve retornar `{"status":"ok"}`
- Acessar o formulário e clicar em **Calcular** → resultado deve aparecer sem erros
- Se Firebase estiver configurado corretamente: clicar em **Enviar** → deve salvar e retornar ID do registro

---

## Observações importantes

- O `.env.local` **nunca deve ser commitado** (já está no `.gitignore`)
- O backend legado em `NUCALAPP/backend/` (FastAPI/Heroku) **não é mais necessário** — todas as rotas já estão nas API routes do Next.js
- O `NUCALAPP/frontend/vercel.json` já configura região `gru1` e timeout de 15s nas funções
- Em caso de erro 400 ao Enviar: verificar se o OTTO PWA está passando `patientName`, `birthDate`/`age` e `cid10` via bridge antes de submeter
