# Gestão Operacional — Construção a Seco 🏗️

> **Desafio Prático:** Integração Automatizada com Google Sheets.

---

## 📝 O Problema (Contexto de Negócio)
Vários funcionários da operação enfrentavam um gargalo diário de produtividade: era necessário preencher manualmente informações, listas de materiais e dados operacionais diretamente em uma planilha corporativa. Esse processo manual, lento e descentralizado, consumia **mais de 4 horas diárias** do tempo útil de trabalho da equipe.

## 💡 A Solução
Foi desenvolvido um protótipo funcional de uma **Ferramenta Web de Gestão Operacional** focada em Construção a Seco. A aplicação resolve o problema ao fornecer uma interface moderna, ágil e intuitiva que se comunica de forma bidirecional e assíncrona com o Google Sheets, reduzindo o tempo de preenchimento de minutos para **poucos segundos por registro**.

### 🌟 Diferenciais Estratégicos do Protótipo
* **Única Fonte da Verdade:** O sistema não armazena dados fictícios locais de forma estática; ele lê a planilha em tempo real ao iniciar e sincroniza instantaneamente qualquer inserção, edição ou exclusão.
* **Modo de Conexão Transparente:** O colaborador visualiza o status da conexão em tempo real (`Modo Local`, `Sincronizando...`, `Sheets Conectado`) através de um indicador dinâmico.
* **Validação de Dados Blindada:** Interface com tratamento rígido de campos obrigatórios e sanitização de dados, evitando erros humanos de digitação ou linhas em branco na planilha.
* **Rastreabilidade (Auditoria):** O script popula automaticamente uma coluna de controle chamada `Atualizado em` com o carimbo de data/hora exato de cada modificação.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript.
* **Back-end & Integração:** Google Apps Script (Engine baseada em V8 executada nos servidores Cloud da Google).
* **Banco de Dados:** Google Sheets (Armazenamento estruturado de fácil acesso gerencial).

---

## 🏗️ Arquitetura e Fluxo de Dados

O ecossistema foi desenhado sob uma arquitetura serverless simples e altamente eficaz:

1. **Leitura (GET):** Ao carregar o Dashboard, uma requisição `fetch()` assíncrona é disparada para o endpoint do Apps Script. O script intercepta a chamada através da função `doGet(e)`, lê as linhas do Sheets, converte-as em um array JSON perfeitamente mapeado e responde para a aplicação web, alimentando as métricas do topo e a tabela paginada.
2. **Escrita / Mutação (POST):** Quando o usuário cria, edita ou exclui um registro, os dados limpos são encapsulados em um payload JSON e transmitidos via método `POST` com a diretriz `no-cors` para o Apps Script. A função `doPost(e)` processa a regra de negócio (append, update ou delete row) de forma indexada através do ID incremental único.

---

## 🚀 Como Executar e Configurar o Projeto

### 1. Clonar o Repositório
```bash
git clone [https://github.com/SEU_USUARIO/gestao-operacional.git](https://github.com/SEU_USUARIO/gestao-operacional.git)
```

### 2. Acesso à Planilha Coletiva
A aplicação está integrada a uma planilha centralizada que funciona como o banco de dados do ecossistema. Para acessá-la e visualizar os dados sendo populados em tempo real, utilize o link:
👉 [Planilha de Gestão Operacional — Google Sheets](https://docs.google.com/spreadsheets/d/1GAD1Bnl_1c1cA0uYnBFF21NUefdh_YVGtJQ_Va7nvLQ/edit?usp=sharing)

> ⚠️ **Nota:** Certifique-se de estar logado em uma conta Google que possua permissão de acesso a este link.

### 3. Executando a Aplicação
O projeto foi desenvolvido pensando na máxima otimização de tempo, contando com uma arquitetura de **Configuração Zero**. Como o back-end já está implantado e a URL está pré-configurada nativamente no código, nenhuma configuração manual é necessária por parte do usuário.

Para rodar o protótipo:
1. Abra o arquivo `index.html` diretamente no seu navegador (recomendado utilizar a extensão *Live Server* do VS Code para garantir o ciclo completo de requisições assíncronas).
2. Assim que a página carregar, o indicador visual (Topbar) mudará automaticamente para o status verde **"Sheets conectado"**.
3. O sistema fará a busca assíncrona imediata e trará todos os dados reais da planilha diretamente para a sua tela. 

*Qualquer inserção, edição ou exclusão feita pela interface web atualizará a planilha compartilhada para todos os usuários em tempo real.*
