const API = "https://inf-25b-backend.onrender.com";

// ─── AVISOS ───────────────────────────────────────────────────
async function carregarAvisos() {
  // tenta encontrar o container de avisos na tela inicial
  // (o HTML tem um div com "Nenhum aviso no momento.")
  const container = document.getElementById('extrasAvisos');
  if (!container) return;

  try {
    const res = await fetch(`${API}/avisos`);
    const avisos = await res.json();

    if (!avisos.length) return; // mantém o "Nenhum aviso" original

    container.innerHTML = avisos.map(a => {
      const data = new Date(a.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `
        <div class="bloco-item">
          <div class="item-indicador ind-red"></div>
          <div class="item-texto">
            <div class="item-titulo">${a.titulo}</div>
            <div class="item-sub">${a.descricao}</div>
          </div>
          <span class="item-badge">${data}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao carregar avisos:', err);
  }
}

// ─── DESTAQUES ────────────────────────────────────────────────
async function carregarDestaques() {
  const container = document.getElementById('extrasDestaques');
  if (!container) return;

  try {
    const res = await fetch(`${API}/destaques`);
    const destaques = await res.json();

    if (!destaques.length) return;

    container.innerHTML = destaques.map(d => {
      const data = new Date(d.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `
        <div class="bloco-item">
          <div class="item-indicador ind-purple"></div>
          <div class="item-texto">
            <div class="item-titulo">${d.titulo}</div>
            <div class="item-sub">${d.descricao}</div>
          </div>
          <span class="item-badge">${data}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erro ao carregar destaques:', err);
  }
}

// ─── BOTÃO ADM (visível só para admins) ───────────────────────
function mostrarBotaoAdm() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  if (usuario.role !== 'admin') return;

  // cria botão flutuante de acesso ao painel ADM
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
    zIndex: '999', textDecoration: 'none',
    transition: 'opacity .2s'
  });
  btn.addEventListener('mouseenter', () => btn.style.opacity = '.8');
  btn.addEventListener('mouseleave', () => btn.style.opacity = '1');

  document.body.appendChild(btn);
}

// init
carregarAvisos();
carregarDestaques();
mostrarBotaoAdm();