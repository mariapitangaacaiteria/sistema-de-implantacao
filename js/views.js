/* =====================================================================
   VIEWS — cada função devolve o HTML de uma tela
   ===================================================================== */

/* ---------- Componentes ---------- */
const STATUS_TAREFA = {
  pendente:     { label: 'Pendente',              cls: 'bg-slate-100 text-slate-600' },
  em_validacao: { label: 'Em validação',          cls: 'bg-amber-100 text-amber-700' },
  concluido:    { label: 'Concluída',             cls: 'bg-emerald-100 text-emerald-700' },
  devolvido:    { label: 'Devolvida para ajuste', cls: 'bg-rose-100 text-rose-700' },
};
const badge = (label, cls) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}">${label}</span>`;
const barra = (pct, cor = '#4f46e5', h = 'h-2') => `<div class="w-full ${h} bg-slate-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${cor}"></div></div>`;
const card = (inner, cls = '') => `<div class="bg-white rounded-2xl shadow-sm border border-slate-200 ${cls}">${inner}</div>`;
const btn = (label, attrs = '', cls = 'bg-brand-600 hover:bg-brand-700 text-white') => `<button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${cls}" ${attrs}>${label}</button>`;
const btnSec = (label, attrs = '') => btn(label, attrs, 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700');
const input = (name, attrs = '') => `<input name="${name}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm bg-white" ${attrs}>`;
const label = (t) => `<label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">${t}</label>`;
const vazio = (t, emoji = '📭') => `<div class="text-center py-10 text-slate-400"><div class="text-4xl mb-2">${emoji}</div><p class="text-sm">${t}</p></div>`;
const pageTitle = (t, sub = '', right = '') => `<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6"><div><h1 class="text-2xl font-extrabold text-slate-900">${t}</h1>${sub ? `<p class="text-slate-500 mt-1">${sub}</p>` : ''}</div>${right ? `<div class="flex gap-2 flex-wrap">${right}</div>` : ''}</div>`;

function etapasBar(unit) {
  const treLib = treinamentoLiberado(unit), treOk = treinamentoConcluido(unit), abOk = aberturaPronta(unit), inau = unit.inauguracao.concluida;
  const etapas = [
    { k: 'contrato', t: 'Vendas', s: `Checklist ${vendasFeitas(unit)}/${getVendasItens().length}`, emoji: '✍️', done: vendasConcluidas(unit), href: link('vendas') },
    { k: 'kickoff', t: 'Kickoff', s: `Checklist ${kickoffFeitos(unit)}/${getKickoffItens().length}`, emoji: '🤝', done: kickoffConcluido(unit), href: link('kickoff') },
    { k: 'frentes', t: 'Frentes de implantação', s: 'Execução em paralelo', emoji: '🚀', done: treLib },
    { k: 'treinamento', t: 'Treinamento', s: 'Equipe reunida', emoji: '🎓', done: treOk },
    { k: 'abertura', t: 'Abertura', s: 'Loja pronta', emoji: '🏪', done: abOk },
    { k: 'inauguracao', t: 'Inauguração', s: 'Festa!', emoji: '🎉', done: inau },
    { k: 'pos', t: 'Pós-inauguração', s: `Checklist ${itensPosInauguracao(unit).filter(i => i.ok).length}/${itensPosInauguracao(unit).length}`, emoji: '📈', done: posInauguracaoConcluida(unit), href: link('pos') },
  ];
  const atualIdx = etapas.findIndex(e => !e.done);
  return `<div class="grid grid-cols-7 gap-1">${etapas.map((e, i) => {
    const cur = i === atualIdx; const cls = e.done ? 'done' : cur ? 'current' : '';
    return `<${e.href ? `a href="${e.href}" title="Abrir checklist de ${e.t}"` : 'div'} class="stage ${cls} text-center block ${e.href ? 'hover:opacity-80' : ''}">
      <div class="relative z-10 mx-auto w-9 h-9 rounded-full flex items-center justify-center text-base ${e.done ? 'bg-brand-600 text-white' : cur ? 'bg-white ring-4 ring-brand-200 border-2 border-brand-600' : 'bg-slate-200 text-slate-500'}">${e.done ? '✓' : e.emoji}</div>
      <div class="mt-1.5 text-[11px] md:text-xs font-bold ${cur ? 'text-brand-700' : 'text-slate-700'}">${e.t}</div>
      <div class="hidden md:block text-[11px] text-slate-400">${e.s}</div>
    </${e.href ? 'a' : 'div'}>`; }).join('')}</div>`;
}

// Seção de documentos de uma tarefa: lista, avaliação e botão de anexar (disponível em todas as tarefas).
function documentosTarefa(unit, fid, t, st, podeAnexar = !!unit.cofEm) {
  const lista = st.anexos.map(a => { const av = AVALIACAO_DOC[a.avaliacao];
    const meu = a.porId ? a.porId === session.user.id : a.por === session.user.nome;
    const avaliar = isFranqueadora() && a.avaliacao === 'pendente'
      ? btn('✓ Aprovar', `data-action="anexo-aprovar" data-fid="${fid}" data-tid="${t.id}" data-id="${a.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white !px-2.5 !py-1 !text-xs') + btn('↩ Pedir ajuste', `data-action="anexo-ajuste" data-fid="${fid}" data-tid="${t.id}" data-id="${a.id}"`, 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 !px-2.5 !py-1 !text-xs') : '';
    return `<div class="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white text-sm">
      <span class="font-medium text-slate-800 truncate max-w-[260px]" title="${esc(a.nome)}">📄 ${esc(a.nome)}</span><span class="text-xs text-slate-400">${fmtBytes(a.tamanho)}</span>
      ${av ? badge(av.label, av.cls) : ''}
      <span class="text-xs text-slate-500">${esc(a.por)} · ${fmtDateTime(a.data)}</span>
      ${a.ajuste ? `<span class="w-full text-xs text-rose-700">↩ ${esc(a.ajuste.por)}: ${esc(a.ajuste.motivo)}</span>` : ''}
      ${a.avaliadoPor && a.avaliacao === 'aprovado' ? `<span class="text-xs text-slate-400">aprovado por ${esc(a.avaliadoPor)}</span>` : ''}
      <span class="ml-auto flex items-center gap-2">${a.url ? `<a href="${a.url}" download="${esc(a.nome)}" target="_blank" class="text-xs font-semibold text-brand-600 hover:underline">Abrir</a>` : ''}${avaliar}${meu && a.avaliacao !== 'aprovado' ? `<button data-action="remover-anexo" data-fid="${fid}" data-tid="${t.id}" data-id="${a.id}" title="Remover" class="text-slate-400 hover:text-rose-600">✕</button>` : ''}</span>
    </div>`; }).join('');
  const anexar = podeAnexar ? `<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer">📎 Anexar documento<input type="file" class="hidden" data-file="${fid}|${t.id}" multiple></label>` : '';
  if (!lista && !anexar) return '';
  return `<div class="mt-3"><div class="flex items-center gap-3 mb-2"><span class="text-sm font-semibold text-slate-600">📎 Documentos (${st.anexos.length})</span>${anexar}</div>
    ${lista ? `<div class="space-y-2">${lista}</div>` : `<div class="text-xs text-slate-400">${isFranqueado() ? (fid === 'vendas' ? 'Nenhum documento enviado.' : 'Envie arquivos para a franqueadora avaliar.') : (fid === 'vendas' ? 'Anexe aqui documentos para o franqueado.' : 'Nenhum documento enviado.')}</div>`}</div>`;
}

function tarefaStatusBadge(unit, t, st) {
  const s = STATUS_TAREFA[st.status]; let html = badge(s.label, s.cls);
  if (st.status !== 'concluido' && tarefaAtrasada(unit, t, st)) html += ' ' + badge('Prazo vencido', 'bg-rose-600 text-white');
  return html;
}

/* ---------- Login ---------- */
function viewLogin(aba = 'entrar', msg = null) {
  const abas = [['entrar', 'Entrar'], ['primeiro', 'Primeiro acesso'], ['recuperar', 'Recuperar senha']];
  const chars = getFrentes().map(f => `<div class="flex flex-col items-center gap-1"><div class="idle">${personagemSVG(f.id, 'idle')}</div><span class="text-[10px] text-indigo-200 font-medium">${f.curto}</span></div>`).join('');
  let form = '';
  if (aba === 'entrar') form = `
    <form data-form="login" class="space-y-4">
      <div>${label('E-mail')}${input('email', 'type="email" placeholder="nome@empresa.com" required autofocus')}</div>
      <div>${label('Senha')}${input('senha', 'type="password" placeholder="••••••••" required')}</div>
      <button class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition">ENTRAR</button>
    </form>`;
  if (aba === 'primeiro') form = `
    <p class="text-sm text-slate-500 mb-4">Informe o e-mail cadastrado pela franqueadora e o código do convite para criar sua senha.</p>
    <form data-form="primeiro-acesso" class="space-y-4">
      <div>${label('E-mail')}${input('email', 'type="email" required')}</div>
      <div>${label('Código do convite')}${input('convite', 'placeholder="Ex.: ABC123" required')}</div>
      <div>${label('Criar senha')}${input('senha', 'type="password" minlength="6" required')}</div>
      <button class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition">ATIVAR ACESSO</button>
    </form>`;
  if (aba === 'recuperar') form = `
    <p class="text-sm text-slate-500 mb-4">Enviaremos um link de redefinição para o e-mail cadastrado.</p>
    <form data-form="recuperar" class="space-y-4">
      <div>${label('E-mail')}${input('email', 'type="email" required')}</div>
      <button class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition">ENVIAR LINK</button>
    </form>`;

  return `<div class="min-h-screen grid lg:grid-cols-2">
    <div class="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-700 text-white p-12">
      <div><div class="text-sm font-semibold tracking-widest text-indigo-300">${esc(DB.config.marca).toUpperCase()}</div>
        <h1 class="text-4xl font-extrabold mt-4 leading-tight">Da assinatura do contrato<br>à festa de inauguração</h1>
        <p class="text-indigo-200 mt-4 max-w-md">Uma plataforma para guiar o franqueado, organizar cada frente de implantação e dar visibilidade à franqueadora.</p></div>
      <div class="flex justify-between items-end">${chars}</div>
      <div class="flex gap-6 text-xs font-bold tracking-widest text-indigo-300"><span>ORIENTAR</span><span>ACOMPANHAR</span><span>VALIDAR</span><span>CELEBRAR</span></div>
    </div>
    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-md fade-in">
        <div class="lg:hidden text-center mb-6"><div class="text-4xl">🏪</div><div class="font-extrabold text-xl mt-1">Jornada de Implantação</div></div>
        <h2 class="text-2xl font-extrabold text-slate-900">Bem-vindo à jornada</h2>
        <p class="text-slate-500 mt-1 mb-6">Entre para acompanhar a implantação da sua unidade.</p>
        <div class="flex gap-1 bg-slate-200/70 p-1 rounded-xl mb-6">${abas.map(([k, t]) => `<a href="#/login/${k}" class="flex-1 text-center text-xs font-semibold py-2 rounded-lg ${aba === k ? 'bg-white shadow text-brand-700' : 'text-slate-500 hover:text-slate-700'}">${t}</a>`).join('')}</div>
        ${msg ? `<div class="mb-4 px-4 py-3 rounded-xl text-sm ${msg.tipo === 'erro' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">${esc(msg.texto)}</div>` : ''}
        ${form}
        <div class="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <div class="font-bold text-slate-600 mb-2">Acessos de demonstração</div>
          <div class="grid grid-cols-1 gap-1">
            <div><b>Franqueado:</b> fortaleza@franquia.com · sobral@ · juazeiro@ · aracati@ · crato@franquia.com — senha <code>123456</code></div>
            <div><b>Franqueadora:</b> consultor@franqueadora.com — senha <code>admin123</code></div>
            <div><b>Administrador:</b> admin@franqueadora.com — senha <code>admin123</code></div>
            <div><b>Primeiro acesso:</b> caucaia@franquia.com — convite <code>ABC123</code></div>
          </div>
          <button type="button" data-action="reset-demo" class="mt-3 text-brand-600 font-semibold hover:underline">Restaurar dados de demonstração</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- Layout ---------- */
function layout(content, opts = {}) {
  const u = session.user; const unit = ctx.unit;
  const rota = location.hash.replace(/^#/, '');
  const nav = [];
  const item = (href, icon, t, extra = '') => { const ativo = rota === href.slice(1) || (href.slice(1) !== '/' && rota.startsWith(href.slice(1)) && !extra.includes('exact')); nav.push(`<a href="${href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${ativo ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}"><span class="text-base w-5 text-center">${icon}</span>${t}</a>`); };
  const sec = (t) => nav.push(`<div class="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">${t}</div>`);

  if (isFranqueadora()) {
    sec('Franqueadora');
    item('#/franqueadora', '🏢', 'Painel central', 'exact');
    item('#/validacoes', '✅', 'Validações');
    if (isAdmin()) item('#/admin', '⚙️', 'Administração');
  }
  if (unit) {
    sec(isFranqueadora() ? esc(unit.nome) : 'Franquia');
    item(link('painel'), '🏠', 'Visão geral');
    item(link('vendas'), '✍️', 'Vendas');
    item(link('kickoff'), '🤝', 'Kickoff');
    item(link('jornada'), '🗺️', 'Minha jornada');
    item(link('treinamento'), '🎓', 'Treinamento');
    item(link('abertura'), '🎉', 'Abertura e inauguração');
    item(link('pos'), '📈', 'Pós-inauguração');
    item(link('documentos'), '📎', 'Documentos');
    item(link('timeline'), '🕓', 'Linha do tempo');
    if (isFranqueadora()) item(link('relatorio'), '📄', 'Relatório');
  }
  sec('Suporte'); item('#/ajuda', '💬', 'Ajuda');

  const notifs = minhasNotificacoes(); const naoLidas = notifs.filter(n => !n.lida).length;
  const papelLabel = { franqueado: 'Franqueado', franqueadora: 'Franqueadora', admin: 'Administrador' }[u.perfil];

  return `<div class="min-h-screen flex">
    <div id="sidebar-backdrop" class="fixed inset-0 bg-black/40 z-30 hidden md:hidden" data-action="toggle-menu"></div>
    <aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col -translate-x-full md:translate-x-0 transition-transform">
      <div class="px-5 py-5 border-b border-white/10"><div class="text-[10px] font-bold tracking-widest text-indigo-300">${esc(DB.config.marca).toUpperCase()}</div><div class="font-extrabold text-white text-lg leading-tight">Jornada de Implantação</div></div>
      <nav class="flex-1 overflow-y-auto px-3 py-2">${nav.join('')}</nav>
      <div class="p-4 border-t border-white/10 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">${iniciais(u.nome)}</div>
        <div class="flex-1 min-w-0"><div class="text-sm font-semibold text-white truncate">${esc(u.nome)}</div><div class="text-[11px] text-slate-400">${papelLabel}</div></div>
        <button data-action="logout" title="Sair" class="text-slate-400 hover:text-white">⎋</button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
        <div class="flex items-center gap-3 min-w-0">
          <button class="md:hidden text-2xl" data-action="toggle-menu">☰</button>
          <div class="min-w-0"><div class="font-bold text-slate-900 truncate">${opts.titulo || ''}</div>${unit ? `<div class="text-xs text-slate-500 truncate">${esc(unit.nome)} · ${esc(unit.cidade)}</div>` : ''}</div>
        </div>
        <div class="flex items-center gap-2">
          ${isFranqueadora() && unit ? `<a href="#/franqueadora" class="hidden sm:inline-flex text-xs font-semibold text-brand-600 hover:underline">← Todas as unidades</a>` : ''}
          <div class="relative">
            <button data-action="toggle-notifs" class="relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-xl">🔔${naoLidas ? `<span class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">${naoLidas}</span>` : ''}</button>
            <div id="notif-panel" class="hidden absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 border-b"><span class="font-bold text-sm">Notificações</span>${naoLidas ? `<button data-action="read-notifs" class="text-xs text-brand-600 font-semibold">Marcar todas como lidas</button>` : ''}</div>
              <div class="max-h-80 overflow-y-auto divide-y">${notifs.length ? notifs.slice(0, 20).map(n => `<a href="${n.link}" data-action="open-notif" data-id="${n.id}" data-unit="${n.unidade.id}" class="block px-4 py-3 text-sm hover:bg-slate-50 ${n.lida ? 'text-slate-500' : 'text-slate-800 font-medium bg-brand-50/40'}">${esc(n.texto)}<div class="text-[11px] text-slate-400 mt-0.5">${isFranqueadora() ? esc(n.unidade.nome) + ' · ' : ''}${fmtDateTime(n.data)}</div></a>`).join('') : '<div class="px-4 py-6 text-sm text-slate-400 text-center">Nenhuma notificação.</div>'}</div>
            </div>
          </div>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto fade-in">${content}</main>
    </div>
  </div>`;
}

/* ---------- Painel do franqueado ---------- */
function viewPainel(unit) {
  const prog = progressoUnidade(unit); const prox = proximaAcao(unit); const st = statusUnidade(unit);
  const franq = getUser(unit.franqueadoId);
  const saudacao = isFranqueado() ? `Olá, ${esc(session.user.nome.split(' ')[0])}! Vamos avançar com sua unidade.` : `${esc(unit.nome)} · responsável: ${esc(franq ? franq.nome : '—')}`;

  const vendasBanner = !vendasConcluidas(unit) ? `<a href="${link('vendas')}" class="mb-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition">
      <div class="text-3xl">✍️</div>
      <div class="flex-1"><div class="font-bold text-indigo-800">Etapa de Vendas em andamento · ${vendasFeitas(unit)} de ${getVendasItens().length} itens</div><p class="text-sm text-indigo-700">Validação do candidato, negociação, COF, cadastro nos sistemas e grupo da unidade.</p></div>
      <span class="text-sm font-semibold text-indigo-700">Ver checklist →</span>
    </a>` : '';
  const cofBanner = !unit.cofEm ? `<div class="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center gap-4">
      <div class="text-3xl">🤝</div>
      <div class="flex-1"><div class="font-bold text-amber-800">Aguardando a reunião introdutória (kickoff)</div><p class="text-sm text-amber-700">As frentes de implantação são liberadas após a reunião em que o franqueado recebe as informações introdutórias da empresa.</p></div>
      ${isFranqueadora() ? btn('Registrar reunião realizada', 'data-action="confirmar-cof"', 'bg-amber-600 hover:bg-amber-700 text-white') : ''}
    </div>` : (!kickoffConcluido(unit) ? `<a href="${link('kickoff')}" class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 hover:shadow-md transition">
      <div class="text-2xl">🤝</div><div class="flex-1 text-sm text-amber-800"><b>Kickoff com itens pendentes:</b> ${getKickoffItens().filter(i => !kickoffFeito(unit, i)).map(i => esc(i.titulo)).join(', ')}</div><span class="text-sm font-semibold text-amber-700">Ver checklist →</span></a>` : '');

  const frentes = getFrentes().map(f => { const p = prog.porFrente[f.id];
    return `<a href="${link('frente/' + f.id)}" class="group bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition ${!unit.cofEm ? 'opacity-60 pointer-events-none' : ''}">
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style="background:${f.corSuave}">${f.emoji}</div>
        <div class="flex-1 min-w-0"><div class="font-bold text-slate-900 truncate">${esc(f.nome)}</div><div class="text-xs text-slate-500">${p.done}/${p.total} tarefas</div></div>
        ${p.completa ? '<span class="text-emerald-500 text-xl">✓</span>' : ''}
      </div>
      <div class="mt-3">${barra(p.pct, f.cor)}</div>
      <div class="mt-2 flex gap-1 flex-wrap min-h-[20px]">${p.emValidacao ? badge(p.emValidacao + ' em validação', 'bg-amber-100 text-amber-700') : ''}${p.devolvidas ? badge(p.devolvidas + ' devolvida', 'bg-rose-100 text-rose-700') : ''}${p.atrasadas ? badge(p.atrasadas + ' atrasada', 'bg-rose-600 text-white') : ''}</div>
    </a>`; }).join('');

  const treLib = treinamentoLiberado(unit);
  const extras = `
    <a href="${link('treinamento')}" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${treLib ? 'bg-brand-100' : 'bg-slate-100'}">${treLib ? '🎓' : '🔒'}</div>
      <div class="flex-1"><div class="font-bold">Treinamento</div><div class="text-xs text-slate-500">${treLib ? `${modulosFeitos(unit)}/${DB.modulos.length} módulos` : 'Liberado quando todas as frentes forem concluídas'}</div></div>
    </a>
    <a href="${link('abertura')}" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${treinamentoConcluido(unit) ? 'bg-pink-100' : 'bg-slate-100'}">${unit.inauguracao.concluida ? '🎉' : treinamentoConcluido(unit) ? '🏪' : '🔒'}</div>
      <div class="flex-1"><div class="font-bold">Abertura e inauguração</div><div class="text-xs text-slate-500">${itensAbertura(unit).filter(i => i.ok).length}/${itensAbertura(unit).length} itens da reta final</div></div>
    </a>`;

  const notifs = minhasNotificacoes().filter(n => n.unidade.id === unit.id).slice(0, 4);
  return `
    ${pageTitle(saudacao, `${esc(unit.cidade)} · contrato assinado em ${fmtDate(unit.contratoEm)}${unit.cofEm ? ' · kickoff em ' + fmtDate(unit.cofEm) : ''}${consultorCampo(unit) ? ' · consultor de campo: ' + esc(consultorCampo(unit)) : ''}`, badge(st.label, st.cls + ' !text-sm !px-3 !py-1'))}
    ${vendasBanner}${cofBanner}
    ${card(`<div class="p-5">${etapasBar(unit)}</div>`, 'mb-6')}
    <div class="grid lg:grid-cols-3 gap-4 mb-6">
      ${card(`<div class="p-5"><div class="text-xs font-bold text-slate-500 uppercase tracking-wide">Progresso geral</div>
        <div class="flex items-end gap-2 mt-2"><span class="text-4xl font-extrabold text-slate-900">${prog.pct}%</span><span class="text-sm text-slate-500 mb-1.5">concluído</span></div>
        <div class="mt-3">${barra(prog.pct, '#4f46e5', 'h-3')}</div><div class="text-xs text-slate-500 mt-2">${prog.done} de ${prog.total} itens da jornada</div></div>`)}
      ${card(`<div class="p-5 h-full flex flex-col"><div class="text-xs font-bold text-brand-600 uppercase tracking-wide">Próxima ação</div>
        <div class="text-lg font-bold text-slate-900 mt-2 flex-1">${esc(prox.texto)}</div>
        ${prox.resp === 'franqueadora' ? `<div class="text-xs text-slate-500 mb-3">Responsável: ${prox.quem ? esc(prox.quem) : 'franqueadora / consultor'}</div>` : ''}
        <a href="${link(prox.rota)}" class="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Ir para a ação →</a></div>`, 'border-brand-200 bg-brand-50/40')}
      ${card(`<div class="p-5"><div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Avisos recentes</div>
        ${notifs.length ? notifs.map(n => `<a href="${n.link}" class="block text-sm py-1.5 border-b last:border-0 border-slate-100 ${n.lida ? 'text-slate-500' : 'text-slate-800 font-medium'}">${esc(n.texto)}</a>`).join('') : '<div class="text-sm text-slate-400">Nenhum aviso.</div>'}</div>`)}
    </div>
    <div class="flex items-center justify-between mb-3"><h2 class="font-extrabold text-lg text-slate-900">Frentes de implantação</h2><a href="${link('jornada')}" class="text-sm font-semibold text-brand-600 hover:underline">Ver mapa interativo →</a></div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">${frentes}</div>
    <div class="grid sm:grid-cols-2 gap-4">${extras}</div>`;
}

/* ---------- Mapa interativo (jornada) ---------- */
function viewJornada(unit) {
  const treLib = treinamentoLiberado(unit);
  const trilhas = getFrentes().map(f => {
    const p = progressoFrente(unit, f.id); const n = f.tarefas.length;
    const pos = (p.done / n) * 100;
    const nodes = f.tarefas.map((t, i) => { const st = taskState(unit, f.id, t.id); const x = (i / n) * 100;
      const cls = st.status === 'concluido' ? 'done' : i === p.done ? 'current' : '';
      return `<a href="${link('frente/' + f.id)}" class="track-node ${cls}" style="left:${x}%;--c:${f.cor}" data-tip="${esc((i + 1) + '. ' + t.titulo)}"></a>`; }).join('');
    const finalNode = `<a href="${link('treinamento')}" class="track-node final ${p.completa ? 'done' : ''}" style="left:100%;--c:${f.cor}" data-tip="Chegada: área de treinamento">${p.completa ? '✓' : '🎓'}</a>`;
    return `<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 ${!unit.cofEm ? 'opacity-50' : ''}">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <a href="${link('frente/' + f.id)}" class="md:w-56 shrink-0 flex items-center gap-3 group">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style="background:${f.corSuave}">${f.emoji}</div>
          <div class="min-w-0"><div class="font-bold text-slate-900 group-hover:text-brand-600 truncate">${esc(f.nome)}</div><div class="text-xs text-slate-500">Etapa ${Math.min(p.done + 1, n)}/${n} · ${p.pct}%</div></div>
        </a>
        <div class="flex-1 px-7 pr-10">
          <div class="track" data-track="${f.id}">
            <div class="track-line"></div><div class="track-fill" style="width:${pos}%;background:${f.cor}"></div>
            ${nodes}${finalNode}
            <div class="track-char" data-char="${f.id}" data-pos="${pos}" style="left:${pos}%">${p.completa ? '' : personagemSVG(f.id, 'idle')}</div>
          </div>
        </div>
      </div>
    </div>`; }).join('');

  const chegaram = getFrentes().filter(f => progressoFrente(unit, f.id).completa);
  const aCaminho = getFrentes().filter(f => !progressoFrente(unit, f.id).completa);
  const treOk = treinamentoConcluido(unit);
  const cena = `<div class="scene rounded-2xl border border-indigo-200 p-6 md:p-8 bg-white">
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="md:w-64">
        <div class="text-[10px] font-bold tracking-widest text-brand-600">ÁREA DE TREINAMENTO</div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-1">${treLib ? 'A equipe está reunida! 🎓' : 'O ponto de encontro da equipe'}</h3>
        <p class="text-sm text-slate-500 mt-2">${treLib ? 'Todos os personagens chegaram. Hora de aprender a operar a unidade.' : `${chegaram.length} de ${getFrentes().length} personagens já chegaram. Os demais ainda estão a caminho.`}</p>
        <div class="mt-4">${treLib ? `<a href="${link('treinamento')}" class="inline-flex px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700">${treOk ? 'Ver treinamento concluído' : 'Ir para o treinamento →'}</a>` : badge(`🔒 Liberado ao concluir as ${getFrentes().length} frentes`, 'bg-slate-100 text-slate-600')}</div>
      </div>
      <div class="flex-1 flex flex-wrap justify-center items-end gap-3 md:gap-5 min-h-[110px]">
        ${chegaram.map(f => `<div class="flex flex-col items-center"><div>${personagemSVG(f.id, treOk ? 'cheer' : 'idle', { feliz: true })}</div><span class="text-[10px] font-semibold mt-1" style="color:${f.cor}">${f.curto}</span></div>`).join('')}
        ${aCaminho.map(f => `<div class="flex flex-col items-center" title="${esc(f.nome)}: a caminho">${personagemSVG(f.id, 'ghost')}<span class="text-[10px] text-slate-400 mt-1">a caminho</span></div>`).join('')}
      </div>
    </div>
  </div>`;

  const final = `<div class="grid sm:grid-cols-2 gap-4 mt-4">
    <a href="${link('abertura')}" class="rounded-2xl border p-5 flex items-center gap-4 ${treOk ? 'bg-white border-orange-200 hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-70'}"><div class="text-3xl">${aberturaPronta(unit) ? '✅' : '🏪'}</div><div><div class="font-bold">Abertura de loja</div><div class="text-xs text-slate-500">${itensAbertura(unit).filter(i => i.ok).length}/${itensAbertura(unit).length} itens prontos</div></div></a>
    <a href="${link('abertura')}" class="rounded-2xl border p-5 flex items-center gap-4 ${unit.inauguracao.concluida ? 'bg-gradient-to-r from-amber-50 to-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200 opacity-70'}"><div class="text-3xl">🎉</div><div><div class="font-bold">Festa de Inauguração</div><div class="text-xs text-slate-500">${unit.inauguracao.concluida ? 'Realizada em ' + fmtDate(unit.inauguracao.data) : unit.inauguracao.data ? 'Marcada para ' + fmtDate(unit.inauguracao.data) : 'O grande marco final'}</div></div></a>
  </div>`;

  return `${pageTitle('Minha jornada', 'Um personagem para cada frente de trabalho. Cada um avança no seu percurso conforme as tarefas são concluídas. Clique em um personagem ou cartão para abrir a frente.')}
    ${card(`<div class="p-5">${etapasBar(unit)}</div>`, 'mb-6')}
    <div class="space-y-3 mb-6">${trilhas}</div>
    <div class="flex justify-center my-2 text-slate-300 text-2xl">↓</div>
    ${cena}${final}`;
}

/* ---------- Detalhe da frente ---------- */
function viewFrente(unit, fid) {
  const f = getFrente(fid); if (!f) return vazio('Frente não encontrada.');
  const p = progressoFrente(unit, fid);
  const tarefas = f.tarefas.map((t, i) => {
    const st = taskState(unit, fid, t.id); const prazo = prazoTarefa(unit, t); const atras = tarefaAtrasada(unit, t, st);
    const respFranq = t.resp === 'franqueadora';
    const podeConcluir = unit.cofEm && st.status !== 'concluido' && st.status !== 'em_validacao' && (isFranqueadora() || !respFranq);
    let acoes = '';
    if (podeConcluir) acoes += btn(t.validacao && isFranqueado() ? '📤 Enviar para validação' : '✓ Marcar como concluída', `data-action="concluir" data-fid="${fid}" data-tid="${t.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white');
    if (isFranqueadora() && st.status === 'em_validacao') acoes += btn('✓ Aprovar', `data-action="aprovar" data-fid="${fid}" data-tid="${t.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white') + btn('↩ Devolver', `data-action="devolver" data-fid="${fid}" data-tid="${t.id}"`, 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100');
    if (isFranqueadora() && st.status === 'concluido') acoes += btnSec('Reabrir', `data-action="reabrir" data-fid="${fid}" data-tid="${t.id}"`);
    return `<div id="tarefa-${t.id}" class="rounded-2xl border ${st.status === 'concluido' ? 'bg-emerald-50/40 border-emerald-200' : st.status === 'devolvido' ? 'border-rose-200' : st.status === 'em_validacao' ? 'border-amber-200' : 'border-slate-200'} bg-white">
      <div class="p-4 md:p-5 flex gap-4">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${st.status === 'concluido' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${st.status === 'concluido' ? '✓' : i + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2"><span class="font-bold text-slate-900 ${st.status === 'concluido' ? 'line-through text-slate-500' : ''}">${esc(t.titulo)}</span>${tarefaStatusBadge(unit, t, st)}${t.validacao ? badge('Requer validação', 'bg-indigo-50 text-indigo-700 border border-indigo-100') : ''}${t.pos ? badge('Pós-inauguração', 'bg-pink-50 text-pink-700 border border-pink-100') : ''}</div>
          <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>👤 Responsável: <b>${respFranq ? 'Franqueadora / consultor' : 'Franqueado'}${t.quem ? ' · ' + esc(t.quem) : ''}</b></span>
            <span class="${atras ? 'text-rose-600 font-semibold' : ''}">📅 Prazo: ${prazo ? fmtDate(prazo) + (atras ? ` (${diffDays(todayISO(), prazo)} dias de atraso)` : '') : t.pos ? `${t.prazoDias || 0} dias após a inauguração` : 'após o kickoff'}</span>
            ${st.concluidoEm ? `<span>✅ Concluída em ${fmtDateTime(st.concluidoEm)}${st.aprovadoPor ? ' · aprovada por ' + esc(st.aprovadoPor) : ''}</span>` : ''}
            ${st.enviadoEm && st.status === 'em_validacao' ? `<span>📤 Enviada em ${fmtDateTime(st.enviadoEm)}</span>` : ''}
          </div>
          ${st.status === 'devolvido' && st.devolucao ? `<div class="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-800"><b>Devolvida por ${esc(st.devolucao.por)}:</b> ${esc(st.devolucao.motivo)}</div>` : ''}
          <details class="mt-3 group"><summary class="text-sm font-semibold text-brand-600 inline-flex items-center gap-1">📘 Instruções e orientações <span class="group-open:rotate-180 transition">▾</span></summary><div class="mt-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">${esc(t.instrucoes || 'Sem instruções cadastradas.')}</div></details>
          ${documentosTarefa(unit, fid, t, st)}
          <details class="mt-3 group"><summary class="text-sm font-semibold text-slate-600 inline-flex items-center gap-1">💬 Comentários (${st.comentarios.length}) <span class="group-open:rotate-180 transition">▾</span></summary>
            <div class="mt-2 space-y-2">${st.comentarios.map(c => `<div class="text-sm bg-slate-50 rounded-xl p-3"><div class="flex justify-between text-xs text-slate-500 mb-1"><b class="${c.perfil === 'franqueado' ? 'text-brand-700' : 'text-emerald-700'}">${esc(c.autor)}</b><span>${fmtDateTime(c.data)}</span></div>${esc(c.texto)}</div>`).join('')}
              <form data-form="comentar" data-fid="${fid}" data-tid="${t.id}" class="flex gap-2"><input name="texto" required placeholder="Comentar ou pedir ajuda…" class="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-brand-500"><button class="px-3 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold">Enviar</button></form></div></details>
          ${acoes ? `<div class="mt-4 flex flex-wrap gap-2">${acoes}</div>` : ''}
        </div>
      </div></div>`; }).join('');

  return `<a href="${link('jornada')}" class="text-sm font-semibold text-brand-600 hover:underline">← Voltar para a jornada</a>
    <div class="mt-3 rounded-2xl p-5 md:p-6 border border-slate-200 bg-white flex flex-col md:flex-row md:items-center gap-5" style="background:linear-gradient(135deg,${f.corSuave},#fff 60%)">
      <div class="shrink-0">${personagemSVG(fid, p.completa ? 'cheer' : 'idle', { feliz: p.completa })}</div>
      <div class="flex-1"><div class="text-[10px] font-bold tracking-widest" style="color:${f.cor}">FRENTE DE TRABALHO · ${esc(f.personagem).toUpperCase()}</div>
        <h1 class="text-2xl font-extrabold text-slate-900">${f.emoji} ${esc(f.nome)}</h1>
        <p class="text-sm text-slate-600 mt-1">${esc(f.descricao)}</p>
        <div class="text-xs text-slate-500 mt-2">Responsável: <b>${esc(f.responsavel)}</b> · Apoio: <b>${esc(f.apoio)}</b></div></div>
      <div class="md:w-56"><div class="flex justify-between text-sm font-bold"><span>${p.done} de ${p.total} itens</span><span style="color:${f.cor}">${p.pct}%</span></div><div class="mt-2">${barra(p.pct, f.cor, 'h-3')}</div>${p.completa ? '<div class="text-xs text-emerald-600 font-semibold mt-2">🎯 Frente concluída! Personagem na área de treinamento.</div>' : ''}</div>
    </div>
    ${!unit.cofEm ? '<div class="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">As tarefas serão liberadas após a reunião introdutória (kickoff).</div>' : ''}
    <div class="mt-5 space-y-3">${tarefas}</div>
    <div class="mt-6 text-xs text-slate-400">Regra: concluir uma tarefa que exige validação significa “enviar para validação”. A franqueadora pode aprovar ou devolver para ajuste.</div>`;
}

/* ---------- Treinamento ---------- */
function viewTreinamento(unit) {
  const lib = treinamentoLiberado(unit); const ok = treinamentoConcluido(unit); const ag = unit.treinamento.agenda || {};
  const pend = getFrentes().filter(f => !progressoFrente(unit, f.id).completa);
  const cena = `<div class="scene rounded-2xl border border-indigo-200 bg-white p-6 md:p-8 text-center">
    <div class="text-[10px] font-bold tracking-widest text-brand-600">EQUIPE</div>
    <h2 class="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">${lib ? 'Todos juntos: prontos para aprender a operar a unidade' : 'Os personagens ainda estão se encontrando'}</h2>
    <div class="flex flex-wrap justify-center items-end gap-3 md:gap-6 mt-6">${getFrentes().map(f => { const c = progressoFrente(unit, f.id).completa; return `<div class="flex flex-col items-center">${personagemSVG(f.id, c ? (ok ? 'cheer' : 'idle') : 'ghost', { feliz: c })}<span class="text-[10px] font-semibold mt-1 ${c ? '' : 'text-slate-400'}" style="${c ? 'color:' + f.cor : ''}">${f.curto}</span></div>`; }).join('')}</div>
    <div class="mt-5">${ok ? badge('🎓 Treinamento concluído em ' + fmtDateTime(unit.treinamento.concluidoEm), 'bg-emerald-100 text-emerald-700 !text-sm !px-3 !py-1') : lib ? badge('✅ Treinamento liberado', 'bg-emerald-100 text-emerald-700 !text-sm !px-3 !py-1') : badge('🔒 Liberado quando as condições definidas pela franqueadora forem atendidas', 'bg-slate-100 text-slate-600 !text-sm !px-3 !py-1')}</div>
    ${!lib ? `<div class="mt-4 text-sm text-slate-500">Pendências: ${pend.map(f => `<a href="${link('frente/' + f.id)}" class="font-semibold hover:underline" style="color:${f.cor}">${f.emoji} ${esc(f.curto)} (${progressoFrente(unit, f.id).done}/${progressoFrente(unit, f.id).total})</a>`).join(' · ')}</div>` : ''}
  </div>`;

  const agenda = card(`<div class="p-5"><div class="font-bold text-slate-900 mb-3">📅 Agenda, local e participantes</div>
    ${isFranqueadora() ? `<form data-form="agenda" class="grid sm:grid-cols-2 gap-3">
      <div>${label('Data')}${input('data', `type="date" value="${ag.data || ''}" required`)}</div>
      <div>${label('Instrutor')}${input('instrutor', `value="${esc(ag.instrutor || session.user.nome)}"`)}</div>
      <div class="sm:col-span-2">${label('Local')}${input('local', `value="${esc(ag.local || '')}" placeholder="Ex.: loja da unidade ou centro de treinamento" required`)}</div>
      <div class="sm:col-span-2">${label('Participantes')}${input('participantes', `value="${esc(ag.participantes || '')}" placeholder="Nomes e cargos"`)}</div>
      <div class="sm:col-span-2">${btn('Salvar agenda')}</div></form>`
      : ag.data ? `<dl class="grid sm:grid-cols-2 gap-3 text-sm"><div><dt class="text-xs text-slate-500">Data</dt><dd class="font-semibold">${fmtDate(ag.data)}</dd></div><div><dt class="text-xs text-slate-500">Instrutor</dt><dd class="font-semibold">${esc(ag.instrutor || '—')}</dd></div><div><dt class="text-xs text-slate-500">Local</dt><dd class="font-semibold">${esc(ag.local)}</dd></div><div><dt class="text-xs text-slate-500">Participantes</dt><dd class="font-semibold">${esc(ag.participantes || '—')}</dd></div></dl>` : '<p class="text-sm text-slate-400">A franqueadora ainda não agendou o treinamento.</p>'}</div>`);

  const mods = card(`<div class="p-5"><div class="flex items-center justify-between mb-3"><div class="font-bold text-slate-900">📚 Conteúdos / módulos</div><span class="text-sm font-semibold text-brand-600">${modulosFeitos(unit)}/${DB.modulos.length}</span></div>
    <div class="space-y-2">${DB.modulos.map(m => { const d = !!unit.treinamento.modulos[m.id]; return `<label class="flex items-center gap-3 p-3 rounded-xl border ${d ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'} ${lib && !ok ? 'cursor-pointer hover:bg-slate-50' : ''}"><input type="checkbox" ${d ? 'checked' : ''} ${lib && !ok ? '' : 'disabled'} data-action="toggle-modulo" data-mid="${m.id}" class="w-5 h-5 accent-emerald-600"><span class="flex-1 text-sm font-medium ${d ? 'line-through text-slate-500' : ''}">${esc(m.titulo)}</span><span class="text-xs text-slate-400">${esc(m.carga)}</span></label>`; }).join('')}</div>
    <div class="mt-3">${barra(DB.modulos.length ? modulosFeitos(unit) / DB.modulos.length * 100 : 0, '#4f46e5')}</div></div>`);

  const presenca = card(`<div class="p-5"><div class="font-bold text-slate-900 mb-2">🙋 Presença e confirmação de conclusão</div>
    ${ok ? `<p class="text-sm text-emerald-700 font-semibold">Presença confirmada e todos os módulos concluídos. Equipe treinada! 🎉</p>`
      : unit.treinamento.presenca ? '<p class="text-sm text-slate-600">Presença confirmada. Conclua todos os módulos para finalizar o treinamento.</p>'
      : `<p class="text-sm text-slate-600 mb-3">Após a conclusão de todos os módulos, confirme a presença da equipe para encerrar o treinamento.</p>${lib ? btn('Confirmar presença da equipe', `data-action="confirmar-presenca" ${modulosFeitos(unit) < DB.modulos.length ? 'disabled class="inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-400 cursor-not-allowed"' : ''}`) : ''}`}</div>`);

  const pendAb = itensAbertura(unit).filter(i => !i.ok);
  const pendencias = card(`<div class="p-5"><div class="font-bold text-slate-900 mb-2">⚠️ Pendências antes da abertura</div>${pendAb.length ? `<ul class="space-y-1.5">${pendAb.map(i => `<li class="text-sm flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400"></span><a href="${link(i.origem)}" class="hover:underline">${esc(i.titulo)}</a></li>`).join('')}</ul>` : '<p class="text-sm text-emerald-700 font-semibold">Nenhuma pendência. Loja pronta para abrir!</p>'}</div>`);

  return `${pageTitle('Treinamento', 'O momento em que os personagens se encontram. Ao finalizar as etapas exigidas, a equipe se reúne para aprender a operar a unidade.')}
    ${cena}<div class="grid lg:grid-cols-2 gap-4 mt-6">${agenda}${mods}${presenca}${pendencias}</div>`;
}

/* ---------- Abertura e inauguração ---------- */
function viewAbertura(unit) {
  const itens = itensAbertura(unit); const pronta = aberturaPronta(unit); const inau = unit.inauguracao;
  const lista = card(`<div class="p-5 md:p-6"><h2 class="font-extrabold text-lg text-slate-900 mb-1">🏪 Abertura de Loja</h2><p class="text-sm text-slate-500 mb-4">O sistema deixa claro o que falta para abrir.</p>
    <div class="space-y-2">${itens.map(i => `<div class="flex items-center gap-3 p-3 rounded-xl border ${i.ok ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}">
      <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i.ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}">${i.ok ? '✓' : ''}</div>
      <div class="flex-1 text-sm font-medium ${i.ok ? 'text-slate-600' : 'text-slate-900'}">${esc(i.titulo)}${i.auto ? '<span class="ml-2 text-[10px] text-slate-400 font-normal">automático</span>' : ''}</div>
      ${i.ok ? '' : i.auto ? `<a href="${link(i.origem)}" class="text-xs font-semibold text-brand-600 hover:underline">Ver pendência →</a>` : isFranqueadora() ? btn('Validar agora', 'data-action="validacao-final"', `${treinamentoConcluido(unit) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" ${treinamentoConcluido(unit) ? '' : 'disabled'}`) : '<span class="text-xs text-slate-400">Aguardando consultor</span>'}
    </div>`).join('')}</div>
    ${unit.abertura.validacaoFinalEm ? `<div class="text-xs text-slate-500 mt-3">Validação final registrada em ${fmtDateTime(unit.abertura.validacaoFinalEm)}.</div>` : ''}</div>`);

  let festa;
  if (inau.concluida) {
    festa = `<div class="rounded-2xl border border-pink-200 bg-gradient-to-br from-amber-50 via-pink-50 to-indigo-50 p-6 md:p-8 text-center">
      <div class="text-5xl">🎉</div><div class="text-[10px] font-bold tracking-widest text-pink-600 mt-3">CONQUISTA DESBLOQUEADA</div>
      <h2 class="text-3xl font-extrabold celebrate-title mt-1">Festa de Inauguração!</h2>
      <p class="text-slate-600 mt-2">A jornada da implantação foi concluída em ${fmtDate(inau.data)}. Hora de celebrar a nova unidade.</p>
      <div class="flex flex-wrap justify-center items-end gap-3 my-6">${getFrentes().map(f => personagemSVG(f.id, 'cheer', { feliz: true })).join('')}</div>
      <div class="flex justify-center gap-2 flex-wrap">${btn('🕓 Ver linha do tempo', `onclick="location.hash='${link('timeline')}'"`)}${btnSec('🎊 Comemorar de novo', 'data-action="confete"')}${isFranqueadora() ? btnSec('📄 Relatório da implantação', `onclick="location.hash='${link('relatorio')}'"`) : ''}</div></div>`;
  } else if (pronta) {
    festa = `<div class="rounded-2xl border border-pink-200 bg-gradient-to-br from-amber-50 via-pink-50 to-indigo-50 p-6 md:p-8 text-center">
      <div class="text-5xl">🎊</div><h2 class="text-2xl font-extrabold text-slate-900 mt-3">Tudo pronto para a Festa de Inauguração!</h2>
      <p class="text-sm text-slate-600 mt-2">Defina a data da festa e, quando acontecer, confirme para encerrar a jornada.</p>
      <form data-form="inauguracao" class="mt-5 flex flex-col sm:flex-row justify-center items-end gap-3">
        <div class="text-left">${label('Data da festa')}${input('data', `type="date" value="${inau.data || ''}" required`)}</div>
        ${btn('Salvar data', 'name="salvar"', 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')}
        ${inau.data ? btn('🎉 Confirmar inauguração realizada', 'data-action="confirmar-inauguracao"', 'bg-pink-600 hover:bg-pink-700 text-white') : ''}
      </form></div>`;
  } else {
    festa = `<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 text-center opacity-80"><div class="text-5xl grayscale">🎉</div><h2 class="text-xl font-extrabold text-slate-700 mt-3">Festa de Inauguração</h2><p class="text-sm text-slate-500 mt-1">Será liberada quando todos os itens da abertura estiverem concluídos (${itens.filter(i => i.ok).length}/${itens.length}).</p></div>`;
  }
  const posFeitos = itensPosInauguracao(unit).filter(i => i.ok).length, posTotal = itensPosInauguracao(unit).length;
  const pos = `<a href="${link('pos')}" class="mt-5 flex items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${inau.concluida ? 'bg-pink-100' : 'bg-slate-100'}">${inau.concluida ? '📈' : '🔒'}</div>
    <div class="flex-1"><div class="font-bold">Pós-inauguração</div><div class="text-xs text-slate-500">${inau.concluida ? `${posFeitos}/${posTotal} itens · reuniões de acompanhamento de 15, 30 e 60 dias` : 'Liberada depois da Festa de Inauguração'}</div></div>
    <span class="text-sm font-semibold text-brand-600">Abrir →</span></a>`;
  return `${pageTitle('Reta final', 'Da validação à Festa de Inauguração e ao pós-inauguração.')}<div class="grid lg:grid-cols-2 gap-5">${lista}${festa}</div>${pos}`;
}

/* ---------- Vendas ---------- */
function viewVendas(unit) {
  const itens = getVendasItens(); const feitos = vendasFeitas(unit);
  const lista = itens.map((v, i) => { const st = unit.vendas && unit.vendas[v.id]; const ok = !!st;
    return `<div class="flex items-start gap-4 p-4 rounded-2xl border ${ok ? 'bg-emerald-50/40 border-emerald-200' : 'border-slate-200 bg-white'}">
      <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${ok ? '✓' : i + 1}</div>
      <div class="flex-1 min-w-0">
        <div class="font-bold ${ok ? 'text-slate-500 line-through' : 'text-slate-900'}">${esc(v.titulo)}</div>
        <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1"><span>👤 Responsável: <b>${esc(v.area)}${v.quem ? ' · ' + esc(v.quem) : ''}</b></span>${ok ? `<span>✅ Concluído em ${fmtDateTime(st.concluidoEm)}${st.por ? ' · ' + esc(st.por) : ''}</span>` : ''}</div>
        ${documentosTarefa(unit, 'vendas', v, taskState(unit, 'vendas', v.id), true)}
      </div>
      ${isFranqueadora() ? (ok ? btnSec('Reabrir', `data-action="venda-toggle" data-vid="${v.id}"`) : btn('✓ Concluir', `data-action="venda-toggle" data-vid="${v.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white')) : ''}
    </div>`; }).join('');
  return `${pageTitle('Vendas', 'Checklist comercial antes do kickoff, com a área responsável por cada item.')}
    ${card(`<div class="p-5"><div class="flex justify-between text-sm font-bold"><span>${feitos} de ${itens.length} itens</span><span class="text-brand-600">${Math.round(feitos / itens.length * 100)}%</span></div><div class="mt-2">${barra(Math.round(feitos / itens.length * 100), '#4f46e5', 'h-3')}</div></div>`, 'mb-5')}
    <div class="space-y-3">${lista}</div>
    ${isFranqueado() ? '<p class="text-xs text-slate-400 mt-3">Estes itens são conduzidos pela franqueadora. Você acompanha o andamento e baixa os documentos enviados por aqui.</p>' : ''}`;
}

/* ---------- Kickoff ---------- */
function viewKickoff(unit) {
  const itens = getKickoffItens(); const feitos = kickoffFeitos(unit); const pct = Math.round(feitos / itens.length * 100);
  const lista = itens.map((it, i) => { const ok = kickoffFeito(unit, it); const st = (unit.kickoff && unit.kickoff[it.id]) || {};
    let detalhe = '', acao = '';
    if (it.tipo === 'reuniao') {
      if (ok) detalhe = `<span>📅 Realizada em ${fmtDate(unit.cofEm)}</span>`;
      else if (isFranqueadora()) acao = btn('Registrar reunião realizada', 'data-action="confirmar-cof"', 'bg-emerald-600 hover:bg-emerald-700 text-white');
    } else if (it.tipo === 'nome') {
      if (isFranqueadora()) acao = `<form data-form="kickoff-nome" data-iid="${it.id}" class="flex gap-2 w-full sm:w-auto"><input name="valor" value="${esc(st.valor || '')}" placeholder="Nome do consultor" required class="flex-1 sm:w-56 px-3 py-2 rounded-xl border border-slate-300 text-sm"><button class="px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white">Salvar</button></form>`;
      else detalhe = `<span>👤 <b>${ok ? esc(st.valor) : 'A definir'}</b></span>`;
      if (ok && st.concluidoEm) detalhe += `<span>✏️ Atualizado em ${fmtDateTime(st.concluidoEm)}${st.por ? ' · ' + esc(st.por) : ''}</span>`;
    } else {
      if (ok) detalhe = `<span>✅ Concluído em ${fmtDateTime(st.concluidoEm)}${st.por ? ' · ' + esc(st.por) : ''}</span>`;
      if (isFranqueadora()) acao = ok ? btnSec('Reabrir', `data-action="kickoff-toggle" data-iid="${it.id}"`) : btn('✓ Concluir', `data-action="kickoff-toggle" data-iid="${it.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white');
    }
    return `<div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border ${ok ? 'bg-emerald-50/40 border-emerald-200' : 'border-slate-200 bg-white'}">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${ok ? '✓' : i + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-bold ${ok && it.tipo !== 'nome' ? 'text-slate-500 line-through' : 'text-slate-900'}">${esc(it.titulo)}${it.tipo === 'nome' && ok && isFranqueadora() ? ': ' + esc(st.valor) : ''}</div>
          ${it.desc ? `<div class="text-xs text-slate-500 mt-0.5">${esc(it.desc)}</div>` : ''}
          ${detalhe ? `<div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">${detalhe}</div>` : ''}
        </div>
      </div>${acao}
    </div>`; }).join('');
  return `${pageTitle('Kickoff', 'Reunião introdutória, agendas, EAD e definição do consultor de campo.')}
    ${!vendasConcluidas(unit) ? `<div class="mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-800">A etapa de Vendas ainda tem itens pendentes. <a href="${link('vendas')}" class="font-semibold underline">Ver checklist de vendas</a></div>` : ''}
    ${card(`<div class="p-5"><div class="flex justify-between text-sm font-bold"><span>${feitos} de ${itens.length} itens</span><span class="text-brand-600">${pct}%</span></div><div class="mt-2">${barra(pct, '#4f46e5', 'h-3')}</div></div>`, 'mb-5')}
    <div class="space-y-3">${lista}</div>
    ${isFranqueado() ? '<p class="text-xs text-slate-400 mt-3">Estes itens são registrados pela franqueadora. Você acompanha o andamento por aqui.</p>' : ''}`;
}

/* ---------- Pós-inauguração ---------- */
function viewPos(unit) {
  const inau = unit.inauguracao.concluida; const itens = itensPosInauguracao(unit);
  const feitos = itens.filter(i => i.ok).length; const pct = Math.round(feitos / itens.length * 100);
  const lista = itens.map((it, i) => {
    const atras = inau && !it.ok && it.prazo && it.prazo < todayISO();
    const st = it.reuniao ? posReuniao(unit, it.id) : null;
    let resp, acao = '';
    if (it.tarefa) {
      resp = `<span>👤 Responsável: <b>${it.tarefa.resp === 'franqueadora' ? 'Franqueadora' : 'Franqueado'}${it.tarefa.quem ? ' · ' + esc(it.tarefa.quem) : ''}</b></span><span>${it.frente.emoji} Tarefa da frente ${esc(it.frente.nome)}</span>`;
      if (inau) acao = `<a href="${link('frente/' + it.frente.id)}#tarefa-${it.id}" class="text-sm font-semibold text-brand-600 hover:underline whitespace-nowrap">Abrir tarefa →</a>`;
    } else {
      resp = `<span>👤 Responsável: <b>${esc(it.responsavel)}</b></span>`;
      if (it.ok) resp += `<span>✅ Realizada em ${fmtDateTime(st.concluidoEm)}${st.por ? ' · ' + esc(st.por) : ''}</span>`;
      if (isFranqueadora() && inau) acao = it.ok ? btnSec('Reabrir', `data-action="pos-toggle" data-iid="${it.id}"`) : btn('✓ Reunião realizada', `data-action="pos-toggle" data-iid="${it.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white');
    }
    const prazo = it.prazo ? `<span class="${atras ? 'text-rose-600 font-semibold' : ''}">📅 ${it.reuniao ? 'Data prevista' : 'Prazo'}: ${fmtDate(it.prazo)}${atras ? ` (${diffDays(todayISO(), it.prazo)} dias de atraso)` : ''}</span>`
      : `<span>📅 ${it.reuniao ? it.reuniao.dias : it.tarefa.prazoDias || 0} dias após a inauguração</span>`;
    return `<div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border ${it.ok ? 'bg-emerald-50/40 border-emerald-200' : atras ? 'border-rose-200 bg-white' : 'border-slate-200 bg-white'} ${inau ? '' : 'opacity-60'}">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${it.ok ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}">${it.ok ? '✓' : i + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2"><span class="font-bold ${it.ok ? 'text-slate-500 line-through' : 'text-slate-900'}">${esc(it.titulo)}</span>${atras ? badge('Prazo vencido', 'bg-rose-600 text-white') : ''}</div>
          <div class="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">${resp}${prazo}</div>
        </div>
      </div>${acao}
    </div>`; }).join('');
  return `${pageTitle('Pós-inauguração', 'Acompanhamento da unidade depois da Festa de Inauguração.')}
    ${!inau ? '<div class="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">🔒 Esta etapa começa depois da Festa de Inauguração. As datas das reuniões são calculadas a partir da data da inauguração. </div>' : ''}
    ${card(`<div class="p-5"><div class="flex justify-between text-sm font-bold"><span>${feitos} de ${itens.length} itens</span><span class="text-brand-600">${pct}%</span></div><div class="mt-2">${barra(pct, '#ec4899', 'h-3')}</div></div>`, 'mb-5')}
    <div class="space-y-3">${lista}</div>`;
}

/* ---------- Documentos ---------- */
function viewDocumentos(unit) {
  const rows = [];
  documentosUnidade(unit).forEach(d => rows.push({ f: d.frente, t: d.tarefa, a: d.anexo }));
  rows.sort((a, b) => b.a.data.localeCompare(a.a.data));
  return `${pageTitle('Documentos', 'Todos os arquivos e comprovantes anexados nas tarefas desta unidade.')}
    ${card(rows.length ? `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase border-b"><th class="p-4">Arquivo</th><th class="p-4">Etapa / frente</th><th class="p-4">Tarefa</th><th class="p-4">Enviado por</th><th class="p-4">Data</th><th class="p-4">Avaliação</th><th class="p-4"></th></tr></thead><tbody class="divide-y">${rows.map(r => `<tr class="hover:bg-slate-50"><td class="p-4 font-medium">📎 ${esc(r.a.nome)} <span class="text-xs text-slate-400">${fmtBytes(r.a.tamanho)}</span></td><td class="p-4">${r.f.emoji} ${esc(r.f.curto)}</td><td class="p-4"><a href="${link(r.f.rota)}${r.f.id === 'vendas' ? '' : '#tarefa-' + r.t.id}" class="text-brand-600 hover:underline">${esc(r.t.titulo)}</a></td><td class="p-4">${esc(r.a.por)}</td><td class="p-4 text-slate-500">${fmtDateTime(r.a.data)}</td><td class="p-4">${AVALIACAO_DOC[r.a.avaliacao] ? badge(AVALIACAO_DOC[r.a.avaliacao].label, AVALIACAO_DOC[r.a.avaliacao].cls) : '—'}</td><td class="p-4">${r.a.url ? `<a href="${r.a.url}" download="${esc(r.a.nome)}" target="_blank" class="text-xs font-semibold text-brand-600 hover:underline">Abrir</a>` : ''}</td></tr>`).join('')}</tbody></table></div>` : vazio('Nenhum documento anexado ainda.', '📎'))}
    <p class="text-xs text-slate-400 mt-3">Neste protótipo os arquivos de até 1 MB ficam salvos no navegador e podem ser abertos. Arquivos maiores registram só o nome e o tamanho. Em produção os arquivos serão armazenados no servidor.</p>`;
}

/* ---------- Linha do tempo ---------- */
function viewTimeline(unit) {
  const icone = { marco: '🏁', concluido: '✅', validacao: '📤', aprovado: '👍', devolvido: '↩️', comentario: '💬', anexo: '📎', info: 'ℹ️', cobranca: '🔔' };
  return `${pageTitle('Linha do tempo', 'Registro de quem marcou, anexou, comentou ou aprovou e em qual data.')}
    ${card(unit.timeline.length ? `<ol class="p-5 md:p-6 relative border-l-2 border-slate-200 ml-4 space-y-5">${unit.timeline.map(e => `<li class="relative pl-6"><span class="absolute -left-[21px] top-0 w-9 h-9 rounded-full bg-white border-2 ${e.tipo === 'marco' ? 'border-brand-500' : 'border-slate-200'} flex items-center justify-center text-base">${icone[e.tipo] || 'ℹ️'}</span><div class="text-sm ${e.tipo === 'marco' ? 'font-bold text-slate-900' : 'text-slate-700'}">${esc(e.texto)}</div><div class="text-xs text-slate-400 mt-0.5">${esc(e.usuario)} · ${fmtDateTime(e.data)}</div></li>`).join('')}</ol>` : vazio('Nenhum evento registrado.'))}`;
}

/* ---------- Painel da franqueadora ---------- */
const filtros = { busca: '', status: '', etapa: '', kpi: '' };
// Critérios dos cards do painel: cada chave filtra a lista de unidades conforme o texto do card.
const KPIS = {
  implantacao: { titulo: 'Unidades em implantação', emoji: '🚧', cls: 'bg-brand-50 text-brand-700', ativo: 'border-brand-500 ring-2 ring-brand-200', filtro: u => !u.inauguracao.concluida },
  ativas: { titulo: 'Unidades ativas', emoji: '🏪', cls: 'bg-emerald-50 text-emerald-700', ativo: 'border-emerald-500 ring-2 ring-emerald-200', filtro: u => u.inauguracao.concluida },
  validacao: { titulo: 'Aguardando validação', emoji: '✅', cls: 'bg-amber-50 text-amber-700', ativo: 'border-amber-500 ring-2 ring-amber-200', filtro: u => validacoesPendentes(u).length > 0 },
  vencido: { titulo: 'Com prazo vencido', emoji: '⏰', cls: 'bg-rose-50 text-rose-700', ativo: 'border-rose-500 ring-2 ring-rose-200', filtro: u => tarefasAtrasadas(u).length > 0 },
  abertura: { titulo: 'Próximas da abertura', emoji: '🎉', cls: 'bg-pink-50 text-pink-700', ativo: 'border-pink-500 ring-2 ring-pink-200', filtro: u => !u.inauguracao.concluida && treinamentoLiberado(u) },
};
function viewFranqueadora() {
  const us = DB.unidades;
  const emImpl = us.filter(u => !u.inauguracao.concluida);
  const contagem = { validacao: us.reduce((n, u) => n + validacoesPendentes(u).length, 0) };
  const stats = Object.entries(KPIS).map(([k, c]) => [k, c, contagem[k] !== undefined ? contagem[k] : us.filter(c.filtro).length]);
  const kpiAtivo = KPIS[filtros.kpi];
  let lista = us.map(u => ({ u, prog: progressoUnidade(u), st: statusUnidade(u), etapa: etapaUnidade(u), prox: proximaAcao(u), franq: getUser(u.franqueadoId) }));
  if (kpiAtivo) lista = lista.filter(x => kpiAtivo.filtro(x.u));
  if (filtros.busca) lista = lista.filter(x => (x.u.nome + ' ' + x.u.cidade + ' ' + (x.franq ? x.franq.nome : '')).toLowerCase().includes(filtros.busca.toLowerCase()));
  if (filtros.status) lista = lista.filter(x => x.st.key === filtros.status);
  if (filtros.etapa) lista = lista.filter(x => x.etapa.key === filtros.etapa);
  lista.sort((a, b) => (a.st.key === 'inaugurada') - (b.st.key === 'inaugurada') || b.prog.pct - a.prog.pct);

  const tabela = `<div class="overflow-x-auto"><table class="w-full min-w-[760px] text-sm"><thead><tr class="text-left text-[11px] text-slate-500 uppercase border-b"><th class="p-4">Unidade</th><th class="p-4 w-40">Progresso</th><th class="p-4">Etapa atual</th><th class="p-4">Pendência</th><th class="p-4">Status</th><th class="p-4 text-right">Ações</th></tr></thead>
    <tbody class="divide-y">${lista.length ? lista.map(x => `<tr class="hover:bg-slate-50">
      <td class="p-4 whitespace-nowrap"><a href="#/u/${x.u.id}/painel" class="font-bold text-slate-900 hover:text-brand-600">${esc(x.u.nome)}</a><div class="text-xs text-slate-500">${esc(x.u.cidade)} · ${esc(x.franq ? x.franq.nome : '—')}</div></td>
      <td class="p-4"><div class="flex items-center gap-2"><div class="flex-1">${barra(x.prog.pct, x.prog.pct === 100 ? '#10b981' : '#4f46e5')}</div><span class="font-bold text-xs w-9 text-right">${x.prog.pct}%</span></div></td>
      <td class="p-4 whitespace-nowrap">${esc(x.etapa.label)}</td>
      <td class="p-4 text-slate-600 max-w-[220px] truncate" title="${esc(x.prox.texto)}">${esc(x.prox.texto)}</td>
      <td class="p-4 whitespace-nowrap">${badge(x.st.label, x.st.cls)}${tarefasAtrasadas(x.u).length ? `<div class="text-[11px] text-rose-600 mt-1">${tarefasAtrasadas(x.u).length} tarefa(s) vencida(s)</div>` : ''}</td>
      <td class="p-4 text-right whitespace-nowrap"><a href="#/u/${x.u.id}/painel" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700">Abrir</a> ${!x.u.inauguracao.concluida && x.prox.resp !== 'franqueadora' ? `<button data-action="cobrar" data-uid="${x.u.id}" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">Cobrar pendência</button>` : ''}</td>
    </tr>`).join('') : `<tr><td colspan="6">${vazio('Nenhuma unidade encontrada com esses filtros.')}</td></tr>`}</tbody></table></div>`;

  const valids = []; us.forEach(u => validacoesPendentes(u).forEach(v => valids.push({ u, ...v })));
  const validacoes = card(`<div class="p-5"><div class="flex items-center justify-between mb-3"><div class="font-bold text-slate-900">✅ Entregas aguardando validação</div><a href="#/validacoes" class="text-xs font-semibold text-brand-600 hover:underline">Ver todas</a></div>
    ${valids.length ? `<div class="space-y-2">${valids.slice(0, 5).map(v => `<div class="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50/50"><div class="flex-1 min-w-[200px] text-sm"><b>${esc(v.u.nome)}</b> · ${v.frente.emoji} ${esc(v.tarefa.titulo)}<div class="text-xs text-slate-500">enviada em ${fmtDateTime(v.st.enviadoEm)}</div></div><a href="#/u/${v.u.id}/frente/${v.frente.id}#tarefa-${v.tarefa.id}" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100">Revisar</a>${btn('Aprovar', `data-action="aprovar" data-uid="${v.u.id}" data-fid="${v.frente.id}" data-tid="${v.tarefa.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white !px-3 !py-1.5 !text-xs')}${btn('Devolver', `data-action="devolver" data-uid="${v.u.id}" data-fid="${v.frente.id}" data-tid="${v.tarefa.id}"`, 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 !px-3 !py-1.5 !text-xs')}</div>`).join('')}</div>` : '<p class="text-sm text-slate-400">Nenhuma entrega aguardando validação.</p>'}</div>`);

  return `${pageTitle('Painel central de todas as unidades', 'Visão gerencial para acompanhar andamento, atrasos, pendências e necessidade de apoio.', (isAdmin() ? btnSec('⚙️ Administração', `onclick="location.hash='#/admin'"`) : '') + btnSec('📊 Exportar relatório', 'data-action="exportar-geral"'))}
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">${stats.map(([k, c, n]) => `<button type="button" data-action="kpi" data-kpi="${k}" title="${filtros.kpi === k ? 'Clique para remover o filtro' : 'Clique para ver somente estas unidades'}" class="text-left bg-white rounded-2xl border shadow-sm p-4 transition hover:shadow-md hover:-translate-y-0.5 ${filtros.kpi === k ? c.ativo : 'border-slate-200'}"><div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.cls}">${c.emoji}</div><div class="text-3xl font-extrabold text-slate-900 mt-2">${n}</div><div class="text-xs text-slate-500">${c.titulo}</div></button>`).join('')}</div>
    <div class="grid 2xl:grid-cols-3 gap-5">
      <div class="2xl:col-span-2">${card(`<div class="p-4 border-b flex flex-col sm:flex-row gap-2">
        <input data-filter="busca" value="${esc(filtros.busca)}" placeholder="🔍 Buscar unidade, cidade ou franqueado" class="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-brand-500">
        <select data-filter="etapa" class="px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"><option value="">Todas as etapas</option>${[['vendas', 'Vendas'], ['cof', 'Kickoff'], ['frentes', 'Frentes em execução'], ['treinamento', 'Treinamento'], ['abertura', 'Abertura de loja'], ['pos_inauguracao', 'Pós-inauguração'], ['inaugurada', 'Inaugurada']].map(([k, t]) => `<option value="${k}" ${filtros.etapa === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select data-filter="status" class="px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"><option value="">Todos os status</option>${[['em_andamento', 'Em andamento'], ['atencao', 'Atenção'], ['validacao', 'Aguardando validação'], ['aguardando_cof', 'Aguardando kickoff'], ['inaugurada', 'Inaugurada']].map(([k, t]) => `<option value="${k}" ${filtros.status === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
      </div>${kpiAtivo ? `<div class="px-4 py-2 border-b bg-slate-50 flex items-center gap-2 text-xs text-slate-600"><span>Mostrando: <b>${kpiAtivo.emoji} ${kpiAtivo.titulo}</b> · ${lista.length} unidade(s)</span><button type="button" data-action="kpi" data-kpi="${filtros.kpi}" class="ml-auto font-semibold text-brand-600 hover:underline">✕ Limpar filtro</button></div>` : ''}${tabela}`)}</div>
      <div class="space-y-5">${validacoes}${card(`<div class="p-5"><div class="font-bold text-slate-900 mb-3">🗺️ Onde cada unidade está</div><div class="space-y-3">${emImpl.map(u => `<a href="#/u/${u.id}/jornada" class="block"><div class="flex justify-between text-xs mb-1"><span class="font-semibold">${esc(u.nome)}</span><span class="text-slate-500">${esc(etapaUnidade(u).label)}</span></div><div class="flex gap-1">${getFrentes().map(f => { const p = progressoFrente(u, f.id); return `<div class="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden" title="${esc(f.curto)}: ${p.pct}%"><div class="h-full" style="width:${p.pct}%;background:${f.cor}"></div></div>`; }).join('')}</div></a>`).join('')}</div></div>`)}</div>
    </div>`;
}

function viewValidacoes() {
  const valids = []; DB.unidades.forEach(u => validacoesPendentes(u).forEach(v => valids.push({ u, ...v })));
  const docs = []; DB.unidades.forEach(u => documentosAguardando(u).forEach(d => docs.push({ u, ...d })));
  const docsHtml = docs.length ? `<h2 class="font-extrabold text-lg text-slate-900 mt-8 mb-3">📎 Documentos aguardando avaliação (${docs.length})</h2><div class="space-y-2">${docs.map(d => card(`<div class="p-4 flex flex-col md:flex-row md:items-center gap-3"><div class="flex-1 text-sm"><b>${esc(d.anexo.nome)}</b> <span class="text-xs text-slate-400">${fmtBytes(d.anexo.tamanho)}</span><div class="text-xs text-slate-500">${esc(d.u.nome)} · ${d.frente.emoji} ${esc(d.tarefa.titulo)} · enviado por ${esc(d.anexo.por)} em ${fmtDateTime(d.anexo.data)}</div></div><div class="flex gap-2 flex-wrap">${d.anexo.url ? `<a href="${d.anexo.url}" download="${esc(d.anexo.nome)}" target="_blank" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100">Abrir</a>` : ''}${btn('✓ Aprovar', `data-action="anexo-aprovar" data-uid="${d.u.id}" data-fid="${d.frente.id}" data-tid="${d.tarefa.id}" data-id="${d.anexo.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white !px-3 !py-1.5 !text-xs')}${btn('↩ Pedir ajuste', `data-action="anexo-ajuste" data-uid="${d.u.id}" data-fid="${d.frente.id}" data-tid="${d.tarefa.id}" data-id="${d.anexo.id}"`, 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 !px-3 !py-1.5 !text-xs')}</div></div>`)).join('')}</div>` : '';
  return `${pageTitle('Validações pendentes', 'Entregas enviadas pelos franqueados que aguardam aprovação ou devolução.')}
    ${valids.length ? `<div class="space-y-3">${valids.map(v => card(`<div class="p-5 flex flex-col md:flex-row md:items-center gap-4"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background:${v.frente.corSuave}">${v.frente.emoji}</div><div class="flex-1"><div class="font-bold">${esc(v.tarefa.titulo)}</div><div class="text-sm text-slate-500">${esc(v.u.nome)} · ${esc(v.frente.nome)} · enviada em ${fmtDateTime(v.st.enviadoEm)}</div>${v.st.anexos.length ? `<div class="text-xs text-slate-500 mt-1">📎 ${v.st.anexos.map(a => esc(a.nome)).join(', ')}</div>` : ''}</div><div class="flex gap-2 flex-wrap">${btnSec('Revisar', `onclick="location.hash='#/u/${v.u.id}/frente/${v.frente.id}'"`)}${btn('✓ Aprovar', `data-action="aprovar" data-uid="${v.u.id}" data-fid="${v.frente.id}" data-tid="${v.tarefa.id}"`, 'bg-emerald-600 hover:bg-emerald-700 text-white')}${btn('↩ Devolver', `data-action="devolver" data-uid="${v.u.id}" data-fid="${v.frente.id}" data-tid="${v.tarefa.id}"`, 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50')}</div></div>`)).join('')}</div>` : card(vazio('Nenhuma entrega aguardando validação. Tudo em dia! 🎉', '✅'))}`
    + docsHtml;
}

/* ---------- Administração ---------- */
function viewAdmin(aba = 'unidades') {
  const abas = [['unidades', '🏪 Unidades'], ['usuarios', '👤 Usuários'], ['checklists', '📋 Checklists'], ['treinamento', '🎓 Módulos'], ['config', '⚙️ Configurações']];
  let corpo = '';
  if (aba === 'unidades') corpo = `<div class="grid lg:grid-cols-3 gap-5"><div class="lg:col-span-2">${card(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[11px] text-slate-500 uppercase border-b"><th class="p-4">Unidade</th><th class="p-4">Franqueado</th><th class="p-4">Contrato</th><th class="p-4">COF</th><th class="p-4"></th></tr></thead><tbody class="divide-y">${DB.unidades.map(u => { const f = getUser(u.franqueadoId); return `<tr><td class="p-4 font-semibold">${esc(u.nome)}<div class="text-xs text-slate-500 font-normal">${esc(u.cidade)}</div></td><td class="p-4">${f ? esc(f.nome) + `<div class="text-xs text-slate-500">${esc(f.email)}${f.senha ? '' : ' · <span class="text-amber-600">convite ' + esc(f.convite) + '</span>'}</div>` : '—'}</td><td class="p-4">${fmtDate(u.contratoEm)}</td><td class="p-4">${u.cofEm ? fmtDate(u.cofEm) : badge('pendente', 'bg-slate-100 text-slate-600')}</td><td class="p-4 text-right whitespace-nowrap"><a href="#/u/${u.id}/painel" class="text-xs font-semibold text-brand-600 hover:underline">Abrir</a> <button data-action="admin-remover-unidade" data-id="${u.id}" class="text-xs font-semibold text-rose-600 hover:underline ml-2">Excluir</button></td></tr>`; }).join('')}</tbody></table></div>`)}</div>
    ${card(`<form data-form="admin-unidade" class="p-5 space-y-3"><div class="font-bold text-slate-900">Nova unidade</div>
      <div>${label('Nome da unidade')}${input('nome', 'required placeholder="Unidade Maracanaú"')}</div><div>${label('Cidade / UF')}${input('cidade', 'required placeholder="Maracanaú - CE"')}</div><div>${label('Data do contrato')}${input('contratoEm', `type="date" value="${todayISO()}" required`)}</div>
      <div class="pt-2 border-t"><div class="text-xs font-bold text-slate-600 mb-2">Franqueado responsável</div><div class="space-y-3"><div>${label('Nome')}${input('fnome', 'required')}</div><div>${label('E-mail')}${input('femail', 'type="email" required')}</div><div>${label('Código do convite (primeiro acesso)')}${input('convite', `value="${Math.random().toString(36).slice(2, 8).toUpperCase()}" required`)}</div></div></div>
      ${btn('Cadastrar unidade e convidar franqueado', 'class="w-full justify-center inline-flex px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white"')}</form>`)}</div>`;

  if (aba === 'usuarios') corpo = `<div class="grid lg:grid-cols-3 gap-5"><div class="lg:col-span-2">${card(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-[11px] text-slate-500 uppercase border-b"><th class="p-4">Nome</th><th class="p-4">E-mail</th><th class="p-4">Perfil</th><th class="p-4">Unidade</th><th class="p-4"></th></tr></thead><tbody class="divide-y">${DB.users.map(u => `<tr><td class="p-4 font-semibold">${esc(u.nome)}</td><td class="p-4">${esc(u.email)}</td><td class="p-4">${badge({ franqueado: 'Franqueado', franqueadora: 'Franqueadora', admin: 'Admin' }[u.perfil], { franqueado: 'bg-brand-50 text-brand-700', franqueadora: 'bg-emerald-50 text-emerald-700', admin: 'bg-slate-800 text-white' }[u.perfil])}${u.senha ? '' : ' ' + badge('convite pendente', 'bg-amber-100 text-amber-700')}</td><td class="p-4">${u.unidadeId ? esc((getUnidade(u.unidadeId) || {}).nome || '—') : '—'}</td><td class="p-4 text-right">${u.id !== session.user.id ? `<button data-action="admin-remover-usuario" data-id="${u.id}" class="text-xs font-semibold text-rose-600 hover:underline">Excluir</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`)}</div>
    ${card(`<form data-form="admin-usuario" class="p-5 space-y-3"><div class="font-bold text-slate-900">Novo usuário</div>
      <div>${label('Nome')}${input('nome', 'required')}</div><div>${label('E-mail')}${input('email', 'type="email" required')}</div>
      <div>${label('Perfil')}<select name="perfil" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"><option value="franqueado">Franqueado</option><option value="franqueadora">Franqueadora / consultor</option><option value="admin">Administrador</option></select></div>
      <div>${label('Unidade (para franqueado)')}<select name="unidadeId" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"><option value="">—</option>${DB.unidades.map(u => `<option value="${u.id}">${esc(u.nome)}</option>`).join('')}</select></div>
      <div>${label('Senha inicial')}${input('senha', 'minlength="6" required')}</div>${btn('Cadastrar usuário')}</form>`)}</div>`;

  if (aba === 'checklists') corpo = `<p class="text-sm text-slate-500 mb-4">As listas definitivas de cada frente são cadastradas aqui. Novas tarefas entram como pendentes em todas as unidades.</p><div class="space-y-4">${getFrentes().map(f => card(`<div class="p-5"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:${f.corSuave}">${f.emoji}</div><div><div class="font-bold">${esc(f.nome)}</div><div class="text-xs text-slate-500">${f.tarefas.length} tarefas · personagem: ${esc(f.personagem)}</div></div></div>
    <div class="space-y-2">${f.tarefas.map((t, i) => `<form data-form="admin-tarefa" data-fid="${f.id}" data-tid="${t.id}" class="grid grid-cols-12 gap-2 items-center"><span class="col-span-12 sm:col-span-1 text-xs text-slate-400 font-bold">${i + 1}</span><input name="titulo" value="${esc(t.titulo)}" class="col-span-12 sm:col-span-5 px-3 py-2 rounded-lg border border-slate-300 text-sm" required><input name="prazoDias" type="number" min="0" value="${t.prazoDias || 0}" title="Prazo em dias após a COF" class="col-span-4 sm:col-span-1 px-2 py-2 rounded-lg border border-slate-300 text-sm"><select name="resp" class="col-span-8 sm:col-span-2 px-2 py-2 rounded-lg border border-slate-300 text-sm bg-white"><option value="franqueado" ${t.resp !== 'franqueadora' ? 'selected' : ''}>Franqueado</option><option value="franqueadora" ${t.resp === 'franqueadora' ? 'selected' : ''}>Franqueadora</option></select><label class="col-span-6 sm:col-span-1 text-xs flex items-center gap-1"><input type="checkbox" name="validacao" ${t.validacao ? 'checked' : ''}> Valida</label><div class="col-span-6 sm:col-span-2 flex gap-1 justify-end"><button class="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-800 text-white">Salvar</button><button type="button" data-action="admin-remover-tarefa" data-fid="${f.id}" data-tid="${t.id}" class="text-xs font-semibold px-2 py-1.5 rounded-lg border border-rose-200 text-rose-600">✕</button></div></form>`).join('')}</div>
    <form data-form="admin-nova-tarefa" data-fid="${f.id}" class="mt-3 pt-3 border-t grid grid-cols-12 gap-2 items-center"><input name="titulo" placeholder="Nova tarefa…" required class="col-span-12 sm:col-span-6 px-3 py-2 rounded-lg border border-slate-300 text-sm"><input name="prazoDias" type="number" min="0" value="30" class="col-span-4 sm:col-span-1 px-2 py-2 rounded-lg border border-slate-300 text-sm"><select name="resp" class="col-span-8 sm:col-span-2 px-2 py-2 rounded-lg border border-slate-300 text-sm bg-white"><option value="franqueado">Franqueado</option><option value="franqueadora">Franqueadora</option></select><label class="col-span-6 sm:col-span-1 text-xs flex items-center gap-1"><input type="checkbox" name="validacao"> Valida</label><div class="col-span-6 sm:col-span-2 text-right"><button class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white">+ Adicionar</button></div></form></div>`)).join('')}</div>`;

  if (aba === 'treinamento') corpo = card(`<div class="p-5"><div class="font-bold mb-3">Módulos de treinamento</div><div class="space-y-2">${DB.modulos.map((m, i) => `<form data-form="admin-modulo" data-mid="${m.id}" class="flex gap-2 items-center"><span class="text-xs text-slate-400 font-bold w-5">${i + 1}</span><input name="titulo" value="${esc(m.titulo)}" required class="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"><input name="carga" value="${esc(m.carga)}" class="w-20 px-2 py-2 rounded-lg border border-slate-300 text-sm"><button class="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-800 text-white">Salvar</button><button type="button" data-action="admin-remover-modulo" data-mid="${m.id}" class="text-xs font-semibold px-2 py-1.5 rounded-lg border border-rose-200 text-rose-600">✕</button></form>`).join('')}</div>
    <form data-form="admin-novo-modulo" class="mt-3 pt-3 border-t flex gap-2 items-center"><input name="titulo" placeholder="Novo módulo…" required class="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"><input name="carga" value="2h" class="w-20 px-2 py-2 rounded-lg border border-slate-300 text-sm"><button class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 text-white">+ Adicionar</button></form></div>`);

  if (aba === 'config') corpo = `<div class="grid lg:grid-cols-2 gap-5">${card(`<form data-form="admin-config" class="p-5 space-y-3"><div class="font-bold">Identidade</div><div>${label('Nome da marca')}${input('marca', `value="${esc(DB.config.marca)}" required`)}</div>${btn('Salvar')}</form>`)}
    ${card(`<div class="p-5"><div class="font-bold mb-2">Dados</div><p class="text-sm text-slate-500 mb-3">Os dados ficam salvos no navegador (localStorage). Exporte um backup ou restaure a demonstração.</p><div class="flex gap-2 flex-wrap">${btnSec('⬇️ Exportar backup (JSON)', 'data-action="exportar-geral"')}${btn('Restaurar demonstração', 'data-action="reset-demo"', 'bg-rose-600 hover:bg-rose-700 text-white')}</div></div>`)}</div>`;

  return `${pageTitle('Administração', 'Cadastro de usuários, unidades, etapas, checklists e permissões.')}
    <div class="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl mb-5 overflow-x-auto">${abas.map(([k, t]) => `<a href="#/admin/${k}" class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${aba === k ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}">${t}</a>`).join('')}</div>${corpo}`;
}

/* ---------- Relatório ---------- */
function viewRelatorio(unit) {
  const prog = progressoUnidade(unit); const franq = getUser(unit.franqueadoId);
  return `<div class="no-print">${pageTitle('Relatório da implantação', 'Registro com datas, responsáveis e etapas concluídas.', btnSec('🖨️ Imprimir / salvar PDF', 'onclick="window.print()"') + btnSec('⬇️ Baixar JSON', `data-action="exportar-unidade" data-uid="${unit.id}"`))}</div>
    ${card(`<div class="p-6 md:p-8">
      <div class="flex flex-col md:flex-row md:justify-between gap-3 border-b pb-5 mb-5"><div><div class="text-[10px] font-bold tracking-widest text-brand-600">${esc(DB.config.marca).toUpperCase()} · RELATÓRIO DE IMPLANTAÇÃO</div><h2 class="text-2xl font-extrabold">${esc(unit.nome)}</h2><div class="text-sm text-slate-500">${esc(unit.cidade)} · Franqueado: ${esc(franq ? franq.nome : '—')}</div></div><div class="text-sm text-right"><div>Contrato: <b>${fmtDate(unit.contratoEm)}</b></div><div>Kickoff: <b>${fmtDate(unit.cofEm)}</b></div><div>Consultor de campo: <b>${esc(consultorCampo(unit) || '—')}</b></div><div>Inauguração: <b>${unit.inauguracao.concluida ? fmtDate(unit.inauguracao.data) : 'pendente'}</b></div><div>Progresso: <b>${prog.pct}%</b> · Etapa: <b>${esc(etapaUnidade(unit).label)}</b></div></div></div>
      ${getFrentes().map(f => { const p = progressoFrente(unit, f.id); return `<div class="mb-5"><div class="font-bold flex items-center gap-2">${f.emoji} ${esc(f.nome)} <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:${f.corSuave};color:${f.cor}">${p.done}/${p.total}</span></div><table class="w-full text-sm mt-2"><tbody class="divide-y">${f.tarefas.map(t => { const st = taskState(unit, f.id, t.id); return `<tr><td class="py-1.5 pr-2 w-6">${st.status === 'concluido' ? '✅' : st.status === 'em_validacao' ? '📤' : st.status === 'devolvido' ? '↩️' : '⬜'}</td><td class="py-1.5">${esc(t.titulo)}</td><td class="py-1.5 text-slate-500 text-xs text-right whitespace-nowrap">${st.status === 'concluido' ? fmtDateTime(st.concluidoEm) + (st.aprovadoPor ? ' · ' + esc(st.aprovadoPor) : '') : 'prazo ' + fmtDate(prazoTarefa(unit, t))}</td></tr>`; }).join('')}</tbody></table></div>`; }).join('')}
      <div class="mb-5"><div class="font-bold">✍️ Vendas</div><ul class="text-sm mt-1 space-y-0.5">${getVendasItens().map(v => `<li>${vendaFeita(unit, v.id) ? '✅' : '⬜'} ${esc(v.titulo)} <span class="text-slate-400 text-xs">· ${esc(v.area)}${v.quem ? ' (' + esc(v.quem) + ')' : ''}${vendaFeita(unit, v.id) ? ' · ' + fmtDateTime(unit.vendas[v.id].concluidoEm) : ''}</span></li>`).join('')}</ul></div>
      <div class="mb-5"><div class="font-bold">🤝 Kickoff</div><ul class="text-sm mt-1 space-y-0.5">${getKickoffItens().map(i => `<li>${kickoffFeito(unit, i) ? '✅' : '⬜'} ${esc(i.titulo)}${i.tipo === 'nome' && consultorCampo(unit) ? ': ' + esc(consultorCampo(unit)) : ''}${i.tipo === 'reuniao' && unit.cofEm ? ' <span class="text-slate-400 text-xs">· ' + fmtDate(unit.cofEm) + '</span>' : ''}</li>`).join('')}</ul></div>
      <div class="mb-5"><div class="font-bold">🎓 Treinamento</div><div class="text-sm text-slate-600 mt-1">${unit.treinamento.agenda ? `Realizado em ${fmtDate(unit.treinamento.agenda.data)} · ${esc(unit.treinamento.agenda.local)} · instrutor ${esc(unit.treinamento.agenda.instrutor || '—')}` : 'Não agendado.'} · Módulos: ${modulosFeitos(unit)}/${DB.modulos.length} · Presença: ${unit.treinamento.presenca ? 'confirmada' : 'pendente'}</div></div>
      <div class="mb-5"><div class="font-bold">🏪 Abertura</div><ul class="text-sm mt-1 space-y-0.5">${itensAbertura(unit).map(i => `<li>${i.ok ? '✅' : '⬜'} ${esc(i.titulo)}</li>`).join('')}</ul></div>
      <div class="mb-5"><div class="font-bold">📈 Pós-inauguração</div><ul class="text-sm mt-1 space-y-0.5">${itensPosInauguracao(unit).map(i => `<li>${i.ok ? '✅' : '⬜'} ${esc(i.titulo)}${i.responsavel ? ' <span class="text-slate-400 text-xs">· ' + esc(i.responsavel) + '</span>' : ''}${i.prazo ? ' <span class="text-slate-400 text-xs">· ' + fmtDate(i.prazo) + '</span>' : ''}</li>`).join('')}</ul></div>
      <div><div class="font-bold">🕓 Histórico</div><ul class="text-sm mt-1 space-y-1">${unit.timeline.slice(0, 40).map(e => `<li class="text-slate-600"><span class="text-slate-400">${fmtDateTime(e.data)}</span> · ${esc(e.usuario)}: ${esc(e.texto)}</li>`).join('')}</ul></div>
    </div>`)}`;
}

/* ---------- Ajuda ---------- */
function viewAjuda() {
  const itens = [
    ['🗺️', 'Como funciona a jornada?', 'Após a assinatura do contrato e a reunião introdutória (kickoff), as frentes de implantação começam em paralelo. Cada frente tem um personagem que avança a cada tarefa concluída. Quando todas terminam, os personagens se encontram no treinamento e a loja segue para a abertura e a festa de inauguração.'],
    ['✓', 'O que acontece quando marco uma tarefa?', 'Tarefas simples ficam concluídas na hora. Tarefas que exigem validação vão para a franqueadora, que pode aprovar ou devolver para ajuste com um comentário.'],
    ['📎', 'Como anexo documentos?', 'Em qualquer tarefa use "Anexar documento". O arquivo vai para a franqueadora avaliar, que aprova ou pede ajuste. Todos os documentos ficam reunidos na página Documentos.'],
    ['⏰', 'Como são calculados os prazos?', 'Cada tarefa tem um prazo em dias contado a partir da data da reunião introdutória (kickoff). Tarefas vencidas aparecem em vermelho e mudam o status da unidade para "Atenção".'],
    ['🔔', 'Onde vejo os avisos?', 'No sino do topo da página: novas tarefas, prazos próximos, comentários, devoluções e aprovações.'],
  ];
  return `${pageTitle('Ajuda', 'Dúvidas frequentes sobre a plataforma.')}<div class="space-y-3">${itens.map(([e, t, d]) => card(`<details class="p-5 group"><summary class="flex items-center gap-3 font-bold"><span class="text-xl">${e}</span>${t}<span class="ml-auto text-slate-400 group-open:rotate-180 transition">▾</span></summary><p class="text-sm text-slate-600 mt-3 pl-9">${d}</p></details>`)).join('')}</div>
    ${card(`<div class="p-5 mt-5"><div class="font-bold">Precisa de apoio?</div><p class="text-sm text-slate-600 mt-1">Fale com seu consultor de implantação pelos comentários de cada tarefa ou pelo e-mail <b>consultor@franqueadora.com</b>.</p></div>`)}`;
}
