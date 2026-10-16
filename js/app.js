/* =====================================================================
   APP — roteamento, eventos e interações
   ===================================================================== */
const app = document.getElementById('app');
const posPersonagens = {};   // última posição de cada personagem (para animar a caminhada)
let loginMsg = null;

/* ---------- Roteamento ---------- */
function rota() {
  let h = location.hash.replace(/^#/, '') || '/';
  if (!session.user) {
    const m = h.match(/^\/login\/?(\w+)?/);
    app.innerHTML = viewLogin(m && m[1] ? m[1] : 'entrar', loginMsg); loginMsg = null; window.scrollTo(0, 0); return;
  }
  ctx.unit = null; ctx.base = '';
  // contexto de unidade para a franqueadora: #/u/:id/...
  const mu = h.match(/^\/u\/([^/]+)(\/.*)?$/);
  if (mu && isFranqueadora()) { ctx.unit = getUnidade(mu[1]); ctx.base = '/u/' + mu[1]; h = mu[2] || '/painel'; if (!ctx.unit) { location.hash = '#/franqueadora'; return; } }
  else if (isFranqueado()) { ctx.unit = unidadeDoUsuario(session.user); }

  if (h === '/' || h === '') { location.hash = isFranqueado() ? '#/painel' : '#/franqueadora'; return; }
  if (h.startsWith('/login')) { location.hash = '#/'; return; }

  let html, titulo = '';
  const seg = h.split('/').filter(Boolean);
  const precisaUnidade = ['painel', 'jornada', 'frente', 'treinamento', 'abertura', 'documentos', 'timeline', 'relatorio'].includes(seg[0]);
  if (precisaUnidade && !ctx.unit) { html = vazio('Nenhuma unidade vinculada ao seu usuário. Fale com a franqueadora.', '🏪'); }
  else switch (seg[0]) {
    case 'painel':      titulo = 'Visão geral'; html = viewPainel(ctx.unit); break;
    case 'jornada':     titulo = 'Minha jornada'; html = viewJornada(ctx.unit); break;
    case 'frente':      titulo = (getFrente(seg[1]) || {}).nome || 'Frente'; html = viewFrente(ctx.unit, seg[1]); break;
    case 'treinamento': titulo = 'Treinamento'; html = viewTreinamento(ctx.unit); break;
    case 'abertura':    titulo = 'Abertura e inauguração'; html = viewAbertura(ctx.unit); break;
    case 'documentos':  titulo = 'Documentos'; html = viewDocumentos(ctx.unit); break;
    case 'timeline':    titulo = 'Linha do tempo'; html = viewTimeline(ctx.unit); break;
    case 'relatorio':   titulo = 'Relatório'; html = isFranqueadora() ? viewRelatorio(ctx.unit) : vazio('Acesso restrito.'); break;
    case 'franqueadora': titulo = 'Painel central'; html = isFranqueadora() ? viewFranqueadora() : vazio('Acesso restrito.'); break;
    case 'validacoes':  titulo = 'Validações'; html = isFranqueadora() ? viewValidacoes() : vazio('Acesso restrito.'); break;
    case 'admin':       titulo = 'Administração'; html = isAdmin() ? viewAdmin(seg[1] || 'unidades') : vazio('Acesso restrito ao administrador.', '🔒'); break;
    case 'ajuda':       titulo = 'Ajuda'; html = viewAjuda(); break;
    default:            html = vazio('Página não encontrada.', '🧭');
  }
  app.innerHTML = layout(html, { titulo });
  animarPersonagens();
  // rolar até a âncora de tarefa, se houver (#tarefa-xxx vem no final do hash)
  const anc = location.hash.match(/#tarefa-([\w-]+)$/);
  if (anc) { const el = document.getElementById('tarefa-' + anc[1]); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ring-2', 'ring-brand-400'); } }
  else window.scrollTo(0, 0);
}
function rerender() { saveDB(); rota(); }

/* ---------- Animação dos personagens na trilha ---------- */
function animarPersonagens() {
  document.querySelectorAll('.track-char').forEach(el => {
    const key = (ctx.unit ? ctx.unit.id : '') + ':' + el.dataset.char; const alvo = parseFloat(el.dataset.pos); const anterior = posPersonagens[key];
    if (anterior !== undefined && anterior !== alvo) {
      el.style.transition = 'none'; el.style.left = anterior + '%';
      const svg = el.querySelector('svg'); if (svg) { svg.classList.remove('idle'); svg.classList.add('walking'); }
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = ''; el.style.left = alvo + '%'; }));
      el.addEventListener('transitionend', () => { if (svg) { svg.classList.remove('walking'); svg.classList.add('idle'); } }, { once: true });
    }
    posPersonagens[key] = alvo;
  });
}

/* ---------- Modal, toast e confete ---------- */
function abrirModal(html) { document.getElementById('modal-root').innerHTML = `<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 fade-in" data-action="fechar-modal-bg"><div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onclick="event.stopPropagation()">${html}</div></div>`; }
function fecharModal() { document.getElementById('modal-root').innerHTML = ''; }
function toast(msg, tipo = 'ok') {
  const el = document.createElement('div');
  el.className = `toast px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${tipo === 'erro' ? 'bg-rose-600' : tipo === 'info' ? 'bg-slate-800' : 'bg-emerald-600'}`;
  el.textContent = msg; document.getElementById('toast-root').appendChild(el); setTimeout(() => el.remove(), 3500);
}
function confete(duracao = 3500) {
  const c = document.getElementById('confetti'); const g = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; c.classList.remove('hidden');
  const cores = ['#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f43f5e'];
  const ps = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 4, s: 6 + Math.random() * 8, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .2, cor: cores[Math.floor(Math.random() * cores.length)] }));
  const ini = Date.now();
  (function frame() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.cor; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); if (p.y > c.height) { p.y = -20; p.x = Math.random() * c.width; } });
    if (Date.now() - ini < duracao) requestAnimationFrame(frame); else { g.clearRect(0, 0, c.width, c.height); c.classList.add('hidden'); }
  })();
}
function baixar(nome, conteudo) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' })); a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

/* ---------- Ações (data-action) ---------- */
function unidadeDaAcao(d) { return d.uid ? getUnidade(d.uid) : ctx.unit; }
const acoes = {
  'logout': () => sair(),
  'toggle-menu': () => { document.getElementById('sidebar').classList.toggle('-translate-x-full'); document.getElementById('sidebar-backdrop').classList.toggle('hidden'); },
  'toggle-notifs': () => document.getElementById('notif-panel').classList.toggle('hidden'),
  'read-notifs': () => { const p = papelAtual(); DB.unidades.forEach(u => u.notificacoes.forEach(n => { if (n.para === p) n.lida = true; })); rerender(); },
  'open-notif': (d) => { const u = getUnidade(d.unit); const n = u && u.notificacoes.find(x => x.id === d.id); if (n) { n.lida = true; saveDB(); } },
  'fechar-modal': () => fecharModal(),
  'fechar-modal-bg': (d, el, e) => { if (e.target === el) fecharModal(); },
  'reset-demo': () => abrirModal(`<div class="text-lg font-bold">Restaurar demonstração?</div><p class="text-sm text-slate-600 mt-2">Todos os dados salvos neste navegador serão substituídos pelos dados de exemplo.</p><div class="flex justify-end gap-2 mt-5">${btnSec('Cancelar', 'data-action="fechar-modal"')}${btn('Restaurar', 'data-action="reset-demo-ok"', 'bg-rose-600 hover:bg-rose-700 text-white')}</div>`),
  'reset-demo-ok': () => { fecharModal(); resetDemo(); toast('Dados de demonstração restaurados.', 'info'); rota(); },
  'confete': () => confete(),

  'concluir': (d) => {
    const u = unidadeDaAcao(d); const r = concluirTarefa(u, d.fid, d.tid);
    const f = getFrente(d.fid);
    toast(r === 'em_validacao' ? 'Tarefa enviada para validação da franqueadora.' : `Tarefa concluída! ${f.emoji} avançou na jornada.`);
    if (progressoFrente(u, d.fid).completa) { confete(2500); }
    rerender();
  },
  'aprovar': (d) => { const u = unidadeDaAcao(d); aprovarTarefa(u, d.fid, d.tid); toast('Entrega aprovada.'); if (progressoFrente(u, d.fid).completa) confete(2500); rerender(); },
  'devolver': (d) => abrirModal(`<div class="text-lg font-bold">Devolver para ajuste</div><p class="text-sm text-slate-600 mt-1">Explique ao franqueado o que precisa ser corrigido.</p>
    <form data-form="devolver" data-uid="${d.uid || ''}" data-fid="${d.fid}" data-tid="${d.tid}" class="mt-4 space-y-3"><textarea name="motivo" required rows="3" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-brand-500" placeholder="Motivo da devolução"></textarea><div class="flex justify-end gap-2">${btnSec('Cancelar', 'data-action="fechar-modal"')}<button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white">Devolver</button></div></form>`),
  'reabrir': (d) => { reabrirTarefa(unidadeDaAcao(d), d.fid, d.tid); toast('Tarefa reaberta.', 'info'); rerender(); },
  'remover-anexo': (d) => { const st = taskState(ctx.unit, d.fid, d.tid); st.anexos = st.anexos.filter(a => a.id !== d.id); setTaskState(ctx.unit, d.fid, d.tid, { anexos: st.anexos }); rerender(); },
  'confirmar-cof': () => abrirModal(`<div class="text-lg font-bold">Registrar reunião da COF</div><p class="text-sm text-slate-600 mt-1">Ao registrar, as seis frentes são liberadas e os prazos passam a contar a partir desta data.</p><form data-form="cof" class="mt-4 space-y-3"><div>${label('Data da reunião')}${input('data', `type="date" value="${todayISO()}" required`)}</div><div class="flex justify-end gap-2">${btnSec('Cancelar', 'data-action="fechar-modal"')}<button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white">Registrar</button></div></form>`),
  'toggle-modulo': (d, el) => { const u = ctx.unit; u.treinamento.modulos[d.mid] = el.checked; const m = DB.modulos.find(x => x.id === d.mid); registrar(u, `${el.checked ? 'Concluiu' : 'Reabriu'} o módulo "${m.titulo}".`, el.checked ? 'concluido' : 'info'); rerender(); },
  'confirmar-presenca': () => { const u = ctx.unit; u.treinamento.presenca = true; u.treinamento.concluidoEm = new Date().toISOString(); registrar(u, '🎓 Presença confirmada. Treinamento concluído — equipe pronta!', 'marco'); notificar(u, 'franqueadora', `${u.nome} concluiu o treinamento. Faça a validação final.`, 'abertura'); toast('Treinamento concluído! 🎓'); confete(); rerender(); },
  'validacao-final': () => { const u = ctx.unit; u.abertura.validacaoFinal = true; u.abertura.validacaoFinalEm = new Date().toISOString(); registrar(u, '✅ Validação final do consultor realizada. Loja liberada para inaugurar!', 'marco'); notificar(u, 'franqueado', 'A validação final foi concluída. Defina a data da Festa de Inauguração! 🎉', 'abertura'); toast('Validação final registrada.'); confete(); rerender(); },
  'confirmar-inauguracao': () => { const u = ctx.unit; u.inauguracao.concluida = true; u.inauguracao.concluidaEm = new Date().toISOString(); registrar(u, '🎉 Festa de Inauguração realizada! Jornada de implantação concluída.', 'marco'); notificar(u, 'franqueadora', `${u.nome} foi inaugurada! 🎉`, 'abertura'); notificar(u, 'franqueado', 'Parabéns! A jornada de implantação foi concluída. 🎉', 'abertura'); confete(6000); rerender(); },
  'cobrar': (d) => { const u = getUnidade(d.uid); const p = proximaAcao(u); notificar(u, 'franqueado', `Lembrete da franqueadora: "${p.texto}" aguarda sua ação.`, p.rota); registrar(u, `Cobrou a pendência "${p.texto}".`, 'cobranca'); toast(`Lembrete enviado para ${u.nome}.`); rerender(); },
  'exportar-geral': () => baixar(`implantacao-franquias-${todayISO()}.json`, JSON.stringify(DB, null, 2)),
  'exportar-unidade': (d) => { const u = getUnidade(d.uid); baixar(`${u.id}-${todayISO()}.json`, JSON.stringify(u, null, 2)); },

  'admin-remover-unidade': (d) => { const u = getUnidade(d.id); abrirModal(`<div class="text-lg font-bold">Excluir ${esc(u.nome)}?</div><p class="text-sm text-slate-600 mt-2">Todo o histórico desta unidade será perdido.</p><div class="flex justify-end gap-2 mt-5">${btnSec('Cancelar', 'data-action="fechar-modal"')}${btn('Excluir', `data-action="admin-remover-unidade-ok" data-id="${u.id}"`, 'bg-rose-600 hover:bg-rose-700 text-white')}</div>`); },
  'admin-remover-unidade-ok': (d) => { DB.unidades = DB.unidades.filter(u => u.id !== d.id); DB.users.forEach(u => { if (u.unidadeId === d.id) u.unidadeId = null; }); fecharModal(); toast('Unidade excluída.', 'info'); rerender(); },
  'admin-remover-usuario': (d) => { DB.users = DB.users.filter(u => u.id !== d.id); toast('Usuário excluído.', 'info'); rerender(); },
  'admin-remover-tarefa': (d) => { const f = getFrente(d.fid); f.tarefas = f.tarefas.filter(t => t.id !== d.tid); toast('Tarefa removida do checklist.', 'info'); rerender(); },
  'admin-remover-modulo': (d) => { DB.modulos = DB.modulos.filter(m => m.id !== d.mid); rerender(); },
};

/* ---------- Formulários (data-form) ---------- */
const forms = {
  'login': (v) => { const r = entrar(v.email, v.senha); if (r.erro) { loginMsg = { tipo: 'erro', texto: r.erro }; rota(); } else { location.hash = '#/'; rota(); toast(`Bem-vindo(a), ${session.user.nome.split(' ')[0]}!`); } },
  'primeiro-acesso': (v) => {
    const u = DB.users.find(x => x.email.toLowerCase() === v.email.trim().toLowerCase());
    if (!u || u.senha || !u.convite || u.convite.toUpperCase() !== v.convite.trim().toUpperCase()) { loginMsg = { tipo: 'erro', texto: 'E-mail ou código de convite inválido.' }; location.hash = '#/login/primeiro'; rota(); return; }
    u.senha = v.senha; u.convite = null; saveDB(); loginMsg = { tipo: 'ok', texto: 'Acesso ativado! Entre com seu e-mail e a nova senha.' }; location.hash = '#/login/entrar'; rota();
  },
  'recuperar': (v) => { loginMsg = { tipo: 'ok', texto: `Se ${v.email} estiver cadastrado, um link de redefinição foi enviado (simulado neste protótipo).` }; location.hash = '#/login/entrar'; rota(); },
  'comentar': (v, f) => { const st = setTaskState(ctx.unit, f.dataset.fid, f.dataset.tid, {}); st.comentarios.push({ id: uid('c'), autor: session.user.nome, perfil: session.user.perfil, data: new Date().toISOString(), texto: v.texto }); const t = getFrente(f.dataset.fid).tarefas.find(x => x.id === f.dataset.tid); registrar(ctx.unit, `Comentou em "${t.titulo}": ${v.texto}`, 'comentario'); notificar(ctx.unit, isFranqueado() ? 'franqueadora' : 'franqueado', `${session.user.nome} comentou em "${t.titulo}".`, 'frente/' + f.dataset.fid); rerender(); },
  'devolver': (v, f) => { const u = f.dataset.uid ? getUnidade(f.dataset.uid) : ctx.unit; devolverTarefa(u, f.dataset.fid, f.dataset.tid, v.motivo); fecharModal(); toast('Entrega devolvida para ajuste.', 'info'); rerender(); },
  'cof': (v) => { const u = ctx.unit; u.cofEm = v.data; registrar(u, 'Reunião da COF realizada. Frentes de implantação liberadas.', 'marco'); notificar(u, 'franqueado', 'A COF foi realizada. Suas seis frentes de implantação estão liberadas! 🚀', 'jornada'); fecharModal(); toast('COF registrada. Frentes liberadas!'); confete(2500); rerender(); },
  'agenda': (v) => { const u = ctx.unit; u.treinamento.agenda = { data: v.data, local: v.local, participantes: v.participantes, instrutor: v.instrutor }; registrar(u, `Agendou o treinamento para ${fmtDate(v.data)} em ${v.local}.`, 'info'); notificar(u, 'franqueado', `Treinamento agendado para ${fmtDate(v.data)} · ${v.local}.`, 'treinamento'); toast('Agenda salva.'); rerender(); },
  'inauguracao': (v) => { const u = ctx.unit; u.inauguracao.data = v.data; registrar(u, `Definiu a data da Festa de Inauguração: ${fmtDate(v.data)}.`, 'info'); notificar(u, isFranqueado() ? 'franqueadora' : 'franqueado', `Festa de Inauguração marcada para ${fmtDate(v.data)} 🎉`, 'abertura'); toast('Data da festa salva.'); rerender(); },

  'admin-unidade': (v) => {
    const uidU = uid('un'); const fid = uid('u');
    DB.users.push({ id: fid, nome: v.fnome, email: v.femail, senha: null, perfil: 'franqueado', unidadeId: uidU, convite: v.convite.toUpperCase() });
    DB.unidades.push({ id: uidU, nome: v.nome, cidade: v.cidade, franqueadoId: fid, contratoEm: v.contratoEm, cofEm: null, tarefas: {}, timeline: [{ id: uid('ev'), data: new Date().toISOString(), usuario: session.user.nome, perfil: 'admin', texto: 'Contrato de franquia assinado. Unidade criada.', tipo: 'marco' }], notificacoes: [], treinamento: { agenda: null, modulos: {}, presenca: false, concluidoEm: null }, abertura: { validacaoFinal: false, validacaoFinalEm: null }, inauguracao: { data: null, concluida: false, concluidaEm: null } });
    toast(`Unidade criada. Convite ${v.convite.toUpperCase()} enviado para ${v.femail}.`); rerender();
  },
  'admin-usuario': (v) => { if (DB.users.some(u => u.email.toLowerCase() === v.email.toLowerCase())) { toast('Já existe um usuário com este e-mail.', 'erro'); return; } DB.users.push({ id: uid('u'), nome: v.nome, email: v.email, senha: v.senha, perfil: v.perfil, unidadeId: v.perfil === 'franqueado' ? (v.unidadeId || null) : null }); toast('Usuário cadastrado.'); rerender(); },
  'admin-tarefa': (v, f) => { const t = getFrente(f.dataset.fid).tarefas.find(x => x.id === f.dataset.tid); Object.assign(t, { titulo: v.titulo, prazoDias: +v.prazoDias || 0, resp: v.resp, validacao: !!v.validacao }); toast('Tarefa atualizada.'); rerender(); },
  'admin-nova-tarefa': (v, f) => { getFrente(f.dataset.fid).tarefas.push({ id: uid('t'), titulo: v.titulo, prazoDias: +v.prazoDias || 0, resp: v.resp, validacao: !!v.validacao, instrucoes: '' }); toast('Tarefa adicionada a todas as unidades.'); rerender(); },
  'admin-modulo': (v, f) => { const m = DB.modulos.find(x => x.id === f.dataset.mid); m.titulo = v.titulo; m.carga = v.carga; toast('Módulo atualizado.'); rerender(); },
  'admin-novo-modulo': (v) => { DB.modulos.push({ id: uid('m'), titulo: v.titulo, carga: v.carga }); rerender(); },
  'admin-config': (v) => { DB.config.marca = v.marca; toast('Configurações salvas.'); rerender(); },
};

/* ---------- Eventos globais ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]'); if (!el) return;
  if (el.tagName === 'INPUT' && el.type === 'checkbox') return; // checkboxes usam o evento change
  const fn = acoes[el.dataset.action]; if (!fn) return;
  if (el.tagName !== 'A') e.preventDefault();
  fn(el.dataset, el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('input[type=checkbox][data-action]')) { acoes[el.dataset.action](el.dataset, el, e); return; }
  if (el.dataset.file) {
    const [fid, tid] = el.dataset.file.split('|'); const st = setTaskState(ctx.unit, fid, tid, {}); const t = getFrente(fid).tarefas.find(x => x.id === tid);
    Array.from(el.files).forEach(file => st.anexos.push({ id: uid('ax'), nome: file.name, tamanho: file.size, data: new Date().toISOString(), por: session.user.nome }));
    registrar(ctx.unit, `Anexou ${el.files.length} arquivo(s) em "${t.titulo}".`, 'anexo'); toast('Arquivo(s) anexado(s).'); rerender(); return;
  }
  if (el.dataset.filter) { filtros[el.dataset.filter] = el.value; rota(); const n = document.querySelector(`[data-filter="${el.dataset.filter}"]`); if (n && n.tagName === 'INPUT') { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
});
document.addEventListener('input', (e) => { const el = e.target; if (el.dataset.filter === 'busca') { filtros.busca = el.value; const tbl = document.querySelector('[data-filter="busca"]'); clearTimeout(window.__fb); window.__fb = setTimeout(() => { rota(); const n = document.querySelector('[data-filter="busca"]'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); } });
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  const v = {}; new FormData(f).forEach((val, k) => v[k] = typeof val === 'string' ? val.trim() : val);
  const fn = forms[f.dataset.form]; if (fn) fn(v, f);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { fecharModal(); const p = document.getElementById('notif-panel'); if (p) p.classList.add('hidden'); } });
document.addEventListener('click', (e) => { const p = document.getElementById('notif-panel'); if (p && !p.classList.contains('hidden') && !e.target.closest('#notif-panel') && !e.target.closest('[data-action="toggle-notifs"]')) p.classList.add('hidden'); });
window.addEventListener('hashchange', rota);

/* ---------- Início ---------- */
loadDB(); loadSession(); rota();
