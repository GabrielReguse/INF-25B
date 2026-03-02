const API = "https://inf-25b-backend.onrender.com";

const TIPOS = [
  { id: 'encontro',   label: '🎉 Encontro',    descricao: 'Propor um rolê ou saída da turma', destino: 'lazer' },
  { id: 'instagram',  label: '📸 Instagram',   descricao: 'Ideia de post ou story para o perfil', destino: 'lazer' },
  { id: 'melhoria',   label: '🛠️ Melhoria',    descricao: 'Sugestão para o site ou organização', destino: 'adm' },
  { id: 'outro',      label: '💬 Outro',        descricao: 'Qualquer outra sugestão', destino: 'adm' },
];

let tipoSelecionado = null;
let etapa = 1;

const elBarra = document.getElementById('barraProgresso');
const elCorpo = document.getElementById('corpoFormulario');

function atualizarBarra() {
  if (!elBarra) return;
  elBarra.style.width = etapa === 1 ? '50%' : '100%';
}

function renderEtapa1() {
  elCorpo.innerHTML = `
    <p class="form-instrucao">Qual tipo de sugestão você quer enviar?</p>
    <div class="tipos-grid">
      ${TIPOS.map(t => `
        <button class="tipo-btn${tipoSelecionado === t.id ? ' selecionado' : ''}" data-id="${t.id}">
          <span class="tipo-label">${t.label}</span>
          <span class="tipo-desc">${t.descricao}</span>
        </button>
      `).join('')}
    </div>
    <button class="btn-avancar" id="btnAvancar" ${!tipoSelecionado ? 'disabled' : ''}>Avançar →</button>
  `;

  elCorpo.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tipoSelecionado = btn.dataset.id;
      elCorpo.querySelectorAll('.tipo-btn').forEach(b => b.classList.toggle('selecionado', b.dataset.id === tipoSelecionado));
      document.getElementById('btnAvancar').disabled = false;
    });
  });

  document.getElementById('btnAvancar').addEventListener('click', () => {
    if (tipoSelecionado) trocarEtapa(2);
  });
}

function renderEtapa2() {
  const tipo = TIPOS.find(t => t.id === tipoSelecionado);
  elCorpo.innerHTML = `
    <button class="btn-voltar" id="btnVoltar">← Voltar</button>
    <p class="form-instrucao">Detalhe sua sugestão de <strong>${tipo?.label}</strong>:</p>
    <div class="campo-grupo">
      <label class="campo-label" for="inputTitulo">Título</label>
      <input class="campo-input" type="text" id="inputTitulo" placeholder="Título da sugestão"/>
      <span class="campo-erro" id="erroTitulo"></span>
    </div>
    <div class="campo-grupo">
      <label class="campo-label" for="inputDesc">Descrição</label>
      <textarea class="campo-textarea" id="inputDesc" placeholder="Descreva sua sugestão..."></textarea>
      <span class="campo-erro" id="erroDesc"></span>
    </div>
    <div class="alerta" id="alerta"></div>
    <button class="btn-avancar" id="btnPublicar" type="button">Publicar</button>
  `;

  document.getElementById('btnVoltar').addEventListener('click', () => trocarEtapa(1));
  document.getElementById('btnPublicar').addEventListener('click', publicar);
}

function trocarEtapa(nova) {
  elCorpo.classList.add('saindo');
  setTimeout(() => {
    etapa = nova;
    atualizarBarra();
    elCorpo.classList.remove('saindo');
    elCorpo.classList.add('entrando');
    nova === 1 ? renderEtapa1() : renderEtapa2();
    setTimeout(() => elCorpo.classList.remove('entrando'), 260);
  }, 200);
}

async function publicar() {
  const titulo = document.getElementById('inputTitulo').value.trim();
  const desc = document.getElementById('inputDesc').value.trim();
  const elAlerta = document.getElementById('alerta');
  const btnPublicar = document.getElementById('btnPublicar');

  document.getElementById('erroTitulo').textContent = '';
  document.getElementById('erroDesc').textContent = '';
  elAlerta.className = 'alerta';

  let valido = true;
  if (!titulo) {
    document.getElementById('erroTitulo').textContent = 'Informe um título.';
    valido = false;
  }
  if (!desc) {
    document.getElementById('erroDesc').textContent = 'Escreva uma descrição.';
    valido = false;
  }
  if (!valido) return;

  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  if (!usuario.id) {
    elAlerta.textContent = 'Você precisa estar logado para enviar sugestões.';
    elAlerta.className = 'alerta erro';
    return;
  }

  btnPublicar.disabled = true;
  btnPublicar.textContent = 'Enviando...';

  try {
    const resposta = await fetch(`${API}/sugestoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autor: usuario.id,
        texto: `[${tipoSelecionado}] ${titulo} — ${desc}`
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      elAlerta.textContent = dados.erro || 'Erro ao enviar sugestão.';
      elAlerta.className = 'alerta erro';
      btnPublicar.disabled = false;
      btnPublicar.textContent = 'Publicar';
      return;
    }

    elAlerta.textContent = 'Sugestão enviada com sucesso!';
    elAlerta.className = 'alerta sucesso';

    setTimeout(() => { window.location.href = 'telaInicial.html'; }, 1400);

  } catch (err) {
    console.error(err);
    elAlerta.textContent = 'Erro de conexão. Tente novamente.';
    elAlerta.className = 'alerta erro';
    btnPublicar.disabled = false;
    btnPublicar.textContent = 'Publicar';
  }
}

// init
atualizarBarra();
renderEtapa1();