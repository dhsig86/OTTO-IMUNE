# OTTO-IMUNE

## Arquitetura atual

- Frontend e rotas `/api` em Next.js, preparados para deploy na Vercel.
- Persistência em Firebase/Firestore.
- Sessão opcional via Firebase Auth reaproveitando o projeto `otto-ecosystem`.
- Integração planejada para consumo dentro da OTTO PWA por webview.

## Variáveis de ambiente

Definir na Vercel e no ambiente local:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_OTTO_ALLOWED_PARENT_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Rotas principais

- `GET /api/health`
- `POST /api/calculators/eligibility`
- `GET /api/calculations/:id`
- `GET /api/patients/:patientId/calculations`
- `POST /api/reports/draft`
- `POST /api/prescriptions/draft`
- `GET /api/references/immunobiologics`

## Contrato inicial com a OTTO PWA

### Query params aceitos

- `embed=1`
- `patientId`
- `sourcePatientId`
- `ottoImunePatientId`
- `patientName`
- `birthDate`
- `age`
- `cid10`

### Mensagens `postMessage` aceitas

O OTTO-IMUNE escuta:

```json
{
  "type": "otto:set-context",
  "payload": {
    "embed": true,
    "sourcePatientId": "abc",
    "ottoImunePatientId": "xyz",
    "patientName": "Paciente",
    "birthDate": "1980-01-01",
    "age": 45,
    "cid10": "J45;J32.4"
  }
}
```

### Mensagens enviadas ao app pai

Ao iniciar:

```json
{
  "type": "otto-imune:ready",
  "payload": {
    "version": "2026-04-19",
    "embedMode": true,
    "capabilities": ["eligibility", "history", "reportDraft", "prescriptionDraft"]
  }
}
```

Ao redimensionar o conteúdo:

```json
{
  "type": "otto-imune:height",
  "payload": {
    "height": 1280
  }
}
```

## Observações de integração

- O frontend consome as próprias rotas `/api`, então não precisa de um backend separado para o OTTO-IMUNE.
- Se a OTTO PWA abrir o OTTO-IMUNE no mesmo domínio do deploy Vercel, não há necessidade de CORS adicional entre frontend e API.
- Se o app pai quiser chamar as rotas diretamente de outro domínio, isso deve ser tratado depois com política explícita.
- A service account deve ficar apenas em variáveis server-side da Vercel.
- Rotacionar a chave do Admin SDK antes do deploy final.

## Responsividade

O layout já foi ajustado para:

- celulares pequenos
- celulares grandes
- tablets em retrato
- tablets em paisagem
- desktops e notebooks
- webview com `safe area`

## Checklist de deploy

1. Rotacionar a service account do Firebase Admin.
2. Atualizar as variáveis de ambiente na Vercel.
3. Fazer o deploy do projeto `frontend/`.
4. Validar `GET /api/health`.
5. Validar salvamento de elegibilidade.
6. Validar histórico por paciente.
7. Validar geração de draft de relatório e prescrição.
8. Validar abertura dentro da OTTO PWA em telas pequenas e médias.
