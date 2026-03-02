const API = "https://inf-25b-backend.onrender.com";

const usuario = (() => {
  try { return JSON.parse(sessionStorage.getItem('usuario') || '{}'); } catch { return {}; }
})();

// ─── AVISOS ───────────────────────────────────────────────────
async function carregarAvisos() {
  const container = document.getElementById('itensAvisos');
  if (!container) return;

  try {
    const res = await fetch(`${API}/avisos`);
    const avisos = await res.json();
    if (!avisos.length) return;

    container.innerHTML = '';

    // mostra os 2 primeiros direto
    const visiveis  = avisos.slice(0, 2);
    const escondidos = avisos.slice(2);

    visiveis.forEach(a => container.appendChild(criarItemAviso(a)));

    // se tiver mais de 2, coloca os extras no bloco expansível
    if (escondidos.length) {
      const extrasInner = document.querySelector('#extrasAvisos .bloco-extras-inner');
      if (extrasInner) escondidos.forEach(a => extrasInner.appendChild(criarItemAviso(a)));
    }

  } catch (err) {
    console.error('Erro ao carregar avisos:', err);
  }
}

function criarItemAviso(a) {
  const data = new Date(a.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const div = document.createElement('div');
  div.className = 'bloco-item';
  div.innerHTML = `
    <div class="item-indicador ind-red"></div>
    <div class="item-texto">
      <div class="item-titulo">${a.titulo}</div>
      <div class="item-detalhe">${a.descricao}</div>
    </div>
    <span class="item-badge">${data}</span>
  `;
  return div;
}

// ─── DESTAQUES ────────────────────────────────────────────────
async function carregarDestaques() {
  const container = document.getElementById('itensDestaques');
  if (!container) return;

  try {
    const res = await fetch(`${API}/destaques`);
    const destaques = await res.json();
    if (!destaques.length) return;

    container.innerHTML = '';

    const visiveis   = destaques.slice(0, 2);
    const escondidos = destaques.slice(2);

    visiveis.forEach(d => container.appendChild(criarItemDestaque(d)));

    if (escondidos.length) {
      const extrasInner = document.querySelector('#extrasDestaques .bloco-extras-inner');
      if (extrasInner) escondidos.forEach(d => extrasInner.appendChild(criarItemDestaque(d)));
    }

  } catch (err) {
    console.error('Erro ao carregar destaques:', err);
  }
}

function criarItemDestaque(d) {
  const data = new Date(d.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const div = document.createElement('div');
  div.className = 'bloco-item';
  div.innerHTML = `
    <div class="item-indicador ind-purple"></div>
    <div class="item-texto">
      <div class="item-titulo">${d.titulo}</div>
      <div class="item-detalhe">${d.descricao}</div>
    </div>
    <span class="item-badge">${data}</span>
  `;
  return div;
}

// ─── BOTÃO ADM ────────────────────────────────────────────────
function mostrarBotaoAdm() {
  if (usuario.role !== 'admin') return;

  const btn = document.createElement('a');
  btn.href = 'adm.html';
  btn.title = 'Painel ADM';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:#fff;stroke-width:2;fill:none">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  `;
  Object.assign(btn.style, {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(139,92,246,.5)',
    zIndex: '999', textDecoration: 'none', transition: 'opacity .2s'
  });
  btn.addEventListener('mouseenter', () => btn.style.opacity = '.8');
  btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
  document.body.appendChild(btn);
}

// init — roda após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  carregarAvisos();
  carregarDestaques();
  mostrarBotaoAdm();
});