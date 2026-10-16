/* =====================================================================
   PERSONAGENS — um bonequinho SVG por frente de trabalho
   ===================================================================== */
const ACESSORIOS = {
  projeto: `
    <path d="M18 23 a14 14 0 0 1 28 0 z" fill="#facc15"/>
    <rect x="15" y="21" width="34" height="5" rx="2.5" fill="#eab308"/>
    <rect x="29" y="11" width="6" height="10" rx="2" fill="#fde047"/>`,
  investimento: `
    <g class="prop">
      <circle cx="52" cy="44" r="8" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <text x="52" y="48" font-size="10" font-weight="700" text-anchor="middle" fill="#92400e" font-family="Inter,Arial">$</text>
    </g>
    <rect x="22" y="10" width="20" height="6" rx="3" fill="#065f46"/>`,
  pdv: `
    <g class="prop">
      <rect x="42" y="38" width="18" height="13" rx="2" fill="#0f172a"/>
      <rect x="44" y="40" width="14" height="9" rx="1" fill="#38bdf8"/>
      <rect x="48" y="51" width="6" height="2" fill="#0f172a"/>
    </g>
    <path d="M20 20 q12 -14 24 0" fill="#1e3a8a"/>`,
  contratacao: `
    <rect x="26" y="40" width="12" height="9" rx="1.5" fill="#fff" stroke="#6d28d9" stroke-width="1.2"/>
    <rect x="28" y="43" width="8" height="1.6" fill="#6d28d9"/>
    <rect x="28" y="46" width="5" height="1.6" fill="#a78bfa"/>
    <path d="M30 34 l2 4 l2 -4" fill="#4c1d95"/>
    <path d="M21 18 q11 -12 22 0 v4 h-22z" fill="#3b0764"/>`,
  legal: `
    <g class="prop">
      <rect x="42" y="36" width="16" height="19" rx="2" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
      <rect x="46" y="33" width="8" height="5" rx="1" fill="#b45309"/>
      <path d="M45 46 l3 3 l6 -7" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M21 19 q11 -13 22 0 v3 h-22z" fill="#881337"/>`,
  abertura: `
    <g class="prop">
      <circle cx="52" cy="40" r="5" fill="none" stroke="#fbbf24" stroke-width="3"/>
      <rect x="50.5" y="44" width="3" height="13" fill="#fbbf24"/>
      <rect x="53" y="50" width="4" height="2.5" fill="#fbbf24"/>
      <rect x="53" y="54" width="3" height="2.5" fill="#fbbf24"/>
    </g>
    <path d="M20 21 q12 -16 24 0" fill="#7c2d12"/>
    <rect x="18" y="20" width="28" height="3" rx="1.5" fill="#7c2d12"/>`,
};

function personagemSVG(fid, extraClass = '', opts = {}) {
  const f = (typeof DB !== 'undefined' && DB && DB.frentes.find(x => x.id === fid)) || FRENTES_PADRAO.find(x => x.id === fid);
  const cor = f ? f.cor : '#64748b';
  const escuro = sombra(cor);
  const feliz = opts.feliz;
  const boca = feliz
    ? `<path d="M26 27 q6 6 12 0" stroke="#7c2d12" stroke-width="1.8" fill="#fff" stroke-linecap="round"/>`
    : `<path d="M27 27 q5 4 10 0" stroke="#7c2d12" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<svg class="char ${extraClass}" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" aria-label="${esc(f ? f.nome : fid)}">
    <ellipse cx="32" cy="77" rx="16" ry="2.5" fill="rgba(15,23,42,.15)"/>
    <g class="leg leg-l"><rect x="24" y="56" width="7" height="20" rx="3" fill="#1f2937"/><rect x="22" y="72" width="10" height="5" rx="2.5" fill="#111827"/></g>
    <g class="leg leg-r"><rect x="33" y="56" width="7" height="20" rx="3" fill="#1f2937"/><rect x="32" y="72" width="10" height="5" rx="2.5" fill="#111827"/></g>
    <rect x="19" y="33" width="26" height="28" rx="9" fill="${cor}"/>
    <rect x="19" y="33" width="26" height="8" rx="4" fill="${escuro}" opacity=".25"/>
    <g class="arm arm-l"><rect x="12" y="36" width="7" height="19" rx="3.5" fill="${cor}"/><circle cx="15.5" cy="56" r="3.5" fill="#fcd9b6"/></g>
    <g class="arm arm-r"><rect x="45" y="36" width="7" height="19" rx="3.5" fill="${cor}"/><circle cx="48.5" cy="56" r="3.5" fill="#fcd9b6"/></g>
    <circle cx="32" cy="21" r="12.5" fill="#fcd9b6"/>
    <circle cx="27.5" cy="21" r="1.6" fill="#1f2937"/><circle cx="36.5" cy="21" r="1.6" fill="#1f2937"/>
    <circle cx="25" cy="25" r="1.8" fill="#fda4af" opacity=".6"/><circle cx="39" cy="25" r="1.8" fill="#fda4af" opacity=".6"/>
    ${boca}
    ${ACESSORIOS[fid] || ''}
  </svg>`;
}

function sombra(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 60), g = Math.max(0, ((n >> 8) & 255) - 60), b = Math.max(0, (n & 255) - 60);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
