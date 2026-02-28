// header scroll
const header = document.getElementById('header');
const headerLinha = document.getElementById('headerLinha');

window.addEventListener('scroll', () => {
  const rolou = window.scrollY > 8;
  header.classList.toggle('scrolled', rolou);
  headerLinha.classList.toggle('fina', rolou);
}, { passive: true });

// animação de saída
document.querySelectorAll('a[href]').forEach(link => {
  if (link.hostname !== location.hostname && link.hostname !== '') return;
  if (link.getAttribute('href').startsWith('#')) return;

  link.addEventListener('click', e => {
    e.preventDefault();
    const destino = link.href;
    document.getElementById('page').classList.add('saindo');
    setTimeout(() => { window.location.href = destino; }, 260);
  });
});

// enviar email
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');

    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    e.preventDefault();
  });
});