/* =====================================================================
   NÚCLEO — armazenamento, sessão, utilitários e regras de negócio
   ===================================================================== */
const DB_KEY = 'implantacao_franquias_v1';
const SESSION_KEY = 'implantacao_sessao_v1';
let DB = null;
const session = { user: null };
const ctx = { unit: null, base: '' };   // unidade em contexto e prefixo de rota (#/u/:id)

/* ---------- Armazenamento ---------- */
function loadDB() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) { DB = JSON.parse(raw); return; } } catch (e) { /* ignora */ }
  DB = criarBancoDemo(); saveDB();
}
function saveDB() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
function resetDemo() { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); loadDB(); session.user = null; location.hash = '#/login'; }

/* ---------- Sessão ---------- */
function loadSession() { const id = localStorage.getItem(SESSION_KEY); session.user = DB.users.find(u => u.id === id) || null; }
function entrar(email, senha) {
  const u = DB.users.find(x => x.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!u) return { erro: 'E-mail não encontrado.' };
  if (!u.senha) return { erro: 'Este acesso ainda não foi ativado. Use "Primeiro acesso" para criar sua senha.' };
  if (u.senha !== senha) return { erro: 'Senha incorreta.' };
  session.user = u; localStorage.setItem(SESSION_KEY, u.id);
  return { ok: true };
}
function sair() { session.user = null; localStorage.removeItem(SESSION_KEY); location.hash = '#/login'; }
const isFranqueado = () => session.user && session.user.perfil === 'franqueado';
const isFranqueadora = () => session.user && (session.user.perfil === 'franqueadora' || session.user.perfil === 'admin');
const isAdmin = () => session.user && session.user.perfil === 'admin';
const papelAtual = () => isFranqueado() ? 'franqueado' : 'franqueadora';

/* ---------- Utilitários ---------- */
function localISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const todayISO = () => localISO(new Date());
function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return localISO(d); }
function diffDays(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000); }
function fmtDate(iso) { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d}/${m}/${y}`; }
function fmtDateTime(iso) { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtBytes(b) { if (!b && b !== 0) return ''; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(0) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function uid(p = 'id') { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function iniciais(nome) { return String(nome || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join(''); }
function link(path) { return '#' + ctx.base + '/' + path.replace(/^\/+/, ''); }

/* ---------- Acesso aos dados ---------- */
const getFrentes = () => DB.frentes;
const getFrente = fid => DB.frentes.find(f => f.id === fid);
const getUnidade = id => DB.unidades.find(u => u.id === id);
const getUser = id => DB.users.find(u => u.id === id);
const unidadeDoUsuario = u => u && u.unidadeId ? getUnidade(u.unidadeId) : null;

function taskState(unit, fid, tid) {
  const s = (unit.tarefas[fid] || {})[tid];
  return s || { status: 'pendente', anexos: [], comentarios: [] };
}
function setTaskState(unit, fid, tid, patch) {
  unit.tarefas[fid] = unit.tarefas[fid] || {};
  unit.tarefas[fid][tid] = Object.assign({ status: 'pendente', anexos: [], comentarios: [] }, unit.tarefas[fid][tid] || {}, patch);
  return unit.tarefas[fid][tid];
}
function prazoTarefa(unit, task) { return unit.cofEm ? addDays(unit.cofEm, task.prazoDias || 0) : null; }
function tarefaAtrasada(unit, task, st) {
  st = st || taskState(unit, task.frenteId || '', task.id);
  const prazo = prazoTarefa(unit, task);
  return !!(prazo && st.status !== 'concluido' && prazo < todayISO());
}

/* ---------- Progresso ---------- */
function progressoFrente(unit, fid) {
  const f = getFrente(fid); const total = f.tarefas.length;
  let done = 0, emValidacao = 0, atrasadas = 0, devolvidas = 0, proxima = null;
  f.tarefas.forEach(t => {
    const st = taskState(unit, fid, t.id);
    if (st.status === 'concluido') done++;
    else {
      if (st.status === 'em_validacao') emValidacao++;
      if (st.status === 'devolvido') devolvidas++;
      if (prazoTarefa(unit, t) && prazoTarefa(unit, t) < todayISO()) atrasadas++;
      if (!proxima) proxima = t;
    }
  });
  return { done, total, pct: total ? Math.round(done / total * 100) : 0, emValidacao, atrasadas, devolvidas, proxima, completa: done === total };
}
function treinamentoLiberado(unit) { return !!unit.cofEm && getFrentes().every(f => progressoFrente(unit, f.id).completa); }
function modulosFeitos(unit) { return DB.modulos.filter(m => unit.treinamento.modulos[m.id]).length; }
function treinamentoConcluido(unit) { return treinamentoLiberado(unit) && modulosFeitos(unit) === DB.modulos.length && unit.treinamento.presenca; }
function itensAbertura(unit) {
  return [
    { id: 'legal',  titulo: 'Documentação legal validada', ok: progressoFrente(unit, 'legal').completa, origem: 'frente/legal', auto: true },
    { id: 'loja',   titulo: 'Loja pronta para operação', ok: progressoFrente(unit, 'abertura').completa && progressoFrente(unit, 'projeto').completa, origem: 'frente/abertura', auto: true },
    { id: 'pdv',    titulo: 'Sistema PDV testado', ok: progressoFrente(unit, 'pdv').completa, origem: 'frente/pdv', auto: true },
    { id: 'equipe', titulo: 'Equipe treinada', ok: treinamentoConcluido(unit), origem: 'treinamento', auto: true },
    { id: 'final',  titulo: 'Validação final do consultor', ok: unit.abertura.validacaoFinal, origem: 'abertura', auto: false },
  ];
}
function aberturaPronta(unit) { return itensAbertura(unit).every(i => i.ok); }
function progressoUnidade(unit) {
  let done = 0, total = 0; const porFrente = {};
  getFrentes().forEach(f => { const p = progressoFrente(unit, f.id); porFrente[f.id] = p; done += p.done; total += p.total; });
  total += DB.modulos.length + 1; done += modulosFeitos(unit) + (unit.treinamento.presenca ? 1 : 0);
  total += 2; done += (unit.abertura.validacaoFinal ? 1 : 0) + (unit.inauguracao.concluida ? 1 : 0);
  return { done, total, pct: total ? Math.round(done / total * 100) : 0, porFrente };
}
function etapaUnidade(unit) {
  if (unit.inauguracao.concluida) return { key: 'inaugurada', label: 'Inaugurada' };
  if (!unit.cofEm) return { key: 'cof', label: 'Aguardando COF' };
  if (treinamentoConcluido(unit)) return { key: 'abertura', label: 'Abertura de loja' };
  if (treinamentoLiberado(unit)) return { key: 'treinamento', label: 'Treinamento' };
  const ativas = getFrentes().filter(f => { const p = progressoFrente(unit, f.id); return p.done > 0 && !p.completa; });
  const pend = ativas.length ? ativas : getFrentes().filter(f => !progressoFrente(unit, f.id).completa);
  return { key: 'frentes', label: pend.slice(0, 2).map(f => f.curto).join(' / ') || 'Frentes' };
}
function validacoesPendentes(unit) {
  const out = [];
  getFrentes().forEach(f => f.tarefas.forEach(t => { if (taskState(unit, f.id, t.id).status === 'em_validacao') out.push({ frente: f, tarefa: t, st: taskState(unit, f.id, t.id) }); }));
  return out;
}
function tarefasAtrasadas(unit) {
  const out = [];
  if (!unit.cofEm || unit.inauguracao.concluida) return out;
  getFrentes().forEach(f => f.tarefas.forEach(t => { const st = taskState(unit, f.id, t.id); if (st.status !== 'concluido' && prazoTarefa(unit, t) < todayISO()) out.push({ frente: f, tarefa: t, st }); }));
  return out;
}
function statusUnidade(unit) {
  if (unit.inauguracao.concluida) return { key: 'inaugurada', label: 'Inaugurada', cls: 'bg-emerald-100 text-emerald-700' };
  if (!unit.cofEm) return { key: 'aguardando_cof', label: 'Aguardando COF', cls: 'bg-slate-200 text-slate-700' };
  if (tarefasAtrasadas(unit).length) return { key: 'atencao', label: 'Atenção', cls: 'bg-rose-100 text-rose-700' };
  if (validacoesPendentes(unit).length || (aberturaPronta(unit) === false && treinamentoConcluido(unit) && !unit.abertura.validacaoFinal)) return { key: 'validacao', label: 'Aguardando validação', cls: 'bg-amber-100 text-amber-700' };
  return { key: 'em_andamento', label: 'Em andamento', cls: 'bg-sky-100 text-sky-700' };
}
function proximaAcao(unit) {
  if (unit.inauguracao.concluida) return { texto: 'Jornada concluída! 🎉', rota: 'abertura' };
  if (!unit.cofEm) return { texto: 'Participar da reunião da COF', rota: 'painel', resp: 'franqueadora' };
  // devolvidas primeiro, depois atrasadas, depois a primeira pendente de responsabilidade do franqueado
  const cand = [];
  getFrentes().forEach(f => f.tarefas.forEach(t => {
    const st = taskState(unit, f.id, t.id);
    if (st.status === 'concluido' || st.status === 'em_validacao') return;
    const peso = (st.status === 'devolvido' ? 0 : 2) + (prazoTarefa(unit, t) < todayISO() ? 0 : 1) + (t.resp === 'franqueadora' ? 10 : 0);
    cand.push({ peso, prazo: prazoTarefa(unit, t), texto: t.titulo, rota: 'frente/' + f.id, frente: f, resp: t.resp || 'franqueado', status: st.status });
  }));
  if (cand.length) { cand.sort((a, b) => a.peso - b.peso || a.prazo.localeCompare(b.prazo)); return cand[0]; }
  if (!treinamentoConcluido(unit)) {
    if (!unit.treinamento.agenda) return { texto: 'Agendar o treinamento da equipe', rota: 'treinamento', resp: 'franqueadora' };
    if (modulosFeitos(unit) < DB.modulos.length) return { texto: 'Concluir os módulos de treinamento', rota: 'treinamento' };
    return { texto: 'Confirmar presença da equipe no treinamento', rota: 'treinamento' };
  }
  if (!unit.abertura.validacaoFinal) return { texto: 'Validação final do consultor', rota: 'abertura', resp: 'franqueadora' };
  if (!unit.inauguracao.data) return { texto: 'Definir a data da Festa de Inauguração', rota: 'abertura' };
  return { texto: 'Confirmar a Festa de Inauguração', rota: 'abertura' };
}

/* ---------- Histórico e notificações ---------- */
function registrar(unit, texto, tipo = 'info', extra = {}) {
  unit.timeline.unshift({ id: uid('ev'), data: new Date().toISOString(), usuario: session.user ? session.user.nome : 'Sistema', perfil: session.user ? session.user.perfil : 'sistema', texto, tipo, ...extra });
}
function notificar(unit, para, texto, rota) {
  const linkAbs = para === 'franqueado' ? '#/' + rota : '#/u/' + unit.id + '/' + rota;
  unit.notificacoes.unshift({ id: uid('nt'), para, texto, link: linkAbs, data: new Date().toISOString(), lida: false });
}
function minhasNotificacoes() {
  const papel = papelAtual(); const out = [];
  DB.unidades.forEach(u => {
    if (papel === 'franqueado' && u.id !== session.user.unidadeId) return;
    u.notificacoes.filter(n => n.para === papel).forEach(n => out.push({ ...n, unidade: u }));
  });
  return out.sort((a, b) => b.data.localeCompare(a.data));
}

/* ---------- Ações de negócio ---------- */
function concluirTarefa(unit, fid, tid) {
  const f = getFrente(fid); const t = f.tarefas.find(x => x.id === tid); const st = taskState(unit, fid, tid);
  if (isFranqueado() && t.validacao) {
    setTaskState(unit, fid, tid, { status: 'em_validacao', enviadoEm: new Date().toISOString(), devolucao: null });
    registrar(unit, `Enviou "${t.titulo}" para validação.`, 'validacao', { frente: fid });
    notificar(unit, 'franqueadora', `${unit.nome} enviou "${t.titulo}" para validação.`, 'frente/' + fid);
    return 'em_validacao';
  }
  setTaskState(unit, fid, tid, { status: 'concluido', concluidoEm: new Date().toISOString(), devolucao: null });
  registrar(unit, `Concluiu "${t.titulo}" (${f.nome}).`, 'concluido', { frente: fid });
  if (isFranqueadora()) notificar(unit, 'franqueado', `"${t.titulo}" foi marcada como concluída pela franqueadora.`, 'frente/' + fid);
  else if (st.status === 'devolvido') notificar(unit, 'franqueadora', `${unit.nome} refez "${t.titulo}".`, 'frente/' + fid);
  verificarMarcos(unit, fid);
  return 'concluido';
}
function aprovarTarefa(unit, fid, tid) {
  const f = getFrente(fid); const t = f.tarefas.find(x => x.id === tid);
  setTaskState(unit, fid, tid, { status: 'concluido', concluidoEm: new Date().toISOString(), aprovadoPor: session.user.nome, devolucao: null });
  registrar(unit, `Aprovou "${t.titulo}" (${f.nome}).`, 'aprovado', { frente: fid });
  notificar(unit, 'franqueado', `"${t.titulo}" foi aprovada por ${session.user.nome}.`, 'frente/' + fid);
  verificarMarcos(unit, fid);
}
function devolverTarefa(unit, fid, tid, motivo) {
  const f = getFrente(fid); const t = f.tarefas.find(x => x.id === tid);
  const st = setTaskState(unit, fid, tid, { status: 'devolvido', devolucao: { motivo, por: session.user.nome, data: new Date().toISOString() } });
  st.comentarios.push({ id: uid('c'), autor: session.user.nome, perfil: session.user.perfil, data: new Date().toISOString(), texto: 'Devolvido para ajuste: ' + motivo });
  registrar(unit, `Devolveu "${t.titulo}" para ajuste: ${motivo}`, 'devolvido', { frente: fid });
  notificar(unit, 'franqueado', `"${t.titulo}" foi devolvida para ajuste. Veja o motivo.`, 'frente/' + fid);
}
function reabrirTarefa(unit, fid, tid) {
  const f = getFrente(fid); const t = f.tarefas.find(x => x.id === tid);
  setTaskState(unit, fid, tid, { status: 'pendente', concluidoEm: null });
  registrar(unit, `Reabriu "${t.titulo}" (${f.nome}).`, 'info', { frente: fid });
  notificar(unit, 'franqueado', `"${t.titulo}" foi reaberta pela franqueadora.`, 'frente/' + fid);
}
function verificarMarcos(unit, fid) {
  const f = getFrente(fid);
  if (progressoFrente(unit, fid).completa) {
    registrar(unit, `🎯 Frente "${f.nome}" concluída! O personagem chegou à área de treinamento.`, 'marco', { frente: fid });
    notificar(unit, 'franqueado', `Frente "${f.nome}" concluída. ${f.emoji} chegou à área de treinamento!`, 'jornada');
    if (treinamentoLiberado(unit)) {
      registrar(unit, '🎓 Todas as frentes concluídas. Treinamento liberado!', 'marco');
      notificar(unit, 'franqueado', 'Todas as frentes foram concluídas. O treinamento está liberado!', 'treinamento');
      notificar(unit, 'franqueadora', `${unit.nome} concluiu todas as frentes. Agende o treinamento.`, 'treinamento');
    }
  }
}
