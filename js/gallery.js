const PHOTO_API_BASE = 'https://awaji-photo-api.nagoharu2024.workers.dev';
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const LONG_PRESS_MS = 800;

const uploadForm = document.querySelector('#gallery-upload-form');
const fileInput = document.querySelector('#gallery-file');
const fileName = document.querySelector('#gallery-file-name');
const uploadButton = document.querySelector('#gallery-upload-button');
const uploadStatus = document.querySelector('#gallery-upload-status');
const listStatus = document.querySelector('#gallery-list-status');
const galleryEmpty = document.querySelector('#gallery-empty');
const galleryGrid = document.querySelector('#gallery-grid');
const selectionActions = document.querySelector('#gallery-selection-actions');
const selectionLabel = document.querySelector('#gallery-selection-label');
const clearSelectionButton = document.querySelector('#gallery-selection-clear');
const deleteOpenButton = document.querySelector('#gallery-delete-open');
const deleteModal = document.querySelector('#gallery-delete-modal');
const deleteCancelButton = document.querySelector('#gallery-delete-cancel');
const deleteConfirmButton = document.querySelector('#gallery-delete-confirm');
const deleteStatus = document.querySelector('#gallery-delete-status');
let selectedKey = null;
let returnFocus = null;

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function validKey(photo) {
  const key = typeof photo === 'string' ? photo : photo?.key;
  if (typeof key !== 'string' || !key.startsWith('gallery/') || key.length <= 8) {
    throw new Error('Invalid photo key');
  }
  return key;
}

function photoUrl(photo) {
  const key = validKey(photo);
  // Worker の一覧に URL が含まれる場合、その形式を優先する。
  if (photo && typeof photo.url === 'string') {
    const url = new URL(photo.url, PHOTO_API_BASE);
    if (url.origin !== new URL(PHOTO_API_BASE).origin) throw new Error('Invalid photo URL');
    return url.href;
  }
  return `${PHOTO_API_BASE}/photo/${encodeURIComponent(key)}`;
}

function uploadedTime(photo) {
  const date = Date.parse(photo?.uploaded || '');
  if (Number.isFinite(date)) return date;
  const stamp = Number(validKey(photo).slice(8).split('-')[0]);
  return Number.isFinite(stamp) ? stamp : 0;
}

function clearSelection() {
  selectedKey = null;
  selectionActions.hidden = true;
  galleryGrid.querySelectorAll('.gallery-item.is-selected').forEach(item => {
    item.classList.remove('is-selected');
    item.setAttribute('aria-pressed', 'false');
  });
}

function selectPhoto(key, figure) {
  clearSelection();
  selectedKey = key;
  figure.classList.add('is-selected');
  figure.setAttribute('aria-pressed', 'true');
  selectionLabel.textContent = '写真を1枚選択中';
  selectionActions.hidden = false;
}

function bindLongPress(figure, key) {
  let timer = null;
  let ignoreNextClick = false;
  let startX = 0;
  let startY = 0;
  const cancel = () => { clearTimeout(timer); timer = null; };
  figure.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    startX = event.clientX;
    startY = event.clientY;
    cancel();
    ignoreNextClick = false;
    timer = setTimeout(() => { selectPhoto(key, figure); ignoreNextClick = true; timer = null; }, LONG_PRESS_MS);
  });
  figure.addEventListener('pointermove', event => {
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 12) cancel();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => figure.addEventListener(type, cancel));
  figure.addEventListener('contextmenu', event => event.preventDefault());
  figure.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectedKey === key ? clearSelection() : selectPhoto(key, figure);
    }
  });
  figure.addEventListener('click', () => {
    if (ignoreNextClick) { ignoreNextClick = false; return; }
    if (selectedKey) selectedKey === key ? clearSelection() : selectPhoto(key, figure);
  });
}

async function loadPhotos() {
  setStatus(listStatus, '写真を読み込んでいます...');
  try {
    const response = await fetch(`${PHOTO_API_BASE}/photos`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const photos = Array.isArray(result) ? result : result.photos;
    if (!Array.isArray(photos)) throw new Error('Invalid photo list');
    photos.sort((a, b) => uploadedTime(b) - uploadedTime(a));
    const fragment = document.createDocumentFragment();
    photos.forEach((photo, index) => {
      const key = validKey(photo);
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `思い出写真${index + 1}。長押しで選択`);
      figure.setAttribute('aria-pressed', 'false');
      const img = document.createElement('img');
      img.src = photoUrl(photo);
      img.alt = `家族旅行の思い出写真${index + 1}`;
      img.loading = 'lazy';
      img.draggable = false;
      figure.append(img);
      bindLongPress(figure, key);
      fragment.append(figure);
    });
    clearSelection();
    galleryGrid.replaceChildren(fragment);
    galleryGrid.hidden = photos.length === 0;
    galleryEmpty.hidden = photos.length !== 0;
    setStatus(listStatus, '');
  } catch (error) {
    setStatus(listStatus, '写真を読み込めませんでした。時間をおいて再読み込みしてください。', true);
    console.error('Gallery load failed:', error);
  }
}

async function compressIfNeeded(file) {
  if (file.size <= MAX_IMAGE_BYTES) return file;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('この形式の大きな画像は圧縮できません。20MB以下の画像を選んでください。');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    let scale = 1;
    for (let attempt = 0; attempt < 8; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.floor(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('画像を圧縮できませんでした。');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const quality = file.type === 'image/png' ? undefined : Math.max(.72, .92 - attempt * .025);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, file.type, quality));
      canvas.width = canvas.height = 0;
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
      }
      scale *= .82;
    }
    throw new Error('20MB以下に圧縮できませんでした。');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function openDeleteModal() {
  if (!selectedKey) return;
  returnFocus = document.activeElement;
  deleteModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setStatus(deleteStatus, '');
  deleteCancelButton.focus();
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  document.body.style.overflow = '';
  returnFocus?.focus();
}

if (uploadForm) {
  fileInput.addEventListener('change', () => {
    const count = fileInput.files.length;
    fileName.textContent = count ? `${count}枚の写真を選択しました` : '写真が選択されていません';
    setStatus(uploadStatus, '');
  });

  uploadForm.addEventListener('submit', async event => {
    event.preventDefault();
    const files = Array.from(fileInput.files);
    if (!files.length) return setStatus(uploadStatus, '写真を選択してください。', true);
    uploadButton.disabled = fileInput.disabled = true;
    let completed = 0;
    let failed = 0;
    try {
      for (const [index, file] of files.entries()) {
        setStatus(uploadStatus, `アップロード中... ${index + 1}/${files.length}枚`);
        try {
          if (!file.type.startsWith('image/')) throw new Error('画像ファイルではありません。');
          const uploadFile = await compressIfNeeded(file);
          const body = new FormData();
          body.append('file', uploadFile);
          const response = await fetch(`${PHOTO_API_BASE}/upload`, { method: 'POST', body });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          completed++;
        } catch (error) {
          failed++;
          console.error('Gallery upload failed:', file.name, error);
        }
      }
      if (completed) await loadPhotos();
      setStatus(uploadStatus,
        failed ? `${completed}枚追加しました。${failed}枚は追加できませんでした。20MBを超える画像や通信状態を確認してください。` : `${completed}枚の写真を追加しました！`,
        failed > 0);
      if (!failed) {
        fileInput.value = '';
        fileName.textContent = '写真が選択されていません';
      }
    } finally {
      uploadButton.disabled = fileInput.disabled = false;
    }
  });

  clearSelectionButton.addEventListener('click', clearSelection);
  deleteOpenButton.addEventListener('click', openDeleteModal);
  deleteCancelButton.addEventListener('click', closeDeleteModal);
  deleteModal.querySelector('[data-modal-close]').addEventListener('click', closeDeleteModal);
  document.addEventListener('keydown', event => {
    if (deleteModal.hidden) return;
    if (event.key === 'Escape') closeDeleteModal();
    if (event.key === 'Tab') {
      const focusables = [deleteCancelButton, deleteConfirmButton];
      const next = focusables.indexOf(document.activeElement) + (event.shiftKey ? -1 : 1);
      if (next < 0 || next >= focusables.length) {
        event.preventDefault();
        focusables[next < 0 ? focusables.length - 1 : 0].focus();
      }
    }
  });
  deleteConfirmButton.addEventListener('click', async () => {
    if (!selectedKey) return;
    deleteConfirmButton.disabled = deleteCancelButton.disabled = true;
    setStatus(deleteStatus, '削除中...');
    try {
      const response = await fetch(`${PHOTO_API_BASE}/photo/${encodeURIComponent(selectedKey)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      closeDeleteModal();
      clearSelection();
      await loadPhotos();
    } catch (error) {
      setStatus(deleteStatus, '削除できませんでした。時間をおいてもう一度お試しください。', true);
      console.error('Gallery delete failed:', error);
    } finally {
      deleteConfirmButton.disabled = deleteCancelButton.disabled = false;
    }
  });

  loadPhotos();
}
