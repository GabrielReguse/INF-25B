const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{"nome":"Você","email":"voce@ifc.edu.br"}');
const meuNome = usuario.nome || 'Você';
const minhaFoto = usuario.foto || null;

// mensagens demonstracao - em produção viriam do backend/websocket
let mensagens = [
  { id: 1, autor: 'João V.', foto: null, tipo: 'texto', conteudo: 'Oi pessoal, tudo bem?', hora: '08:14', data: hoje() },
  { id: 2, autor: 'Ana C.',  foto: null, tipo: 'texto', conteudo: 'Tudo sim! Alguém sabe o conteúdo da prova de amanhã?', hora: '08:16', data: hoje() },
  { id: 3, autor: meuNome,   foto: minhaFoto, tipo: 'texto', conteudo: 'Acho que é trigonometria e funções. Confirma aí!', hora: '08:17', data: hoje(), eu: true },
  { id: 4, autor: 'Gabriel E.', foto: null, tipo: 'audio', duracao: '0:24', onda: gerarOnda(), hora: '08:20', data: hoje() },
  { id: 5, autor: meuNome,   foto: minhaFoto, tipo: 'texto', conteudo: 'Alguém vai para a sala de estudos hoje à tarde?', hora: '08:22', data: hoje(), eu: true },
];

let proximoId = mensagens.length + 1;
let imagemPendente = null;
let mediaRecorder = null;
let gravando = false;
let chunksAudio = [];
let timerGrav = null;
let segundosGrav = 0;

const elChat       = document.getElementById('chatArea');
const elInput      = document.getElementById('inputTexto');
const elBtnEnviar  = document.getElementById('btnEnviar');
const elBtnFoto    = document.getElementById('btnFoto');
const elInputFoto  = document.getElementById('inputFoto');
const elBtnAudio   = document.getElementById('btnAudio');
const elPreview    = document.getElementById('previewImgWrap');
const elPreviewImg = document.getElementById('previewImgThumb');
const elPreviewNome= document.getElementById('previewImgNome');
const elPreviewRem = document.getElementById('previewImgRemove');

function hoje() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function gerarOnda() {
  return Array.from({ length: 20 }, () => Math.floor(Math.random() * 14) + 4);
}

function hora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function avatarHTML(foto, nome) {
  if (foto) return `<img src="${foto}" alt="${nome}"/>`;
  return `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}

function ondaHTML(onda) {
  return onda.map(h => `<div class="audio-onda-bar" style="height:${h}px"></div>`).join('');
}

function renderMensagem(msg) {
  const eu = msg.eu || msg.autor === meuNome;
  const grupo = document.createElement('div');
  grupo.className = `msg-grupo ${eu ? 'eu' : 'outros'}`;
  grupo.id = `msg-${msg.id}`;

  let conteudoHTML = '';

  if (msg.tipo === 'texto') {
    conteudoHTML = `
      <div class="msg-balao">${escapeHTML(msg.conteudo)}</div>
      <span class="msg-hora">${msg.hora}</span>
    `;
  } else if (msg.tipo === 'imagem') {
    conteudoHTML = `
      <img class="msg-img" src="${msg.src}" alt="imagem" onclick="abrirImagem('${msg.src}')"/>
      <span class="msg-hora">${msg.hora}</span>
    `;
  } else if (msg.tipo === 'audio') {
    conteudoHTML = `
      <div class="msg-audio">
        <button class="audio-play" onclick="toggleAudio(this, '${msg.src || ''}')">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg>
        </button>
        <div class="audio-onda">${ondaHTML(msg.onda)}</div>
        <span class="audio-dur">${msg.duracao}</span>
      </div>
      <span class="msg-hora">${msg.hora}</span>
    `;
  }

  grupo.innerHTML = `
    <div class="msg-avatar">${avatarHTML(msg.foto, msg.autor)}</div>
    <div class="msg-col">
      <span class="msg-nome">${escapeHTML(msg.autor)}</span>
      ${conteudoHTML}
    </div>
  `;

  return grupo;
}

function renderTodas() {
  elChat.innerHTML = '';
  let dataAtual = null;

  mensagens.forEach(msg => {
    if (msg.data !== dataAtual) {
      dataAtual = msg.data;
      const sep = document.createElement('div');
      sep.className = 'data-separador';
      sep.innerHTML = `
        <div class="data-separador-linha"></div>
        <span class="data-separador-texto">${msg.data}</span>
        <div class="data-separador-linha"></div>
      `;
      elChat.appendChild(sep);
    }
    elChat.appendChild(renderMensagem(msg));
  });

  scrollBaixo();
}

function adicionarMensagem(msg) {
  // separador de data se for novo dia
  const ultima = mensagens[mensagens.length - 1];
  if (!ultima || ultima.data !== msg.data) {
    const sep = document.createElement('div');
    sep.className = 'data-separador';
    sep.innerHTML = `
      <div class="data-separador-linha"></div>
      <span class="data-separador-texto">${msg.data}</span>
      <div class="data-separador-linha"></div>
    `;
    elChat.appendChild(sep);
  }

  mensagens.push(msg);
  elChat.appendChild(renderMensagem(msg));
  scrollBaixo();
}

function enviarTexto() {
  const texto = elInput.value.trim();
  if (!texto && !imagemPendente) return;

  if (imagemPendente) {
    adicionarMensagem({
      id: proximoId++,
      autor: meuNome,
      foto: minhaFoto,
      tipo: 'imagem',
      src: imagemPendente.src,
      hora: hora(),
      data: hoje(),
      eu: true,
    });
    limparPreview();
  }

  if (texto) {
    adicionarMensagem({
      id: proximoId++,
      autor: meuNome,
      foto: minhaFoto,
      tipo: 'texto',
      conteudo: texto,
      hora: hora(),
      data: hoje(),
      eu: true,
    });
    elInput.value = '';
    elInput.style.height = 'auto';
  }
}

// enviar com Enter (Shift+Enter = nova linha)
elInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarTexto();
  }
});

elInput.addEventListener('input', () => {
  elInput.style.height = 'auto';
  elInput.style.height = Math.min(elInput.scrollHeight, 100) + 'px';
});

elBtnEnviar.addEventListener('click', enviarTexto);

// foto
elBtnFoto.addEventListener('click', () => elInputFoto.click());

elInputFoto.addEventListener('change', () => {
  const file = elInputFoto.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  imagemPendente = { src: url, nome: file.name };
  elPreviewImg.src = url;
  elPreviewNome.textContent = file.name;
  elPreview.classList.add('visivel');
  elInputFoto.value = '';
});

elPreviewRem.addEventListener('click', limparPreview);

function limparPreview() {
  imagemPendente = null;
  elPreview.classList.remove('visivel');
  elPreviewImg.src = '';
  elPreviewNome.textContent = '';
}

// áudio
elBtnAudio.addEventListener('click', async () => {
  if (!gravando) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksAudio = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = e => chunksAudio.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksAudio, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        const dur  = formatarDuracao(segundosGrav);
        adicionarMensagem({
          id: proximoId++,
          autor: meuNome,
          foto: minhaFoto,
          tipo: 'audio',
          src: url,
          onda: gerarOnda(),
          duracao: dur,
          hora: hora(),
          data: hoje(),
          eu: true,
        });
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      gravando = true;
      segundosGrav = 0;
      elBtnAudio.classList.add('gravando');
      timerGrav = setInterval(() => segundosGrav++, 1000);
    } catch (_) {
      alert('Permita acesso ao microfone para gravar áudio.');
    }
  } else {
    clearInterval(timerGrav);
    mediaRecorder.stop();
    gravando = false;
    elBtnAudio.classList.remove('gravando');
  }
});

function formatarDuracao(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2,'0')}`;
}

// player de áudio simples
const audioAtivos = {};

function toggleAudio(btn, src) {
  if (!src) return;

  if (audioAtivos[src]) {
    audioAtivos[src].pause();
    delete audioAtivos[src];
    btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg>`;
    return;
  }

  // pausa outros
  Object.entries(audioAtivos).forEach(([s, a]) => {
    a.pause();
    delete audioAtivos[s];
  });

  const audio = new Audio(src);
  audioAtivos[src] = audio;
  btn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="#fff"/><rect x="14" y="4" width="4" height="16" fill="#fff"/></svg>`;
  audio.play();
  audio.onended = () => {
    delete audioAtivos[src];
    btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg>`;
  };
}

function abrirImagem(src) {
  window.open(src, '_blank');
}

function scrollBaixo() {
  requestAnimationFrame(() => {
    elChat.scrollTop = elChat.scrollHeight;
  });
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// init
renderTodas();