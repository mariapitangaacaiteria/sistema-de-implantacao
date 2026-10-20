/* =====================================================================
   DADOS BASE — frentes, checklists, módulos de treinamento e dados demo
   Tudo aqui pode ser editado pela franqueadora na área de administração.
   ===================================================================== */

const FRENTES_PADRAO = [
  {
    id: 'projeto', nome: 'Projeto Arquitetônico', curto: 'Projeto', emoji: '🏗️',
    cor: '#f59e0b', corSuave: '#fef3c7', personagem: 'Capacete de obra',
    descricao: 'Planta, hidráulica, elétrica, cozinha e salão validados antes da obra começar.',
    responsavel: 'Franqueado', apoio: 'Arquiteto e consultor',
    tarefas: [
      { id: 'medidas',    titulo: 'Enviar medidas e informações do imóvel', prazoDias: 7,  anexo: true,
        instrucoes: 'Envie a planta do imóvel com medidas, fotos do espaço e o endereço completo. Se houver projeto anterior, anexe também.' },
      { id: 'planta',     titulo: 'Validar planta baixa', prazoDias: 14, validacao: true,
        instrucoes: 'A franqueadora envia a planta baixa proposta. Revise com atenção e marque como concluída para enviar sua aprovação para validação.' },
      { id: 'hidraulica', titulo: 'Aprovar projeto hidráulico', prazoDias: 21,
        instrucoes: 'Confira pontos de água, esgoto e caixa de gordura conforme o padrão da marca.' },
      { id: 'eletrica',   titulo: 'Aprovar projeto elétrico', prazoDias: 21,
        instrucoes: 'Confira a carga elétrica, pontos de tomada dos equipamentos e iluminação.' },
      { id: 'cozinha',    titulo: 'Validar projeto da cozinha', prazoDias: 28,
        instrucoes: 'Verifique o fluxo de produção, posição dos equipamentos e exaustão.' },
      { id: 'salao',      titulo: 'Validar projeto do salão', prazoDias: 28,
        instrucoes: 'Verifique layout de mesas, balcão de atendimento, comunicação visual e acessibilidade.' },
      { id: 'obra',       titulo: 'Concluir reforma / obra e enviar fotos', prazoDias: 75, anexo: true, validacao: true,
        instrucoes: 'Ao finalizar a obra, envie fotos de todos os ambientes para validação do consultor.' },
    ],
  },
  {
    id: 'investimento', nome: 'Plano de Investimento', curto: 'Investimento', emoji: '💰',
    cor: '#10b981', corSuave: '#d1fae5', personagem: 'Calculadora e moedas',
    descricao: 'Confirmação do plano, orientação do consultor e lista para compra.',
    responsavel: 'Franqueado', apoio: 'Consultor financeiro',
    tarefas: [
      { id: 'recebimento', titulo: 'Confirmar recebimento do plano de investimento', prazoDias: 3,
        instrucoes: 'Leia o plano de investimento enviado pela franqueadora e confirme o recebimento.' },
      { id: 'orientacao',  titulo: 'Reunião de orientação com o consultor', prazoDias: 10, resp: 'franqueadora',
        instrucoes: 'O consultor agenda a reunião para explicar o cronograma de desembolsos e as etapas de compra.' },
      { id: 'lista',       titulo: 'Receber lista para compra (equipamentos, mobiliário e insumos)', prazoDias: 15, resp: 'franqueadora',
        instrucoes: 'A franqueadora disponibiliza a lista oficial com fornecedores homologados.' },
      { id: 'compras',     titulo: 'Realizar compras e enviar comprovantes', prazoDias: 60, anexo: true, validacao: true,
        instrucoes: 'Compre conforme a lista oficial e anexe os comprovantes de cada item para validação.' },
    ],
  },
  {
    id: 'pdv', nome: 'Sistema PDV', curto: 'Sistema PDV', emoji: '🖥️',
    cor: '#0ea5e9', corSuave: '#e0f2fe', personagem: 'Computador e leitor',
    descricao: 'Documentação, instalação e teste do sistema de ponto de venda.',
    responsavel: 'Franqueado', apoio: 'Equipe de TI da franqueadora',
    tarefas: [
      { id: 'docs',        titulo: 'Receber lista de documentações para implantação do sistema', prazoDias: 5, resp: 'franqueadora',
        instrucoes: 'A equipe de TI envia a relação de documentos e requisitos técnicos (internet, equipamentos, certificado digital).' },
      { id: 'envio',       titulo: 'Enviar documentações para o sistema PDV', prazoDias: 15, anexo: true, validacao: true,
        instrucoes: 'Anexe CNPJ, contrato social, certificado digital e dados bancários para emissão fiscal.' },
      { id: 'agendamento', titulo: 'Agendar instalação do sistema PDV', prazoDias: 40,
        instrucoes: 'Combine com a equipe de TI a data da instalação, após a conclusão da parte elétrica.' },
      { id: 'instalacao',  titulo: 'Instalação do sistema PDV', prazoDias: 70,
        instrucoes: 'Acompanhe a instalação dos terminais, impressoras e leitores.' },
      { id: 'teste',       titulo: 'Testar sistema PDV (vendas, pagamentos e relatórios)', prazoDias: 75,
        instrucoes: 'Realize vendas de teste em todas as formas de pagamento e emita um relatório de fechamento.' },
    ],
  },
  {
    id: 'contratacao', nome: 'Contratações', curto: 'Contratação', emoji: '👥',
    cor: '#8b5cf6', corSuave: '#ede9fe', personagem: 'Crachá de equipe',
    descricao: 'Definição do quadro, entrevistas e contratação da equipe.',
    responsavel: 'Franqueado', apoio: 'RH da franqueadora',
    tarefas: [
      { id: 'quadro',      titulo: 'Definir quadro de funcionários com o consultor', prazoDias: 10,
        instrucoes: 'Defina cargos, quantidade de pessoas por turno e faixa salarial com apoio do consultor.' },
      { id: 'vagas',       titulo: 'Divulgar vagas', prazoDias: 20,
        instrucoes: 'Utilize os modelos de anúncio da franqueadora para divulgar as vagas.' },
      { id: 'entrevistas', titulo: 'Entrevista com candidatos', prazoDias: 40,
        instrucoes: 'Use o roteiro de entrevista padrão e registre os candidatos aprovados.' },
      { id: 'contratacao', titulo: 'Contratação (enviar lista de contratados)', prazoDias: 55, anexo: true, validacao: true,
        instrucoes: 'Envie a lista com nome, cargo e data de início de cada contratado para validação.' },
      { id: 'registro',    titulo: 'Exames admissionais e registro em carteira', prazoDias: 65, anexo: true,
        instrucoes: 'Anexe os comprovantes de registro de cada funcionário.' },
    ],
  },
  {
    id: 'legal', nome: 'Alvarás e Documentações', curto: 'Documentação', emoji: '📄',
    cor: '#f43f5e', corSuave: '#ffe4e6', personagem: 'Pasta com checklist',
    descricao: 'Toda a documentação necessária para o funcionamento legal da loja.',
    responsavel: 'Franqueado', apoio: 'Contador e jurídico da franqueadora',
    tarefas: [
      { id: 'lista',     titulo: 'Receber lista de documentações para o funcionamento legal', prazoDias: 5, resp: 'franqueadora',
        instrucoes: 'A franqueadora envia a lista oficial de documentos exigidos no município da loja.' },
      { id: 'cnpj',      titulo: 'Abertura de CNPJ e inscrições (estadual e municipal)', prazoDias: 20, anexo: true,
        instrucoes: 'Abra a empresa com o contador e anexe o cartão CNPJ.' },
      { id: 'alvara',    titulo: 'Alvará de funcionamento', prazoDias: 60, anexo: true,
        instrucoes: 'Solicite na prefeitura e anexe o protocolo ou o alvará emitido.' },
      { id: 'sanitario', titulo: 'Alvará sanitário (vigilância)', prazoDias: 60, anexo: true,
        instrucoes: 'Solicite a vistoria da vigilância sanitária após a conclusão da cozinha.' },
      { id: 'bombeiros', titulo: 'AVCB / Certificado dos Bombeiros', prazoDias: 60, anexo: true,
        instrucoes: 'Contrate o projeto de prevenção contra incêndio e solicite a vistoria.' },
      { id: 'validacao', titulo: 'Enviar documentação completa para validação', prazoDias: 70, anexo: true, validacao: true,
        instrucoes: 'Com todos os documentos em mãos, envie o conjunto completo para validação jurídica.' },
    ],
  },
  {
    id: 'marketing', nome: 'Marketing Inaugural', curto: 'Marketing', emoji: '📣',
    cor: '#ec4899', corSuave: '#fce7f3', personagem: 'Megafone',
    descricao: 'Reunião de marketing, brindes, artes, redes sociais e tráfego pago para a inauguração.',
    responsavel: 'Franqueado e equipe de marketing', apoio: 'Equipe de marketing da franqueadora (Lais e Sérgio)',
    tarefas: [
      { id: 'reuniao',  titulo: 'Realização da Reunião de MKT Inaugural', prazoDias: 15, resp: 'franqueadora',
        instrucoes: 'A equipe de marketing da franqueadora reúne o franqueado para alinhar o plano de inauguração.' },
      { id: 'brindes',  titulo: 'Solicitação de Brindes e Pitanguinha', prazoDias: 40,
        instrucoes: 'Solicite à franqueadora os brindes e a Pitanguinha para a inauguração.' },
      { id: 'desconto', titulo: 'Solicitação de Desconto', prazoDias: 45,
        instrucoes: 'Solicite à franqueadora as promoções e descontos que valerão na inauguração.' },
      { id: 'artes',    titulo: 'Solicitação de Artes', prazoDias: 45,
        instrucoes: 'Solicite as artes de divulgação (posts, panfletos, cardápios e fachada) à equipe de marketing.' },
      { id: 'instagram', titulo: 'Instagram (primeiras postagens)', prazoDias: 75, resp: 'franqueadora', quem: 'Lais',
        instrucoes: 'Lais publica as primeiras postagens da unidade no Instagram antes da inauguração.' },
      { id: 'trafego',  titulo: 'Tráfego Pago', prazoDias: 75, resp: 'franqueadora', quem: 'Sérgio',
        instrucoes: 'Sérgio configura e ativa as campanhas de tráfego pago da inauguração.' },
      { id: 'maps',     titulo: 'Google Maps (pós-inauguração)', prazoDias: 7, resp: 'franqueadora', quem: 'Lais', pos: true,
        instrucoes: 'Até 7 dias após a inauguração, Lais cadastra e valida a unidade no Google Maps.' },
    ],
  },
  {
    id: 'abertura', nome: 'Abertura de Loja', curto: 'Abertura', emoji: '🏪',
    cor: '#f97316', corSuave: '#ffedd5', personagem: 'Chave da loja',
    descricao: 'Preparação final da loja e validação do consultor para o treinamento.',
    responsavel: 'Franqueado', apoio: 'Consultor de implantação',
    tarefas: [
      { id: 'layout',  titulo: 'Checklist de loja pronta (layout, mobiliário, sinalização e fachada)', prazoDias: 80, anexo: true,
        instrucoes: 'Percorra o checklist de loja pronta e anexe fotos da fachada, salão e cozinha finalizados.' },
      { id: 'pedido',  titulo: 'Realizar o primeiro pedido', prazoDias: 80,
        instrucoes: 'Faça o pedido inicial de insumos e embalagens com a lista sugerida pela franqueadora, a tempo de receber antes do treinamento.' },
      { id: 'estoque', titulo: 'Receber estoque inicial', prazoDias: 85,
        instrucoes: 'Confira o recebimento do pedido inicial de insumos e embalagens.' },
      { id: 'validacao_treinamento', titulo: 'Validação do consultor para treinamento', prazoDias: 85, resp: 'franqueadora',
        instrucoes: 'O consultor faz a visita técnica e libera a unidade para o treinamento da equipe.' },
    ],
  },
];

// Checklist da etapa Vendas (antes do kickoff). "quem" é a pessoa ou área responsável.
const VENDAS_PADRAO = [
  { id: 'candidato',      titulo: 'Validação do candidato',            area: 'Assistente de vendas', quem: 'Débora' },
  { id: 'negociacao',     titulo: 'Reunião de negociação',             area: 'Diretoria comercial' },
  { id: 'emissao_cof',    titulo: 'Emissão da COF',                    area: 'Diretoria de marketing / jurídico' },
  { id: 'assinatura_cof', titulo: 'Assinatura da COF',                 area: 'Diretoria de marketing / jurídico' },
  { id: 'cadastro',       titulo: 'Cadastro da unidade nos sistemas',  area: 'Gerência de operações' },
  { id: 'grupo',          titulo: 'Criação do grupo da unidade',       area: 'CRM' },
];

// Checklist da etapa Kickoff. "reuniao" libera as frentes (define unit.cofEm); "nome" guarda um texto por unidade.
const KICKOFF_PADRAO = [
  { id: 'reuniao',           titulo: 'Reunião introdutória', tipo: 'reuniao', desc: 'Libera as frentes de implantação. Os prazos das tarefas contam a partir desta data.' },
  { id: 'agenda_financeiro', titulo: 'Agenda com o financeiro' },
  { id: 'agenda_consultor',  titulo: 'Agenda com o consultor' },
  { id: 'ead',               titulo: 'Treinamento introdutório EAD (módulo financeiro e módulo expedição)' },
  { id: 'consultor',         titulo: 'Consultor de campo', tipo: 'nome', desc: 'Nome do consultor de campo responsável por esta unidade.' },
];

// Checklist da Pós-inauguração. "dias" conta a partir da data da inauguração.
const POS_PADRAO = [
  { id: 'acomp15', titulo: 'Reunião de acompanhamento 15 dias', dias: 15, resp: 'Consultor de campo' },
  { id: 'acomp30', titulo: 'Reunião de acompanhamento 30 dias', dias: 30, resp: 'Consultor de campo' },
  { id: 'acomp60', titulo: 'Reunião de acompanhamento 60 dias', dias: 60, resp: 'Consultor de campo' },
];

const MODULOS_PADRAO = [
  { id: 'cultura',     titulo: 'Cultura e padrões da marca',          carga: '4h' },
  { id: 'atendimento', titulo: 'Atendimento ao cliente',              carga: '4h' },
  { id: 'pdv',         titulo: 'Operação do sistema PDV',             carga: '3h' },
  { id: 'producao',    titulo: 'Produção, cozinha e segurança alimentar', carga: '8h' },
  { id: 'gestao',      titulo: 'Gestão financeira e rotinas da loja', carga: '4h' },
  { id: 'avaliacao',   titulo: 'Avaliação final da equipe',           carga: '2h' },
];

/* ---------- Dados de demonstração ---------- */
function _diasAtras(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function _diasFrente(n) { return _diasAtras(-n); }

function _unidade(cfg) {
  const u = {
    id: cfg.id, nome: cfg.nome, cidade: cfg.cidade, franqueadoId: cfg.franqueadoId,
    contratoEm: cfg.contratoEm, cofEm: cfg.cofEm || null,
    tarefas: {}, timeline: [], notificacoes: [],
    vendas: {}, kickoff: {}, pos: {},
    treinamento: { agenda: cfg.agenda || null, modulos: {}, presenca: false, concluidoEm: null },
    abertura: { validacaoFinal: false, validacaoFinalEm: null },
    inauguracao: { data: cfg.inauguracaoData || null, concluida: !!cfg.inaugurada, concluidaEm: cfg.inaugurada ? cfg.inauguracaoData : null },
  };
  (cfg.vendasFeitas || VENDAS_PADRAO.map(v => v.id)).forEach((vid, i) => u.vendas[vid] = { concluidoEm: _diasAtras(Math.max(0, 10 - i)) + 'T10:00:00', por: 'Equipe de vendas' });
  if (cfg.cofEm) { ['agenda_financeiro', 'agenda_consultor', 'ead'].forEach(k => u.kickoff[k] = { concluidoEm: cfg.cofEm + 'T14:00:00', por: 'Carla Mendes' });
    if (cfg.consultor) u.kickoff.consultor = { valor: cfg.consultor, concluidoEm: cfg.cofEm + 'T14:00:00', por: 'Carla Mendes' }; }
  const feitas = cfg.feitas || {};
  const validacao = cfg.emValidacao || {};
  FRENTES_PADRAO.forEach(f => {
    u.tarefas[f.id] = {};
    (feitas[f.id] || []).forEach((tid, i) => {
      u.tarefas[f.id][tid] = { status: 'concluido', concluidoEm: _diasAtras(30 - i * 3) + 'T10:00:00', anexos: [], comentarios: [] };
    });
    (validacao[f.id] || []).forEach(tid => {
      u.tarefas[f.id][tid] = { status: 'em_validacao', enviadoEm: _diasAtras(2) + 'T15:30:00', anexos: [], comentarios: [] };
    });
  });
  if (cfg.inaugurada) u.pos.acomp15 = { concluidoEm: _diasAtras(25) + 'T10:00:00', por: 'Carla Mendes' };
  if (cfg.modulosFeitos) cfg.modulosFeitos.forEach(m => u.treinamento.modulos[m] = true);
  if (cfg.treinamentoConcluido) { MODULOS_PADRAO.forEach(m => u.treinamento.modulos[m.id] = true); u.treinamento.presenca = true; u.treinamento.concluidoEm = _diasAtras(10) + 'T18:00:00'; }
  if (cfg.validacaoFinal) { u.abertura.validacaoFinal = true; u.abertura.validacaoFinalEm = _diasAtras(45) + 'T11:00:00'; }
  if (cfg.inaugurada) {
    FRENTES_PADRAO.forEach(f => f.tarefas.forEach(t => (!t.pos || cfg.posConcluido) && (u.tarefas[f.id][t.id] = { status: 'concluido', concluidoEm: _diasAtras(60) + 'T10:00:00', anexos: [], comentarios: [] })));
  }
  u.timeline.push({ id: 'ev_' + cfg.id + '_1', data: cfg.contratoEm + 'T09:00:00', usuario: 'Sistema', perfil: 'sistema', texto: 'Contrato de franquia assinado. Unidade criada.', tipo: 'marco' });
  if (cfg.cofEm) u.timeline.push({ id: 'ev_' + cfg.id + '_2', data: cfg.cofEm + 'T09:00:00', usuario: 'Carla Mendes', perfil: 'franqueadora', texto: 'Reunião introdutória (kickoff) realizada. Frentes de implantação liberadas.', tipo: 'marco' });
  u.timeline.sort((a, b) => b.data.localeCompare(a.data));
  return u;
}

function criarBancoDemo() {
  const users = [
    { id: 'u_admin', nome: 'Administrador', email: 'admin@franqueadora.com', senha: 'admin123', perfil: 'admin', cargo: 'Administrador do sistema' },
    { id: 'u_cons',  nome: 'Carla Mendes', email: 'consultor@franqueadora.com', senha: 'admin123', perfil: 'franqueadora', cargo: 'Consultora de implantação' },
    { id: 'u_fort',  nome: 'Rafael Lima',  email: 'fortaleza@franquia.com', senha: '123456', perfil: 'franqueado', unidadeId: 'un_fortaleza' },
    { id: 'u_sob',   nome: 'Juliana Rocha', email: 'sobral@franquia.com',   senha: '123456', perfil: 'franqueado', unidadeId: 'un_sobral' },
    { id: 'u_jua',   nome: 'Marcos Pereira', email: 'juazeiro@franquia.com', senha: '123456', perfil: 'franqueado', unidadeId: 'un_juazeiro' },
    { id: 'u_ara',   nome: 'Fernanda Alves', email: 'aracati@franquia.com', senha: '123456', perfil: 'franqueado', unidadeId: 'un_aracati' },
    { id: 'u_cra',   nome: 'Paulo Santos',  email: 'crato@franquia.com',    senha: '123456', perfil: 'franqueado', unidadeId: 'un_crato' },
    { id: 'u_cau',   nome: 'Beatriz Nunes', email: 'caucaia@franquia.com',  senha: null,     perfil: 'franqueado', unidadeId: 'un_caucaia', convite: 'ABC123' },
  ];

  const unidades = [
    _unidade({
      id: 'un_fortaleza', consultor: 'Carla Mendes', nome: 'Unidade Fortaleza', cidade: 'Fortaleza - CE', franqueadoId: 'u_fort',
      contratoEm: _diasAtras(70), cofEm: _diasAtras(60),
      feitas: {
        projeto: ['medidas'], investimento: ['recebimento', 'orientacao', 'lista', 'compras'],
        pdv: ['docs', 'envio', 'agendamento'], contratacao: ['quadro', 'vagas', 'entrevistas'],
        legal: ['lista', 'cnpj', 'alvara', 'sanitario'], marketing: ['reuniao', 'brindes'], abertura: [],
      },
      emValidacao: { projeto: ['planta'] },
    }),
    _unidade({
      id: 'un_sobral', consultor: 'Rodrigo Teixeira', nome: 'Unidade Sobral', cidade: 'Sobral - CE', franqueadoId: 'u_sob',
      contratoEm: _diasAtras(58), cofEm: _diasAtras(50),
      feitas: {
        projeto: ['medidas', 'planta'], investimento: ['recebimento', 'orientacao'],
        pdv: ['docs'], contratacao: ['quadro'], legal: ['lista', 'cnpj'], marketing: ['reuniao'], abertura: [],
      },
    }),
    _unidade({
      id: 'un_juazeiro', consultor: 'Carla Mendes', nome: 'Unidade Juazeiro do Norte', cidade: 'Juazeiro do Norte - CE', franqueadoId: 'u_jua',
      contratoEm: _diasAtras(110), cofEm: _diasAtras(100),
      feitas: {
        projeto: ['medidas', 'planta', 'hidraulica', 'eletrica', 'cozinha', 'salao', 'obra'],
        investimento: ['recebimento', 'orientacao', 'lista', 'compras'],
        pdv: ['docs', 'envio', 'agendamento', 'instalacao', 'teste'],
        contratacao: ['quadro', 'vagas', 'entrevistas', 'contratacao', 'registro'],
        legal: ['lista', 'cnpj', 'alvara', 'sanitario', 'bombeiros', 'validacao'],
        marketing: ['reuniao', 'brindes', 'desconto', 'artes', 'instagram', 'trafego'],
        abertura: ['layout', 'pedido', 'estoque', 'validacao_treinamento'],
      },
      agenda: { data: _diasAtras(12), local: 'Loja Juazeiro do Norte', participantes: 'Marcos Pereira, gerente e 6 atendentes', instrutor: 'Carla Mendes' },
      treinamentoConcluido: true,
    }),
    _unidade({
      id: 'un_aracati', consultor: 'Rodrigo Teixeira', nome: 'Unidade Aracati', cidade: 'Aracati - CE', franqueadoId: 'u_ara',
      contratoEm: _diasAtras(100), cofEm: _diasAtras(95),
      feitas: {
        projeto: ['medidas', 'planta', 'hidraulica', 'eletrica', 'cozinha', 'salao', 'obra'],
        investimento: ['recebimento', 'orientacao', 'lista', 'compras'],
        pdv: ['docs', 'envio', 'agendamento', 'instalacao', 'teste'],
        contratacao: ['quadro', 'vagas', 'entrevistas', 'contratacao', 'registro'],
        legal: ['lista', 'cnpj', 'alvara', 'sanitario', 'bombeiros', 'validacao'],
        marketing: ['reuniao', 'brindes', 'desconto', 'artes', 'instagram', 'trafego'],
        abertura: ['layout', 'pedido', 'estoque', 'validacao_treinamento'],
      },
      agenda: { data: _diasFrente(3), local: 'Centro de treinamento da franqueadora', participantes: 'Fernanda Alves, gerente e 5 atendentes', instrutor: 'Carla Mendes' },
      modulosFeitos: ['cultura', 'atendimento'],
    }),
    _unidade({
      id: 'un_crato', consultor: 'Ana Ribeiro', nome: 'Unidade Crato', cidade: 'Crato - CE', franqueadoId: 'u_cra',
      contratoEm: _diasAtras(200), cofEm: _diasAtras(190),
      agenda: { data: _diasAtras(55), local: 'Loja Crato', participantes: 'Paulo Santos e equipe', instrutor: 'Carla Mendes' },
      treinamentoConcluido: true, validacaoFinal: true, inaugurada: true, inauguracaoData: _diasAtras(40),
    }),
    _unidade({
      id: 'un_caucaia', nome: 'Unidade Caucaia', cidade: 'Caucaia - CE', franqueadoId: 'u_cau',
      contratoEm: _diasAtras(5), cofEm: null,
      vendasFeitas: ['candidato', 'negociacao', 'emissao_cof', 'assinatura_cof'],
    }),
  ];

  // Comentários e anexos de exemplo
  const fort = unidades[0];
  fort.tarefas.projeto.medidas.anexos = [{ id: 'ax1', nome: 'planta-imovel-fortaleza.pdf', tamanho: 1843200, data: _diasAtras(55) + 'T14:20:00', por: 'Rafael Lima' }];
  fort.tarefas.projeto.planta.comentarios = [
    { id: 'c1', autor: 'Rafael Lima', perfil: 'franqueado', data: _diasAtras(2) + 'T15:31:00', texto: 'Planta revisada. Só tenho dúvida sobre a posição da porta dos fundos.' },
    { id: 'c2', autor: 'Carla Mendes', perfil: 'franqueadora', data: _diasAtras(1) + 'T09:10:00', texto: 'Vou verificar com o arquiteto e retorno hoje.' },
  ];
  fort.timeline.unshift({ id: 'ev_f_3', data: _diasAtras(2) + 'T15:30:00', usuario: 'Rafael Lima', perfil: 'franqueado', texto: 'Enviou "Validar planta baixa" para validação.', tipo: 'validacao' });
  fort.notificacoes.push({ id: 'nt1', para: 'franqueadora', texto: 'Unidade Fortaleza enviou "Validar planta baixa" para validação.', link: '#/u/un_fortaleza/frente/projeto', data: _diasAtras(2) + 'T15:30:00', lida: false });
  fort.notificacoes.push({ id: 'nt2', para: 'franqueado', texto: 'Carla Mendes comentou em "Validar planta baixa".', link: '#/frente/projeto', data: _diasAtras(1) + 'T09:10:00', lida: false });

  const sob = unidades[1];
  sob.notificacoes.push({ id: 'nt3', para: 'franqueado', texto: 'Lembrete: a tarefa "Divulgar vagas" está com o prazo vencido.', link: '#/frente/contratacao', data: _diasAtras(3) + 'T08:00:00', lida: false });

  return {
    versao: 1,
    users, unidades,
    frentes: JSON.parse(JSON.stringify(FRENTES_PADRAO)),
    modulos: JSON.parse(JSON.stringify(MODULOS_PADRAO)),
    vendasItens: JSON.parse(JSON.stringify(VENDAS_PADRAO)),
    kickoffItens: JSON.parse(JSON.stringify(KICKOFF_PADRAO)),
    posItens: JSON.parse(JSON.stringify(POS_PADRAO)),
    migracoes: ['tarefa-pedido'],
    config: { marca: 'Maria Pitanga', treinamentoRequer: 'todas' },
  };
}
  