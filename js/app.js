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
  const precisaUnidade = ['painel', 'vendas', 'kickoff', 'pos', 'jornada', 'frente', 'treinamento', 'abertura', 'documentos', 'timeline', 'relatorio'].includes(seg[0]);
  if (precisaUnidade && !ctx.unit) { html = vazio('Nenhuma unidade vinculada ao seu usuário. Fale com a franqueadora.', '🏪'); }
  else switch (seg[0]) {
    case 'painel':      titulo = 'Visão geral'; html = viewPainel(ctx.unit); break;
    case 'vendas':      titulo = 'Vendas'; html = viewVendas(ctx.unit); break;
    case 'kickoff':     titulo = 'Kickoff'; html = viewKickoff(ctx.unit); break;
    case 'pos':         titulo = 'Pós-inauguração'; html = viewPos(ctx.unit); break;
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
  'anexo-aprovar': (d) => { const u = unidadeDaAcao(d); const st = taskState(u, d.fid, d.tid); const a = st.anexos.find(x => x.id === d.id); if (!a) return;
    Object.assign(a, { avaliacao: 'aprovado', avaliadoPor: session.user.nome, avaliadoEm: new Date().toISOString(), ajuste: null });
    registrar(u, `Aprovou o documento "${a.nome}".`, 'aprovado'); notificar(u, 'franqueado', `O documento "${a.nome}" foi aprovado. ✅`, fonteDocumentos(d.fid).rota); toast('Documento aprovado.'); rerender(); },
  'anexo-ajuste': (d) => abrirModal(`<div class="text-lg font-bold">Pedir ajuste no documento</div><p class="text-sm text-slate-600 mt-1">Explique ao franqueado o que precisa ser corrigido.</p>
    <form data-form="anexo-ajuste" data-uid="${d.uid || ''}" data-fid="${d.fid}" data-tid="${d.tid}" data-id="${d.id}" class="mt-4 space-y-3"><textarea name="motivo" required rows="3" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-brand-500" placeholder="O que precisa ser ajustado"></textarea><div class="flex justify-end gap-2">${btnSec('Cancelar', 'data-action="fechar-modal"')}<button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white">Pedir ajuste</button></div></form>`),
  'remover-anexo': (d) => { const st = taskState(ctx.unit, d.fid, d.tid); st.anexos = st.anexos.filter(a => a.id !== d.id); setTaskState(ctx.unit, d.fid, d.tid, { anexos: st.anexos }); rerender(); },
  'confirmar-cof': () => abrirModal(`<div class="text-lg font-bold">Registrar reunião introdutória (kickoff)</div><p class="text-sm text-slate-600 mt-1">Ao registrar, as frentes de implantação são liberadas e os prazos passam a contar a partir desta data.</p><form data-form="cof" class="mt-4 space-y-3"><div>${label('Data da reunião')}${input('data', `type="date" value="${todayISO()}" required`)}</div><div class="flex justify-end gap-2">${btnSec('Cancelar', 'data-action="fechar-modal"')}<button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white">Registrar</button></div></form>`),
  'toggle-modulo': (d, el) => { const u = ctx.unit; u.treinamento.modulos[d.mid] = el.checked; const m = DB.modulos.find(x => x.id === d.mid); registrar(u, `${el.checked ? 'Concluiu' : 'Reabriu'} o módulo "${m.titulo}".`, el.checked ? 'concluido' : 'info'); rerender(); },
  'confirmar-presenca': () => { const u = ctx.unit; u.treinamento.presenca = true; u.treinamento.concluidoEm = new Date().toISOString(); registrar(u, '🎓 Presença confirmada. Treinamento concluído — equipe pronta!', 'marco'); notificar(u, 'franqueadora', `${u.nome} concluiu o treinamento. Faça a validação final.`, 'abertura'); toast('Treinamento concluído! 🎓'); confete(); rerender(); },
  'validacao-final': () => { const u = ctx.unit; u.abertura.validacaoFinal = true; u.abertura.validacaoFinalEm = new Date().toISOString(); registrar(u, '✅ Validação final do consultor realizada. Loja liberada para inaugurar!', 'marco'); notificar(u, 'franqueado', 'A validação final foi concluída. Defina a data da Festa de Inauguração! 🎉', 'abertura'); toast('Validação final registrada.'); confete(); rerender(); },
  'confirmar-inauguracao': () => { const u = ctx.unit; u.inauguracao.concluida = true; u.inauguracao.concluidaEm = new Date().toISOString(); registrar(u, '🎉 Festa de Inauguração realizada! Jornada de implantação concluída.', 'marco'); notificar(u, 'franqueadora', `${u.nome} foi inaugurada! 🎉`, 'abertura'); notificar(u, 'franqueado', 'Parabéns! A jornada de implantação foi concluída. 🎉', 'abertura'); confete(6000); rerender(); },
  'cobrar': (d) => { const u = getUnidade(d.uid); const p = proximaAcao(u); notificar(u, 'franqueado', `Lembrete da franqueadora: "${p.texto}" aguarda sua ação.`, p.rota); registrar(u, `Cobrou a pendência "${p.texto}".`, 'cobranca'); toast(`Lembrete enviado para ${u.nome}.`); rerender(); },
  kpi: (d) => { filtros.kpi = filtros.kpi === d.kpi ? '' : d.kpi; rota(); },
  'pos-toggle': (d) => { if (!isFranqueadora()) return; const u = ctx.unit; const it = getPosItens().find(x => x.id === d.iid); u.pos = u.pos || {}; const st = u.pos[it.id] = u.pos[it.id] || {};
    if (st.concluidoEm) { st.concluidoEm = null; st.por = null; registrar(u, `Reabriu "${it.titulo}".`, 'info'); }
    else { st.concluidoEm = new Date().toISOString(); st.por = session.user.nome; registrar(u, `${it.titulo} realizada.`, 'concluido');
      if (posInauguracaoConcluida(u)) { registrar(u, '📈 Pós-inauguração concluída. Jornada de implantação encerrada.', 'marco'); confete(3000); } }
    rerender(); },
  'kickoff-toggle': (d) => { if (!isFranqueadora()) return; const u = ctx.unit; const it = getKickoffItens().find(x => x.id === d.iid); u.kickoff = u.kickoff || {};
    if (u.kickoff[it.id]) { delete u.kickoff[it.id]; registrar(u, `Reabriu o item de kickoff "${it.titulo}".`, 'info'); }
    else { u.kickoff[it.id] = { concluidoEm: new Date().toISOString(), por: session.user.nome }; registrar(u, `Kickoff: "${it.titulo}" concluído.`, 'concluido'); fimKickoff(u); }
    rerender(); },
  'venda-toggle': (d) => { if (!isFranqueadora()) return; const u = ctx.unit; const v = getVendasItens().find(x => x.id === d.vid); u.vendas = u.vendas || {};
    if (u.vendas[v.id]) { delete u.vendas[v.id]; registrar(u, `Reabriu o item de vendas "${v.titulo}".`, 'info'); }
    else { u.vendas[v.id] = { concluidoEm: new Date().toISOString(), por: session.user.nome }; registrar(u, `Vendas: "${v.titulo}" concluído.`, 'concluido');
      if (vendasConcluidas(u)) { registrar(u, '✍️ Etapa de Vendas concluída. Unidade pronta para o kickoff.', 'marco'); confete(2500); } }
    rerender(); },
  'exportar-geral': () => baixar(`implantacao-franquias-${todayISO()}.json`, JSON.stringify(DB, null, 2)),
  'exportar-unidade': (d) => { const u = getUnidade(d.uid); baixar(`${u.id}-${todayISO()}.json`, JSON.stringify(u, null, 2)); },

  'admin-remover-unidade': (d) => { const u = getUnidade(d.id); abrirModal(`<div class="text-lg font-bold">Excluir ${esc(u.nome)}?</div><p class="text-sm text-slate-600 mt-2">Todo o histórico desta unidade será perdido.</p><div class="flex justify-end gap-2 mt-5">${btnSec('Cancelar', 'data-action="fechar-modal"')}${btn('Excluir', `data-action="admin-remover-unidade-ok" data-id="${u.id}"`, 'bg-rose-600 hover:bg-rose-700 text-white')}</div>`); },
  'admin-remover-unidade-ok': (d) => { DB.unidades = DB.unidades.filter(u => u.id !== d.id); DB.users.forEach(u => { if (u.unidadeId === d.id) u.unidadeId = null; }); fecharModal(); toast('Unidade excluída.', 'info'); rerender(); },
  'admin-editar-usuario': (d) => { const u = getUser(d.id); if (!u) return;
    const sel = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white';
    abrirModal(`<div class="text-lg font-bold">Editar usuário</div><p class="text-sm text-slate-600 mt-1">Altere o tipo de acesso e a unidade vinculada.</p>
    <form data-form="admin-editar-usuario" data-id="${u.id}" class="mt-4 space-y-3">
      <div>${label('Nome')}${input('nome', `value="${esc(u.nome)}" required`)}</div>
      <div>${label('E-mail')}${input('email', `type="email" value="${esc(u.email)}" required`)}</div>
      <div>${label('Tipo de usuário')}<select name="perfil" class="${sel}" onchange="this.form.querySelector('[data-campo-unidade]').classList.toggle('hidden', this.value !== 'franqueado')">${[['franqueado', 'Franqueado'], ['franqueadora', 'Franqueadora / consultor'], ['admin', 'Administrador']].map(([k, t]) => `<option value="${k}" ${u.perfil === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div data-campo-unidade class="${u.perfil === 'franqueado' ? '' : 'hidden'}">${label('Unidade do franqueado')}<select name="unidadeId" class="${sel}"><option value="">— selecione —</option>${DB.unidades.map(x => `<option value="${x.id}" ${u.unidadeId === x.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
      <div>${label('Nova senha')}${input('senha', 'minlength="6" placeholder="Deixe em branco para manter a atual"')}${!u.senha && u.convite ? `<div class="text-xs text-amber-600 mt-1">Convite pendente: código ${esc(u.convite)}</div>` : ''}</div>
      <div class="flex justify-end gap-2 pt-1">${btnSec('Cancelar', 'data-action="fechar-modal"')}<button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white">Salvar alterações</button></div>
    </form>`); },
  'admin-remover-usuario': (d) => { const un = getUnidade((getUser(d.id) || {}).unidadeId); DB.users = DB.users.filter(u => u.id !== d.id); ajustarResponsavelUnidade(un); toast('Usuário excluído.', 'info'); rerender(); },
  'admin-remover-tarefa': (d) => { const f = getFrente(d.fid); f.tarefas = f.tarefas.filter(t => t.id !== d.tid); toast('Tarefa removida do checklist.', 'info'); rerender(); },
  'admin-remover-modulo': (d) => { DB.modulos = DB.modulos.filter(m => m.id !== d.mid); rerender(); },
};

/* ---------- Formulários (data-form) ---------- */
// Anexa arquivos a uma tarefa. Arquivos de até 1 MB são guardados no navegador para poderem ser abertos na avaliação.
const LIMITE_ARQUIVO = 1024 * 1024;
function lerArquivo(file) {
  return new Promise(res => { if (file.size > LIMITE_ARQUIVO) return res(null);
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(file); });
}
async function anexarDocumentos(unit, fid, tid, files) {
  if (!files.length) return;
  const st = setTaskState(unit, fid, tid, {}); const fonte = fonteDocumentos(fid); const t = fonte.itens.find(x => x.id === tid);
  const novos = [];
  for (const file of files) {
    const url = await lerArquivo(file);
    const a = { id: uid('ax'), nome: file.name, tamanho: file.size, tipo: file.type, data: new Date().toISOString(), por: session.user.nome, porId: session.user.id, perfil: session.user.perfil, avaliacao: isFranqueado() ? 'pendente' : null };
    if (url) a.url = url;
    st.anexos.push(a); novos.push(a);
  }
  registrar(unit, `Anexou ${files.length} documento(s) em "${t.titulo}"${isFranqueado() ? ' para avaliação' : ''}.`, 'anexo');
  if (isFranqueado()) notificar(unit, 'franqueadora', `${unit.nome} enviou ${files.length} documento(s) para avaliação em "${t.titulo}".`, fonte.rota);
  else notificar(unit, 'franqueado', `${session.user.nome} anexou ${files.length} documento(s) em "${t.titulo}".`, fonte.rota);
  if (!saveDB()) { novos.forEach(a => delete a.url); saveDB(); toast('Sem espaço no navegador para guardar o arquivo. Foram registrados só o nome e o tamanho.', 'info'); }
  else toast(isFranqueado() ? 'Documento(s) enviado(s) para avaliação.' : 'Documento(s) anexado(s).');
  rota();
}
function fimKickoff(u) { if (kickoffConcluido(u)) { registrar(u, '🤝 Etapa de Kickoff concluída.', 'marco'); confete(2500); } }
// Mantém o "franqueado responsável" de cada unidade apontando para um franqueado que ainda está vinculado a ela.
function ajustarResponsavelUnidade(unit) {
  if (!unit) return;
  const atual = getUser(unit.franqueadoId);
  if (atual && atual.perfil === 'franqueado' && atual.unidadeId === unit.id) return;
  const outro = DB.users.find(x => x.perfil === 'franqueado' && x.unidadeId === unit.id);
  unit.franqueadoId = outro ? outro.id : null;
}
const forms = {
  'admin-editar-usuario': (v, f) => { const u = getUser(f.dataset.id); if (!u) return;
    const email = v.email.trim();
    if (DB.users.some(x => x.id !== u.id && x.email.toLowerCase() === email.toLowerCase())) { toast('Já existe um usuário com este e-mail.', 'erro'); return; }
    if (u.id === session.user.id && u.perfil === 'admin' && v.perfil !== 'admin') { toast('Você não pode tirar o seu próprio acesso de administrador.', 'erro'); return; }
    if (u.perfil === 'admin' && v.perfil !== 'admin' && DB.users.filter(x => x.perfil === 'admin').length === 1) { toast('O sistema precisa de pelo menos um administrador.', 'erro'); return; }
    if (v.perfil === 'franqueado' && !v.unidadeId) { toast('Selecione a unidade do franqueado.', 'erro'); return; }
    const unidadeAntes = getUnidade(u.unidadeId);
    const mudancas = [];
    if (u.perfil !== v.perfil) mudancas.push(`tipo: ${u.perfil} → ${v.perfil}`);
    Object.assign(u, { nome: v.nome.trim(), email, perfil: v.perfil, unidadeId: v.perfil === 'franqueado' ? v.unidadeId : null });
    if (v.senha) { u.senha = v.senha; u.convite = null; mudancas.push('senha redefinida'); }
    const unidadeDepois = getUnidade(u.unidadeId);
    if (unidadeAntes !== unidadeDepois) mudancas.push(`unidade: ${unidadeAntes ? unidadeAntes.nome : '—'} → ${unidadeDepois ? unidadeDepois.nome : '—'}`);
    ajustarResponsavelUnidade(unidadeAntes); ajustarResponsavelUnidade(unidadeDepois);
    if (unidadeDepois && mudancas.length) registrar(unidadeDepois, `Usuário ${u.nome} atualizado (${mudancas.join('; ')}).`, 'info');
    fecharModal(); toast('Usuário atualizado.'); rerender(); },
  'anexo-ajuste': (v, f) => { const u = f.dataset.uid ? getUnidade(f.dataset.uid) : ctx.unit; const a = taskState(u, f.dataset.fid, f.dataset.tid).anexos.find(x => x.id === f.dataset.id); if (!a) return;
    Object.assign(a, { avaliacao: 'ajuste', avaliadoPor: session.user.nome, avaliadoEm: new Date().toISOString(), ajuste: { motivo: v.motivo, por: session.user.nome } });
    registrar(u, `Pediu ajuste no documento "${a.nome}": ${v.motivo}`, 'devolvido'); notificar(u, 'franqueado', `Ajuste solicitado no documento "${a.nome}".`, fonteDocumentos(f.dataset.fid).rota);
    fecharModal(); toast('Ajuste solicitado.', 'info'); rerender(); },
  'kickoff-nome': (v, f) => { if (!isFranqueadora()) return; const u = ctx.unit; const it = getKickoffItens().find(x => x.id === f.dataset.iid); const nome = v.valor.trim(); if (!nome) return;
    const antes = kickoffConcluido(u); u.kickoff = u.kickoff || {};
    u.kickoff[it.id] = { valor: nome, concluidoEm: new Date().toISOString(), por: session.user.nome };
    registrar(u, `${it.titulo} definido: ${nome}.`, 'info'); if (!antes) fimKickoff(u); toast('Consultor de campo salvo.'); rerender(); },
  'login': (v) => { const r = entrar(v.email, v.senha); if (r.erro) { loginMsg = { tipo: 'erro', texto: r.erro }; rota(); } else { location.hash = '#/'; rota(); toast(`Bem-vindo(a), ${session.user.nome.split(' ')[0]}!`); } },
  'primeiro-acesso': (v) => {
    const u = DB.users.find(x => x.email.toLowerCase() === v.email.trim().toLowerCase());
    if (!u || u.senha || !u.convite || u.convite.toUpperCase() !== v.convite.trim().toUpperCase()) { loginMsg = { tipo: 'erro', texto: 'E-mail ou código de convite inválido.' }; location.hash = '#/login/primeiro'; rota(); return; }
    u.senha = v.senha; u.convite = null; saveDB(); loginMsg = { tipo: 'ok', texto: 'Acesso ativado! Entre com seu e-mail e a nova senha.' }; location.hash = '#/login/entrar'; rota();
  },
  'recuperar': (v) => { loginMsg = { tipo: 'ok', texto: `Se ${v.email} estiver cadastrado, um link de redefinição foi enviado (simulado neste protótipo).` }; location.hash = '#/login/entrar'; rota(); },
  'comentar': (v, f) => { const st = setTaskState(ctx.unit, f.dataset.fid, f.dataset.tid, {}); st.comentarios.push({ id: uid('c'), autor: session.user.nome, perfil: session.user.perfil, data: new Date().toISOString(), texto: v.texto }); const t = getFrente(f.dataset.fid).tarefas.find(x => x.id === f.dataset.tid); registrar(ctx.unit, `Comentou em "${t.titulo}": ${v.texto}`, 'comentario'); notificar(ctx.unit, isFranqueado() ? 'franqueadora' : 'franqueado', `${session.user.nome} comentou em "${t.titulo}".`, 'frente/' + f.dataset.fid); rerender(); },
  'devolver': (v, f) => { const u = f.dataset.uid ? getUnidade(f.dataset.uid) : ctx.unit; devolverTarefa(u, f.dataset.fid, f.dataset.tid, v.motivo); fecharModal(); toast('Entrega devolvida para ajuste.', 'info'); rerender(); },
  'cof': (v) => { const u = ctx.unit; u.cofEm = v.data; registrar(u, 'Reunião introdutória (kickoff) realizada. Frentes de implantação liberadas.', 'marco'); fimKickoff(u); notificar(u, 'franqueado', 'A reunião introdutória foi realizada. Suas frentes de implantação estão liberadas! 🚀', 'jornada'); fecharModal(); toast('COF registrada. Frentes liberadas!'); confete(2500); rerender(); },
  'agenda': (v) => { const u = ctx.unit; u.treinamento.agenda = { data: v.data, local: v.local, participantes: v.participantes, instrutor: v.instrutor }; registrar(u, `Agendou o treinamento para ${fmtDate(v.data)} em ${v.local}.`, 'info'); notificar(u, 'franqueado', `Treinamento agendado para ${fmtDate(v.data)} · ${v.local}.`, 'treinamento'); toast('Agenda salva.'); rerender(); },
  'inauguracao': (v) => { const u = ctx.unit; u.inauguracao.data = v.data; registrar(u, `Definiu a data da Festa de Inauguração: ${fmtDate(v.data)}.`, 'info'); notificar(u, isFranqueado() ? 'franqueadora' : 'franqueado', `Festa de Inauguração marcada para ${fmtDate(v.data)} 🎉`, 'abertura'); toast('Data da festa salva.'); rerender(); },

  'admin-unidade': (v) => {
    const uidU = uid('un'); const fid = uid('u');
    DB.users.push({ id: fid, nome: v.fnome, email: v.femail, senha: null, perfil: 'franqueado', unidadeId: uidU, convite: v.convite.toUpperCase() });
    DB.unidades.push({ id: uidU, nome: v.nome, cidade: v.cidade, franqueadoId: fid, contratoEm: v.contratoEm, cofEm: null, vendas: {}, kickoff: {}, pos: {}, tarefas: {}, timeline: [{ id: uid('ev'), data: new Date().toISOString(), usuario: session.user.nome, perfil: 'admin', texto: 'Contrato de franquia assinado. Unidade criada.', tipo: 'marco' }], notificacoes: [], treinamento: { agenda: null, modulos: {}, presenca: false, concluidoEm: null }, abertura: { validacaoFinal: false, validacaoFinalEm: null }, inauguracao: { data: null, concluida: false, concluidaEm: null } });
    toast(`Unidade criada. Convite ${v.convite.toUpperCase()} enviado para ${v.femail}.`); rerender();
  },
  'admin-usuario': (v) => { if (DB.users.some(u => u.email.toLowerCase() === v.email.toLowerCase())) { toast('Já existe um usuário com este e-mail.', 'erro'); return; } DB.users.push({ id: uid('u'), nome: v.nome, email: v.email, senha: v.senha, perfil: v.perfil, unidadeId: v.perfil === 'franqueado' ? (v.unidadeId || null) : null }); ajustarResponsavelUnidade(getUnidade(v.unidadeId)); toast('Usuário cadastrado.'); rerender(); },
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
    anexarDocumentos(ctx.unit, ...el.dataset.file.split('|'), Array.from(el.files)); return;
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
