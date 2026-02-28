// toggle edição
const card      = document.querySelector('.perfil-card');
const btnEditar = document.getElementById('btnEditar');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancel = document.getElementById('btnCancelar');
const nome      = document.getElementById('perfilNome');
const desc      = document.getElementById('perfilDesc');
const fotoWrap  = document.querySelector('.foto-trocar');
const inputFoto = document.getElementById('inputFoto');

let nomeOriginal, descOriginal;

function entrarEdicao() {
  nomeOriginal = nome.textContent;
  descOriginal = desc.value;
  card.classList.add('editando');
  nome.setAttribute('contenteditable', 'true');
  desc.removeAttribute('readonly');
  nome.focus();
}

function sairEdicao(salvar) {
  if (!salvar) {
    nome.textContent = nomeOriginal;
    desc.value       = descOriginal;
  }
  card.classList.remove('editando');
  nome.setAttribute('contenteditable', 'false');
  desc.setAttribute('readonly', '');
}

btnEditar.addEventListener('click', entrarEdicao);
btnSalvar.addEventListener('click', () => sairEdicao(true));
btnCancel.addEventListener('click', () => sairEdicao(false));

// troca de foto
fotoWrap.addEventListener('click', () => inputFoto.click());

inputFoto.addEventListener('change', () => {
  const file = inputFoto.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = document.getElementById('fotoImg');
  img.src = url;
  img.style.display = 'block';
  document.getElementById('fotoIcone').style.display = 'none';
});

// toggle sugestões
const btnSugestoes  = document.getElementById('btnSugestoes');
const listaSugestoes = document.getElementById('listaSugestoes');

btnSugestoes.addEventListener('click', () => {
  const aberto = listaSugestoes.classList.contains('aberto');
  listaSugestoes.classList.toggle('aberto', !aberto);
  btnSugestoes.classList.toggle('aberto', !aberto);
  btnSugestoes.setAttribute('aria-expanded', String(!aberto));
});