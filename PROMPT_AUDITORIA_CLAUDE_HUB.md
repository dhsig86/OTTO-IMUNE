# Prompt: Auditoria Arquitetural — Portal OTTO-IMUNE Hub

## Contexto e Objetivo
Você é o Claude, auditor sênior de arquitetura do ecossistema OTTO PWA. Acabo de fechar o planejamento de integração com o Antigravity (IA de código). 

Nossa missão é transformar o atual módulo isolado **OTTO-IMUNE** (que hoje é apenas uma Calculadora de Elegibilidade Nucala em Next.js/Tailwind) em um **Portal Imunobiológicos Completo (Hub Multipage)**, consolidando o legado do antigo projeto statico (`PORTAL_IMUNOBIO`) e ferramentas do `OTTO CALC-HUB`.

## Decisões Arquiteturais Acordadas com o Antigravity
Após análise dos repositórios locais pelo Antigravity, fechamos o seguinte roadmap de execução que ele realizará em breve:

1. **Roteamento Hub (Novo Frontend Core):**
   - A página raiz `src/app/page.tsx` passará a abrigar o **Menu Hub** (uma navegação com cards apontando para as calculadoras).
   - O OTTO PWA usará essa raiz `/` no seu iframe para que o médico veja o menu inteiro primeiro.
   - A calculadora atual foi encapsulada e será movida para `src/app/eligibility/page.tsx`.

2. **Migração Componentizada:**
   - Vamos importar nativamente as calculadoras React `LundMckayCalc` e `Snot22Calc` do repositório externo (`OTTO CALC-HUB`) criando rotas dedicadas (`/lund-mackay` e `/snot-22`) no OTTO-IMUNE.
   - Iremos recriar a página estática `info.html` na rota nativa `/info`.
   - Vamos disponibilizar o download do formulário padrão em `public/lme/LME_Outubro_2022.pdf`.

3. **Novo Gerador de Relatório Médico (`/report`):**
   - O legado Vanilla JS (`relatorio.js`) será reescrito em React como um gerador inteligente focado inteiramente na validação da Elegibilidade.
   - **Regra de Negócio Crítica (Definida pelo Usuário):** O gerador de relatório interativo extrairá as strings de texto **apenas** baseando-se no que for inserido internamente no score de Elegibilidade da Nucala. Ele **não** injetará valores externos ou automáticos vindos independentemente das páginas de Lund-Mackay ou SNOT-22.

4. **Gerenciamento de Estado Seguro:**
   - Adotaremos um `PatientContext.tsx` que escuta os eventos do `postMessage` Bridge vindo do PWA superior e compartilha dados demográficos de forma limpa pelo Hub.

---

## Sua Tarefa como Auditor
Baseado neste plano, preciso que você o valide criticamente antes de eu dar o comando final de *Start* para o Antigravity codar. 

Analise e responda às seguintes frentes:
1. Analisando o roteamento Next.js e state management (PatientContext via postMessage persistindo em abas diferentes), você vê alguma falha de segurança no iframe tracking ou perda de sessão de paciente na transição das Views?
2. Concorda que desacoplar os escores externos (Lund-Mackay/SNOT-22) da geração direta do laudo oficial da Elegibilidade (regra 3) garante maior coerência clínica perante compliance da operadora?
3. Indique se falta algum item mandatório de acessibilidade ou PWA manifesto que o Antigravity esqueceu para esse "Menu Hub" rodar perfeitamente incrustado num mobile.
