let SHEETS_URL = localStorage.getItem('sheetsUrl') || 'https://script.google.com/macros/s/AKfycbxieaJaEcuTI95pPzGbycOCEcTg1bzzoBDeIj6H1KHzGjKx2MVrA-9nQw1PIclK_Mk/exec';

// ============================================================
// ESTADO
// ============================================================
let dados = [];
let nextId = 1; 
let editandoId = null;
let excluindoId = null;
let pagina = 1;
const POR_PAG = 8;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-data').value = hoje();
  atualizarStatusConexao();
  
  // Se houver uma URL salva, busca os dados da planilha imediatamente
  if (SHEETS_URL) {
    carregarDadosDoSheets();
  } else {
    renderTabela();
  }
});

function hoje() {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// CONFIGURAÇÃO GOOGLE SHEETS
// ============================================================
function toggleConfig() {
  const card = document.getElementById('config-card');
  card.classList.toggle('visible');
  if (card.classList.contains('visible') && SHEETS_URL) {
    document.getElementById('sheets-url').value = SHEETS_URL;
  }
}

async function carregarDadosDoSheets() {
  if (!SHEETS_URL) return;

  const dot   = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  
  dot.className   = 'sync-dot sending';
  label.textContent = 'Carregando planilha...';

  try {
    const resposta = await fetch(SHEETS_URL);
    const dadosPlanilha = await resposta.json();

    if (Array.isArray(dadosPlanilha)) {
      dados = dadosPlanilha;
      
      // Define dinamicamente o próximo ID incremental baseado no maior existente
      if (dados.length > 0) {
        const maiorId = Math.max(...dados.map(r => Number(r.id) || 0));
        nextId = maiorId + 1;
      } else {
        nextId = 1;
      }

      dot.className   = 'sync-dot online';
      label.textContent = 'Sheets conectado';
    } else {
      throw new Error("Formato de dados inválido recebido do Sheets.");
    }
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    dot.className   = 'sync-dot error';
    label.textContent = 'Erro de sincronização';
    mostrarToast('Não foi possível carregar os dados da planilha.', 'error');
  } finally {
    renderTabela(); // Atualiza a tela com o que foi buscado ou vazio
  }
}

function salvarConfig() {
  const url = document.getElementById('sheets-url').value.trim();
  if (!url || !url.startsWith('https://script.google.com')) {
    mostrarToast('URL inválida. Deve começar com https://script.google.com', 'error');
    return;
  }
  SHEETS_URL = url;
  localStorage.setItem('sheetsUrl', url);
  document.getElementById('config-card').classList.remove('visible');
  atualizarStatusConexao();
  mostrarToast('Google Sheets conectado!', 'success');

  carregarDadosDoSheets();
}

function atualizarStatusConexao() {
  const dot   = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  if (SHEETS_URL) {
    dot.className   = 'sync-dot online';
    label.textContent = 'Sheets conectado';
  } else {
    dot.className   = 'sync-dot';
    label.textContent = 'Modo local';
  }
}

// ============================================================
// ENVIO PARA O GOOGLE SHEETS
// ============================================================
async function enviarParaSheets(registro, acao) {
  if (!SHEETS_URL) return true;

  const dot   = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  dot.className   = 'sync-dot sending';
  label.textContent = 'Sincronizando...';

  try {
    // Criamos o objeto contendo a ação e os dados do formulário
    const payload = {
      acao: acao,
      id: registro.id,
      obra: registro.obra || '',
      material: registro.material || '',
      qtd: registro.qtd || 0,
      un: registro.un || '',
      resp: registro.resp || '',
      status: registro.status || '',
      data: registro.data || '',
      etapa: registro.etapa || '',
      obs: registro.obs || ''
    };

    // Enviamos via POST para evitar problemas de limite de caracteres na URL
    const resp = await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Evita o bloqueio de CORS do navegador
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // se chegar até aqui sem estourar erro no catch, a requisição foi enviada com sucesso!
    dot.className   = 'sync-dot online';
    label.textContent = 'Sheets conectado';
    return true;

  } catch(err) {
    console.error('Erro Sheets:', err);
    dot.className   = 'sync-dot error';
    label.textContent = 'Erro de conexão';
    mostrarToast('Salvo localmente. Erro ao sincronizar com Sheets.', 'error');
    return false;
  }
}

// ============================================================
// FILTRO E RENDERIZAÇÃO DA TABELA
// ============================================================
function filtrados() {
  const q  = document.getElementById('busca').value.toLowerCase();
  const st = document.getElementById('filtro').value;
  return dados.filter(r => {
    const textoOk = !q || [r.obra, r.material, r.resp].some(v => v.toLowerCase().includes(q));
    const statusOk = !st || r.status === st;
    return textoOk && statusOk;
  });
}

function badgeStatus(s) {
  const mapa = {
    'Concluído':    'badge-green',
    'Em andamento': 'badge-amber',
    'Pendente':     'badge-red',
    'Cancelado':    'badge-gray',
  };
  return `<span class="badge ${mapa[s] || 'badge-gray'}">${s}</span>`;
}

function renderTabela() {
  const lista = filtrados();
  const total = lista.length;
  const maxPag = Math.max(1, Math.ceil(total / POR_PAG));
  if (pagina > maxPag) pagina = maxPag;
  const fatia = lista.slice((pagina - 1) * POR_PAG, pagina * POR_PAG);

  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('empty');

  if (!fatia.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = fatia.map(r => `
      <tr>
        <td class="col-n" style="color:var(--gray-500);font-family:var(--font-mono);font-size:12px">${r.id}</td>
        <td class="col-obra" title="${r.obra}">${r.obra}</td>
        <td class="col-mat"  title="${r.material}">${r.material}</td>
        <td class="col-resp" title="${r.resp}">${r.resp}</td>
        <td class="col-qtd">${r.qtd} <span style="color:var(--gray-500);font-size:12px">${r.un}</span></td>
        <td class="col-st">${badgeStatus(r.status)}</td>
        <td class="col-dt" style="color:var(--gray-500);font-family:var(--font-mono);font-size:12px">${r.data || '—'}</td>
        <td class="col-ac">
          <div class="action-btns">
            <button class="btn-icon edit" onclick="abrirEdicao(${r.id})" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon del" onclick="abrirConfirm(${r.id})" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Paginação
  document.getElementById('pag-info').textContent =
    `${fatia.length} de ${total} registro${total !== 1 ? 's' : ''}`;

  const pbEl = document.getElementById('pag-btns');
  pbEl.innerHTML = '';
  for (let p = 1; p <= maxPag; p++) {
    const b = document.createElement('button');
    b.className = 'btn-page' + (p === pagina ? ' active' : '');
    b.textContent = p;
    b.onclick = (() => { const pp = p; return () => { pagina = pp; renderTabela(); }; })();
    pbEl.appendChild(b);
  }

  // Métricas
  document.getElementById('m-total').textContent = dados.length;
  document.getElementById('m-conc').textContent  = dados.filter(r => r.status === 'Concluído').length;
  document.getElementById('m-and').textContent   = dados.filter(r => r.status === 'Em andamento').length;
  document.getElementById('m-pend').textContent  = dados.filter(r => r.status === 'Pendente').length;
}

// ============================================================
// MODAL FORMULÁRIO
// ============================================================
function abrirModal(id) {
  editandoId = id || null;
  const r = id ? dados.find(x => x.id === id) : null;

  document.getElementById('modal-titulo').textContent = id ? 'Editar registro' : 'Novo registro';
  document.getElementById('f-obra').value     = r?.obra     || '';
  document.getElementById('f-material').value = r?.material || '';
  document.getElementById('f-qtd').value      = r?.qtd      || '';
  document.getElementById('f-un').value       = r?.un       || 'Placa';
  document.getElementById('f-resp').value     = r?.resp     || '';
  document.getElementById('f-status').value   = r?.status   || 'Em andamento';
  document.getElementById('f-data').value     = r?.data     || hoje();
  document.getElementById('f-etapa').value    = r?.etapa    || '';
  document.getElementById('f-obs').value      = r?.obs      || '';

  limparErros();
  document.getElementById('modal').style.display = 'flex';
  setTimeout(() => document.getElementById('f-obra').focus(), 100);
}

function abrirEdicao(id) { abrirModal(id); }

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
  editandoId = null;
}

function limparErros() {
  ['fw-obra', 'fw-material', 'fw-qtd', 'fw-resp'].forEach(id => {
    document.getElementById(id)?.classList.remove('has-err');
  });
  ['f-obra', 'f-material', 'f-qtd', 'f-resp'].forEach(id => {
    document.getElementById(id)?.classList.remove('invalid');
  });
}

function validar() {
  // Pega os valores diretamente do DOM no momento exato da validação
  const obra = document.getElementById('f-obra').value.trim();
  const material = document.getElementById('f-material').value;
  const qtd = document.getElementById('f-qtd').value;
  const resp = document.getElementById('f-resp').value.trim();

  // Inicializa os estados de erro como falso
  let obraInvalida = obra === "";
  let materialInvalido = material === "";
  let qtdInvalida = qtd === "" || isNaN(qtd) || Number(qtd) < 0;
  let respInvalida = resp === "";

  // Aplica ou remove as classes visuais baseando-se estritamente na condição acima
  document.getElementById('fw-obra')?.classList.toggle('has-err', obraInvalida);
  document.getElementById('f-obra')?.classList.toggle('invalid', obraInvalida);

  document.getElementById('fw-material')?.classList.toggle('has-err', materialInvalido);
  document.getElementById('f-material')?.classList.toggle('invalid', materialInvalido);

  document.getElementById('fw-qtd')?.classList.toggle('has-err', qtdInvalida);
  document.getElementById('f-qtd')?.classList.toggle('invalid', qtdInvalida);

  document.getElementById('fw-resp')?.classList.toggle('has-err', respInvalida);
  document.getElementById('f-resp')?.classList.toggle('invalid', respInvalida);

  // O formulário só será válido se NENHUM campo for inválido
  return !(obraInvalida || materialInvalido || qtdInvalida || respInvalida);
}

async function salvar() {
  // Limpa erros anteriores para garantir um estado limpo
  limparErros();

  // Valida os campos ANTES de mexer no botão ou iniciar o estado de salvamento
  if (!validar()) {
    mostrarToast('Por favor, preencha os campos obrigatórios.', 'error');
    return;
  }

  // Captura os dados IMEDIATAMENTE após a validação estar correta
  const registro = {
    obra:      document.getElementById('f-obra').value.trim(),
    material:  document.getElementById('f-material').value,
    qtd:       Number(document.getElementById('f-qtd').value),
    un:        document.getElementById('f-un').value,
    resp:      document.getElementById('f-resp').value.trim(),
    status:    document.getElementById('f-status').value,
    data:      document.getElementById('f-data').value,
    etapa:     document.getElementById('f-etapa').value,
    obs:       document.getElementById('f-obs').value.trim(),
  };

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true;
  const textoOriginalBotao = btn.innerHTML; // Guarda o ícone SVG original perfeitamente
  btn.innerHTML = '<div class="spinner"></div> Salvando...';

  // Envia o fluxo para o Sheets / Estado Local
  if (editandoId) {
    const i = dados.findIndex(x => x.id === editandoId);
    dados[i] = { ...dados[i], ...registro };

    await enviarParaSheets({ id: editandoId, ...registro }, 'atualizar');
    mostrarToast('Registro atualizado!', 'success');
  } else {
    registro.id = nextId++;
    dados.unshift(registro);
    pagina = 1;

    await enviarParaSheets(registro, 'inserir');
    mostrarToast('Registro adicionado à planilha!', 'success');
  }

  btn.disabled = false;
  btn.innerHTML = textoOriginalBotao;

  fecharModal();
  renderTabela();
}

// ============================================================
// CONFIRMAÇÃO DE EXCLUSÃO
// ============================================================
function abrirConfirm(id) {
  excluindoId = id;
  const r = dados.find(x => x.id === id);
  document.getElementById('confirm-body').innerHTML =
    `Tem certeza que deseja excluir o registro <strong>${r.obra}</strong>?<br><br>Esta ação não pode ser desfeita.`;
  document.getElementById('modal-del').style.display = 'flex';
}

function fecharConfirm() {
  document.getElementById('modal-del').style.display = 'none';
  excluindoId = null;
}

async function confirmarDelete() {
  const btn = document.getElementById('btn-del');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Excluindo...';

  await enviarParaSheets({ id: excluindoId }, 'excluir');

  dados = dados.filter(x => x.id !== excluindoId);
  fecharConfirm();
  renderTabela();
  mostrarToast('Registro excluído', 'success');

  btn.disabled = false;
  btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> Excluir';
}

// ============================================================
// TOAST
// ============================================================
function mostrarToast(msg, tipo) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'toast ' + (tipo || '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ============================================================
// FECHAR MODAL AO CLICAR FORA
// ============================================================
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});
document.getElementById('modal-del').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharConfirm();
});