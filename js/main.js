// 共通ナビゲーション：スマホのハンバーガーメニューを開閉します。
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobilePanel = document.querySelector('.mobile-menu-panel');

function closeMenu() {
  if (!menuToggle || !mobileMenu) return;
  mobileMenu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'メニューを開く');
  menuToggle.textContent = '☰';
}

function openMenu() {
  if (!menuToggle || !mobileMenu) return;
  mobileMenu.classList.add('is-open');
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'メニューを閉じる');
  menuToggle.textContent = '×';
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu.addEventListener('click', (event) => {
    if (!mobilePanel.contains(event.target)) closeMenu();
  });

  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

// HOMEのみ：背景写真をクロスフェードで自動切替します。
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 1) {
  let current = 0;
  const intervalMs = 5200; // 切替間隔。好みに合わせて変更可能です。

  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, intervalMs);
}
