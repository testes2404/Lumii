// --- semear.js ---
// Carrega dinamicamente Firebase compat se não estiver presente, inicializa e depois roda a lógica.

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDjys-U4aBy5SMXTasOp_TsfqziuqnEc9o",
  authDomain: "mini-genio-c204d.firebaseapp.com",
  projectId: "mini-genio-c204d",
  storageBucket: "mini-genio-c204d.appspot.com",
  messagingSenderId: "553494129644",
  appId: "1:553494129644:web:cc6f0de9d013392fc4eec9"
};

/**
 * Garante que um script seja carregado, retorna Promise que resolve quando pronto.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // já carregado
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error(`Falha ao carregar script ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureFirebase() {
  // Carrega os compat scripts se não existirem
  if (typeof firebase === 'undefined') {
    await loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
  }
  if (!firebase.firestore) {
    await loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js');
  }
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  return firebase.firestore();
}

async function initSemear() {
  // Inicializa Firebase
  let db;
  try {
    db = await ensureFirebase();
  } catch (err) {
    console.error("Erro carregando/inicializando Firebase:", err);
    return;
  }

  // Pega do localStorage os dados simplificados
  const companyEmail = localStorage.getItem('companyEmail') || 'empresa@desconhecido.com';
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('candidateEmail') || 'candidato@desconhecido.com';
  const vagaId = localStorage.getItem('vagaId') || 'vaga-desconhecida';

  // Gera ou reutiliza relatorioId
  let relatorioId = localStorage.getItem('relatorioId');
  if (!relatorioId) {
    relatorioId = 'rel_' + Math.random().toString(36).substring(2,10);
    localStorage.setItem('relatorioId', relatorioId);
  }

  if (!companyEmail || !userEmail || !vagaId) {
    console.error("Faltando dados obrigatórios no localStorage:", { companyEmail, userEmail, vagaId });
    return;
  }

  // Referência ao container
  const semearContent = document.getElementById('semearContent');
  if (!semearContent) {
    console.error("#semearContent não encontrado no DOM.");
    return;
  }

  // Injeta estrutura se ainda não houver
  semearContent.innerHTML = `
    <div class="glass-panel semear-grid">
      <div class="col-left">
        <div class="panel-section">
          <div class="section-header"><h2>Entrevista & Agendamento</h2></div>
          <div id="calendarioWrapper" class="glass-subpanel">
            <div class="calendario-header">
              <div id="mesAno" class="calendario-title"></div>
              <div class="nav-buttons">
                <button id="prevMonth" aria-label="Mês anterior">&lt;</button>
                <button id="nextMonth" aria-label="Próximo mês">&gt;</button>
              </div>
            </div>
            <div class="dias-semana">
              <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span>
            </div>
            <div id="calendarioGrid" class="calendario-dias"></div>
            <div id="eventForm" class="event-form hidden">
              <div class="form-row">
                <label>Título</label>
                <input type="text" id="eventoTitulo" placeholder="Entrevista com candidato" />
              </div>
              <div class="form-row">
                <label>Data / Hora</label>
                <input type="datetime-local" id="eventoDataHora" />
              </div>
              <div class="form-row">
                <label>Duração (min)</label>
                <input type="number" id="eventoDuracao" min="15" value="60" />
              </div>
              <div class="form-row">
                <label>Mensagem de engajamento</label>
                <textarea id="mensagemEngajamento" placeholder="Mensagem para o candidato..."></textarea>
              </div>
              <div class="form-row actions">
                <button id="salvarEventoBtn" class="primary">Salvar entrevista</button>
                <button id="cancelarEventoBtn" class="secondary">Cancelar</button>
              </div>
              <div id="conflitoAviso" class="conflict-warning hidden"></div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-header"><h2>Ações</h2></div>
          <div class="acoes-wrapper">
            <div class="acao-block">
              <button id="btnAprovarCandidato" class="btn-acao btn-aprovar" title="Aprovar candidato">✔️ Aprovar</button>
              <button id="btnRejeitarCandidato" class="btn-acao btn-rejeitar" title="Rejeitar candidato">✖️ Rejeitar</button>
            </div>
            <div id="statusAprovacao" class="status-badge">Status: Pendente</div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-header"><h2>Notificações</h2></div>
          <div id="notificacoesList" class="notificacoes-list"></div>
        </div>
      </div>

      <div class="col-right">
        <div class="panel-section">
          <div class="section-header"><h2>Vídeo / Transcrição</h2></div>
          <div id="jitsiWrapper" class="glass-subpanel jitsi-container">
            <div id="jitsiLoading">Carregando sala...</div>
          </div>
          <div id="transcricaoPanel" class="glass-subpanel transcricao-panel">
            <div class="transcricao-header">
              <h3>Transcrição</h3>
              <button id="baixarTranscricao" class="small-btn">Exportar</button>
            </div>
            <div id="transcricaoContent" class="transcricao-content">
              <div class="placeholder">Nenhuma transcrição ainda. Inicie a entrevista para capturar áudio.</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-header"><h2>Anotações Internas</h2></div>
          <div class="glass-subpanel">
            <label for="anotacoesRecrutador" class="label-small">Observações do recrutador</label>
            <textarea id="anotacoesRecrutador" placeholder="Escreva insights, impressões, decisões..."></textarea>
          </div>
        </div>
      </div>
    </div>
  `;

  // Estado
  let semearDocRef = null;
  let semearData = null;
  let currentMonth = new Date();
  let entrevistaSelecionada = null;
  let transcricaoAcumulada = '';

  // Helpers
  const toTimestamp = (date) => firebase.firestore.Timestamp.fromDate(date);
  const generateId = () => 'evt_' + Math.random().toString(36).substring(2,9);
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Document load/create
  async function loadOrCreateSemearDoc() {
    const query = db.collection('semear')
      .where('relatorioId','==',relatorioId)
      .where('userEmail','==',userEmail)
      .where('vagaId','==',vagaId)
      .where('companyEmail','==',companyEmail)
      .limit(1);
    const snap = await query.get();
    if (!snap.empty) {
      semearDocRef = snap.docs[0].ref;
      semearData = snap.docs[0].data();
    } else {
      const doc = {
        relatorioId,
        userEmail,
        vagaId,
        companyEmail,
        entrevistas: [],
        aprovacao: { status:'pendente', data:null, responsavel:null, motivo:null },
        notificacoes: [],
        auditTrail: [],
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      };
      const added = await db.collection('semear').add(doc);
      semearDocRef = added;
      semearData = { ...doc };
    }
    renderTudo();
  }

  // Patch partial
  async function patchSemear(updates) {
    if (!semearDocRef) return;
    updates.atualizadoEm = firebase.firestore.FieldValue.serverTimestamp();
    await semearDocRef.set(updates, { merge: true });
    const fresh = await semearDocRef.get();
    semearData = fresh.data();
    renderTudo();
  }

  // Notificações e audit
  async function pushNotificacao(tipo,mensagem) {
    const nova = { tipo, mensagem, visto:false, criadoEm: firebase.firestore.FieldValue.serverTimestamp() };
    const existentes = semearData.notificacoes || [];
    existentes.unshift(nova);
    await patchSemear({ notificacoes: existentes });
  }
  async function logAudit(action, extra={}) {
    const entrada = { action, timestamp: firebase.firestore.FieldValue.serverTimestamp(), actor: companyEmail, ...extra };
    const trail = semearData.auditTrail || [];
    trail.unshift(entrada);
    await patchSemear({ auditTrail: trail });
  }

  // Render UI helpers
  function renderAprovacaoUI() {
    const statusEl = document.getElementById('statusAprovacao');
    const apro = semearData.aprovacao || {};
    let texto = `Status: ${apro.status || 'pendente'}`;
    if (apro.responsavel) texto += ` por ${apro.responsavel}`;
    if (apro.motivo) texto += ` (${apro.motivo})`;
    statusEl.textContent = texto;
    statusEl.classList.remove('aprovado','rejeitado','pendente');
    statusEl.classList.add(apro.status || 'pendente');
  }
  function renderNotificacoes() {
    const container = document.getElementById('notificacoesList');
    container.innerHTML = '';
    const notas = semearData.notificacoes || [];
    if (!notas.length) {
      container.innerHTML = `<div class="nota vazia">Nenhuma notificação.</div>`;
      return;
    }
    notas.forEach((n, idx) => {
      const div = document.createElement('div');
      div.className = 'notificacao-item';
      if (!n.visto) div.classList.add('nao-visto');
      const dateStr = n.criadoEm && n.criadoEm.toDate ? n.criadoEm.toDate().toLocaleString('pt-BR') : '';
      div.innerHTML = `
        <div class="texto">
          <div class="mensagem">${escapeHtml(n.mensagem)}</div>
          <div class="meta">${n.tipo.replace('_',' ')} • ${dateStr}</div>
        </div>
        <div class="acoes">
          <button class="marcar-visto" data-idx="${idx}">${n.visto ? '✔' : 'Marcar como lida'}</button>
        </div>
      `;
      container.appendChild(div);
    });
    container.querySelectorAll('.marcar-visto').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const i = parseInt(e.currentTarget.dataset.idx,10);
        semearData.notificacoes[i].visto = true;
        await patchSemear({ notificacoes: semearData.notificacoes });
      });
    });
  }

  function renderCalendario() {
    const mesAnoEl = document.getElementById('mesAno');
    const grid = document.getElementById('calendarioGrid');
    grid.innerHTML = '';
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    mesAnoEl.textContent = new Intl.DateTimeFormat('pt-BR',{ month:'long', year:'numeric' }).format(currentMonth);

    const primeiroDia = new Date(ano,mes,1).getDay();
    const diasNoMes = new Date(ano,mes+1,0).getDate();

    for (let i=0;i<primeiroDia;i++){
      const blank = document.createElement('div');
      blank.className='dia outro-mes';
      grid.appendChild(blank);
    }
    for (let d=1; d<=diasNoMes; d++){
      const diaEl = document.createElement('div');
      diaEl.className='dia';
      diaEl.textContent=d;
      const dataAtual = new Date(ano,mes,d);
      const hoje = new Date();
      if (
        dataAtual.getFullYear()===hoje.getFullYear() &&
        dataAtual.getMonth()===hoje.getMonth() &&
        dataAtual.getDate()===hoje.getDate()
      ) diaEl.classList.add('hoje');

      const entrevistas = semearData.entrevistas || [];
      const eventosNoDia = entrevistas.filter(ev => {
        const inicio = ev.dataInicio?.toDate ? ev.dataInicio.toDate() : null;
        if (!inicio) return false;
        return (
          inicio.getFullYear()===dataAtual.getFullYear() &&
          inicio.getMonth()===dataAtual.getMonth() &&
          inicio.getDate()===dataAtual.getDate()
        );
      });
      if (eventosNoDia.length) {
        const badge = document.createElement('div');
        badge.className='dot';
        diaEl.appendChild(badge);
      }

      diaEl.addEventListener('click', () => abrirFormularioEvento(dataAtual,eventosNoDia));
      grid.appendChild(diaEl);
    }
  }

  function abrirFormularioEvento(dataBase,eventosExistentes=[]){
    const form = document.getElementById('eventForm');
    form.classList.remove('hidden');
    const tituloInput = document.getElementById('eventoTitulo');
    const dataHoraInput = document.getElementById('eventoDataHora');
    const duracaoInput = document.getElementById('eventoDuracao');
    const mensagemEl = document.getElementById('mensagemEngajamento');
    const conflitoAviso = document.getElementById('conflitoAviso');

    const padraoDate = new Date(dataBase.getFullYear(),dataBase.getMonth(),dataBase.getDate(),14,0,0);
    tituloInput.value = `Entrevista com ${userEmail}`;
    dataHoraInput.value = toDatetimeLocal(padraoDate);
    duracaoInput.value = 60;
    mensagemEl.value = `Olá ${userEmail},\n\nGostaríamos de agendar sua entrevista para o dia ${padraoDate.toLocaleDateString('pt-BR')} às 14:00.`;

    conflitoAviso.classList.add('hidden');
    entrevistaSelecionada = null;

    if (eventosExistentes.length) {
      const ev = eventosExistentes[0];
      entrevistaSelecionada = ev;
      tituloInput.value = ev.titulo || `Entrevista com ${userEmail}`;
      const dt = ev.dataInicio?.toDate ? ev.dataInicio.toDate() : new Date();
      dataHoraInput.value = toDatetimeLocal(dt);
      duracaoInput.value = ev.duracaoMinutos || 60;
      mensagemEl.value = ev.mensagemEngajamento || mensagemEl.value;
    }

    function checarConflito(){
      const selecionado = new Date(dataHoraInput.value);
      const entrevistas = semearData.entrevistas || [];
      const conflito = entrevistas.find(ev => {
        if (entrevistaSelecionada && ev.eventoId === entrevistaSelecionada.eventoId) return false;
        const inicio = ev.dataInicio?.toDate ? ev.dataInicio.toDate() : new Date();
        const fim = new Date(inicio.getTime() + ((ev.duracaoMinutos||60)*60000));
        const novoInicio = selecionado;
        const novoFim = new Date(novoInicio.getTime() + ((parseInt(duracaoInput.value,10)||60)*60000));
        return (novoInicio < fim && novoFim > inicio);
      });
      if (conflito) {
        conflitoAviso.textContent='Conflito de horário com outro evento. Você pode sobrescrever ou ajustar.';
        conflitoAviso.classList.remove('hidden');
      } else {
        conflitoAviso.classList.add('hidden');
      }
    }

    dataHoraInput.addEventListener('input', checarConflito);
    duracaoInput.addEventListener('input', checarConflito);

    document.getElementById('salvarEventoBtn').onclick = async () => {
      const titulo = tituloInput.value.trim() || `Entrevista com ${userEmail}`;
      const dtInicio = new Date(dataHoraInput.value);
      const duracaoMin = parseInt(duracaoInput.value,10) || 60;
      const mensagemEngajamento = mensagemEl.value;

      const novoEvento = {
        eventoId: entrevistaSelecionada ? entrevistaSelecionada.eventoId : generateId(),
        titulo,
        dataInicio: toTimestamp(dtInicio),
        duracaoMinutos: duracaoMin,
        local: `Jitsi: ${getRoomName()}`,
        status: 'agendado',
        anotacoesRecrutador: document.getElementById('anotacoesRecrutador')?.value || '',
        mensagemEngajamento,
        transcricao: semearData.entrevistas?.find(e => e.eventoId === (entrevistaSelecionada?.eventoId||''))?.transcricao || null,
        jitsiRoomName: getRoomName(),
        criadoEm: entrevistaSelecionada ? entrevistaSelecionada.criadoEm : firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      };

      let entrevistas = semearData.entrevistas || [];
      const idx = entrevistas.findIndex(e => e.eventoId === novoEvento.eventoId);
      if (idx !== -1) entrevistas[idx] = novoEvento;
      else entrevistas.push(novoEvento);

      await patchSemear({ entrevistas });
      await pushNotificacao('entrevista_agendada', `Entrevista agendada para ${dtInicio.toLocaleString('pt-BR')} (${duracaoMin} min).`);
      await logAudit('entrevista_agendada',{ eventoId: novoEvento.eventoId });
      fecharFormulario();
    };

    document.getElementById('cancelarEventoBtn').onclick = () => fecharFormulario();
  }

  function fecharFormulario(){
    document.getElementById('eventForm').classList.add('hidden');
    entrevistaSelecionada = null;
  }

  function toDatetimeLocal(date){
    const pad = n => n.toString().padStart(2,'0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // Aprovar / rejeitar
  document.getElementById('btnAprovarCandidato').addEventListener('click', async () => {
    await patchSemear({
      aprovacao: {
        status:'aprovado',
        motivo:null,
        responsavel:companyEmail,
        data: firebase.firestore.FieldValue.serverTimestamp()
      }
    });
    await pushNotificacao('aprovação','Candidato aprovado.');
    await logAudit('aprovar_candidato');
  });
  document.getElementById('btnRejeitarCandidato').addEventListener('click', async () => {
    const motivo = prompt('Motivo da rejeição (opcional):')||'';
    await patchSemear({
      aprovacao: {
        status:'rejeitado',
        motivo,
        responsavel:companyEmail,
        data: firebase.firestore.FieldValue.serverTimestamp()
      }
    });
    await pushNotificacao('rejeição', `Candidato rejeitado. Motivo: ${motivo}`);
    await logAudit('rejeitar_candidato',{ motivo });
  });

  // Jitsi + transcrição simulada
  let jitsiApi = null;
  function getRoomName(){ return `Semear_${relatorioId}`; }

  function initJitsi(){
    const domain='meet.jit.si';
    const options = {
      roomName: getRoomName(),
      parentNode: document.getElementById('jitsiWrapper'),
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        MOBILE_APP_PROMO: false
      },
      userInfo: { displayName: companyEmail }
    };
    if (typeof JitsiMeetExternalAPI !== 'undefined'){
      jitsiApi = new JitsiMeetExternalAPI(domain, options);
      setupJitsiListeners();
    } else {
      const script = document.createElement('script');
      script.src='https://meet.jit.si/external_api.js';
      script.onload = () => {
        jitsiApi = new JitsiMeetExternalAPI(domain, options);
        setupJitsiListeners();
      };
      document.head.appendChild(script);
    }
  }

  function setupJitsiListeners(){
    jitsiApi.addEventListener('videoConferenceJoined', async () => {
      document.getElementById('jitsiLoading')?.remove();
      await pushNotificacao('jitsi_conectado','Sala de vídeo conectada.');
      await logAudit('jitsi_joined');
      startTranscricaoSimulada();
    });
    jitsiApi.addEventListener('videoConferenceLeft', async () => {
      await pushNotificacao('jitsi_encerrado','Reunião finalizada. Transcrição disponível em instantes.');
      await logAudit('jitsi_left');
      finalizarTranscricaoSimulada();
    });
  }

  function startTranscricaoSimulada(){
    const content = document.getElementById('transcricaoContent');
    content.innerHTML = '';
    transcricaoAcumulada = '';
    const p = document.createElement('div');
    p.className = 'line';
    p.textContent = 'Transcrição iniciada...';
    content.appendChild(p);
    const interval = setInterval(()=>{
      const novoTexto = ` [${new Date().toLocaleTimeString('pt-BR')}] Candidato: respondeu à pergunta com informação relevante.`;
      transcricaoAcumulada += novoTexto;
      const linha = document.createElement('div');
      linha.className = 'line';
      linha.textContent = novoTexto;
      content.appendChild(linha);
      content.scrollTop = content.scrollHeight;
    },5000);
    content.dataset.simInterval = interval;
  }

  function finalizarTranscricaoSimulada(){
    const content = document.getElementById('transcricaoContent');
    const interval = content.dataset.simInterval;
    if (interval) clearInterval(interval);
    const entrevistas = semearData.entrevistas || [];
    if (!entrevistas.length) return;
    const ultima = entrevistas[0];
    ultima.transcricao = {
      texto: transcricaoAcumulada,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    patchSemear({ entrevistas });
    pushNotificacao('transcricao_disponivel','Transcrição da reunião foi salva.');
  }

  document.getElementById('baixarTranscricao').addEventListener('click', () => {
    if (!transcricaoAcumulada) return alert('Nenhuma transcrição disponível ainda.');
    const blob = new Blob([transcricaoAcumulada], { type:'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcricao_${relatorioId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Render geral
  function renderTudo(){
    renderCalendario();
    renderAprovacaoUI();
    renderNotificacoes();
  }

  // Navegação de mês
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendario();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendario();
  });

  // Inicia
  await loadOrCreateSemearDoc();
  initJitsi();
}

// Expor global
window.initSemear = initSemear;

// Auto start se quiser
document.addEventListener('DOMContentLoaded', () => {
  initSemear();
});
 