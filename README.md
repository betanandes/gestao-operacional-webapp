# Gestão Operacional — Construção a Seco

> **Desafio Prático:** Integração Automatizada com Google Sheets.

---

## O Problema

A equipe de operações precisava preencher manualmente uma planilha corporativa com listas de materiais, dados de produção e informações operacionais. O processo consumia mais de **4 horas diárias**, com risco constante de erros de digitação e registros incompletos.

---

## O que foi feito

Desenvolvi um protótipo de uma **ferramenta web de gestão operacional** para o contexto de Construção a Seco. A proposta foi integrar a aplicação diretamente ao Google Sheets, lendo e escrevendo dados em tempo real, mas com uma interface mais rápida e prática para o uso diário.

O resultado é que um registro que antes levava minutos passa a levar **poucos segundos**.

### Decisões de projeto

**Sem dados estáticos.** Tudo que aparece na tela vem da planilha real, buscado no momento em que o sistema é aberto.

**Status de conexão visível.** Um indicador no topo da tela mostra em tempo real se o sistema está em `Modo Local`, `Sincronizando...` ou `Sheets Conectado`.

**Validação antes do envio.** Os campos obrigatórios são verificados antes de qualquer requisição e os dados são sanitizados antes de chegarem à planilha. Sem linhas em branco ou registros incompletos.

**Rastreabilidade.** Toda vez que um registro é criado ou alterado, o sistema preenche automaticamente uma coluna `Atualizado em` com o horário exato da modificação.

---

## Tecnologias

- **Front-end:** HTML5, CSS3 e JavaScript puro
- **Back-end:** Google Apps Script (roda nos servidores do Google, sem precisar de infraestrutura própria)
- **Banco de dados:** Google Sheets

---

## Como o sistema funciona por dentro

A arquitetura é serverless, sem servidor para configurar ou manter.

Quando o **dashboard é aberto**, a aplicação faz uma requisição assíncrona para o Google Apps Script, que lê a planilha e devolve tudo em formato JSON. Métricas e tabela paginada aparecem na tela em segundos.

Quando um registro é **criado, editado ou excluído**, os dados são enviados via `POST` para o script, que identifica a operação pelo ID único do registro e faz a alteração na linha correta da planilha.

---

## Como rodar e acessar

### Acesso Direto (Web)
O sistema está publicado e pronto para uso. Você pode acessá-lo diretamente pelo link:
👉 **[https://gestaop.netlify.app/](https://gestaop.netlify.app/)**

---

### Execução Local (Alternativa)
Caso não consiga acessar pelo link acima ou queira realizar as configurações e rodar o projeto diretamente em sua máquina, siga os passos abaixo:

#### 1. Clone o repositório
```bash
git clone [https://github.com/SEU_USUARIO/gestao-operacional.git]
```

### 2. Acesse a planilha

Os dados ficam aqui: [Planilha de Gestão Operacional](https://docs.google.com/spreadsheets/d/1GAD1Bnl_1c1cA0uYnBFF21NUefdh_YVGtJQ_Va7nvLQ/edit?usp=sharing)

> Você precisa estar logado com uma conta Google que tenha permissão de acesso.

### 3. Abra e use

Não há nada para configurar. O back-end já está no ar e a URL já está no código. Basta abrir o `index.html` no navegador. Para garantir o ciclo completo de requisições assíncronas, recomendo usar a extensão **Live Server** do VS Code.

Assim que a página carregar, o indicador ficará verde com **"Sheets conectado"** e os dados aparecem na tela. Qualquer alteração feita pela interface reflete na planilha em tempo real para todos os usuários.
