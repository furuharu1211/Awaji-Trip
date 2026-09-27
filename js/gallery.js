// Cloudflare Workers の公開URLをここに設定します（末尾の / は不要）。
const PHOTO_API_BASE = '';

const uploadForm = document.querySelector('#gallery-upload-form');
const fileInput = document.querySelector('#gallery-file');
const fileName = document.querySelector('#gallery-file-name');
const uploadButton = document.querySelector('#gallery-upload-button');
const uploadStatus = document.querySelector('#gallery-upload-status');
const listStatus = document.querySelector('#gallery-list-status');
const galleryEmpty = document.querySelector('#gallery-empty');
const galleryGrid = document.querySelector('#gallery-grid');

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function photoUrl(photo) {
  if (typeof photo === 'string') {
    return `${PHOTO_API_BASE}/photo/${photo.split('/').map(encodeURIComponent).join('/')}`;
  }
  if (photo && typeof photo.url === 'string') {
    // API 側が URL を返す場合も、信頼済みの Worker と同一オリジンのみ許可。
    const url = new URL(photo.url, PHOTO_API_BASE);
    if (url.origin !== new URL(PHOTO_API_BASE).origin) throw new Error('Invalid photo URL');
    return url.href;
  }
  if (photo && typeof photo.key === 'string') {
    return `${PHOTO_API_BASE}/photo/${photo.key.split('/').map(encodeURIComponent).join('/')}`;
  }
  throw new Error('Invalid photo entry');
}

async function loadPhotos() {
  setStatus(listStatus, '写真を読み込んでいます...');
  galleryGrid.hidden = true;
  galleryEmpty.hidden = true;
  try {
    const response = await fetch(`${PHOTO_API_BASE}/photos`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    const photos = Array.isArray(result) ? result : result.photos;
    if (!Array.isArray(photos)) throw new Error('Invalid photo list');
    const fragment = document.createDocumentFragment();
    photos.forEach((photo, index) => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = photoUrl(photo);
      img.alt = `家族旅行の思い出写真${index + 1}`;
      img.loading = 'lazy';
      figure.append(img);
      fragment.append(figure);
    });
    galleryGrid.replaceChildren(fragment);
    galleryGrid.hidden = photos.length === 0;
    galleryEmpty.hidden = photos.length !== 0;
    setStatus(listStatus, '');
  } catch (error) {
    setStatus(listStatus, '写真を読み込めませんでした。時間をおいて再読み込みしてください。', true);
    console.error('Gallery load failed:', error);
  }
}

if (uploadForm) {
  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files[0]?.name || '写真が選択されていません';
    setStatus(uploadStatus, '');
  });

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
      setStatus(uploadStatus, '写真を選択してください。', true);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setStatus(uploadStatus, '画像ファイルを選択してください。', true);
      return;
    }

    uploadButton.disabled = true;
    fileInput.disabled = true;
    setStatus(uploadStatus, 'アップロード中...');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${PHOTO_API_BASE}/upload`, { method: 'POST', body });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      fileInput.value = '';
      fileName.textContent = '写真が選択されていません';
      setStatus(uploadStatus, '写真を追加しました！');
      await loadPhotos();
    } catch (error) {
      setStatus(uploadStatus, '写真を追加できませんでした。時間をおいてもう一度お試しください。', true);
      console.error('Gallery upload failed:', error);
    } finally {
      uploadButton.disabled = false;
      fileInput.disabled = false;
    }
  });

  if (PHOTO_API_BASE) loadPhotos();
  else setStatus(listStatus, '写真APIの接続先が設定されていません。', true);
}
