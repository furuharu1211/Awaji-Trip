<<<<<<< HEAD
// ============================================================
// 思い出写真ページ
// GitHub Pages + Cloudflare Worker + R2
//
// 機能:
// - 写真一覧取得
// - 写真追加ボタンから写真ライブラリを開く
// - 複数写真アップロード
// - 20MB超の画像だけ条件付き圧縮
// - 新しい写真を上に表示
// - 削除モード
// - 写真1枚選択
// - 削除確認モーダル
// - R2から写真削除
// ============================================================

=======
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
>>>>>>> 275cf3192723dddd1ba272f793d3093bc77b52d1

// ------------------------------------------------------------
// Cloudflare Worker URL
// 末尾の「/」は自動削除
// ------------------------------------------------------------

const PHOTO_API_BASE =
  'https://awaji-photo-api.nagoharu2024.workers.dev'
    .replace(/\/+$/, '');


// ------------------------------------------------------------
// 設定
// ------------------------------------------------------------

// 20MBを超える画像だけ圧縮
const MAX_UPLOAD_SIZE =
  20 * 1024 * 1024;


// ============================================================
// HTML要素
// ============================================================

// 写真追加
const fileInput =
  document.querySelector('#gallery-file');

const photoSelectButton =
  document.querySelector('#gallery-photo-select-button');

const uploadStatus =
  document.querySelector('#gallery-upload-status');


// 写真一覧
const listStatus =
  document.querySelector('#gallery-list-status');

const galleryEmpty =
  document.querySelector('#gallery-empty');

const galleryGrid =
  document.querySelector('#gallery-grid');


// 削除モード
const deleteModeButton =
  document.querySelector('#gallery-delete-mode-button');

const deleteModeBar =
  document.querySelector('#gallery-delete-mode-bar');

const deleteModeCancelButton =
  document.querySelector('#gallery-delete-mode-cancel');

const deleteAction =
  document.querySelector('#gallery-delete-action');

const deleteSelectedButton =
  document.querySelector('#gallery-delete-selected-button');


// 削除モーダル
const deleteModal =
  document.querySelector('#gallery-delete-modal');

const deleteModalOverlay =
  document.querySelector('#gallery-delete-modal-overlay');

const deleteCancelButton =
  document.querySelector('#gallery-delete-cancel-button');

const deleteConfirmButton =
  document.querySelector('#gallery-delete-confirm-button');


// ============================================================
// 状態
// ============================================================

let isDeleteMode = false;

let selectedPhoto = null;

let isUploading = false;

let isDeleting = false;


// ============================================================
// 共通関数
// ============================================================

function setStatus(
  element,
  message,
  isError = false
) {

  if (!element) return;

  element.textContent = message;

  element.classList.toggle(
    'is-error',
    isError
  );
}

<<<<<<< HEAD

// ------------------------------------------------------------
// 写真URL生成
// ------------------------------------------------------------

function photoUrl(photo) {

  // keyだけの文字列
  if (typeof photo === 'string') {

    return `${PHOTO_API_BASE}/photo/${
      photo
        .split('/')
        .map(encodeURIComponent)
        .join('/')
    }`;
  }


  // Workerがurlを返した場合
  if (
    photo &&
    typeof photo.url === 'string'
  ) {

    const url =
      new URL(
        photo.url,
        PHOTO_API_BASE
      );

    const apiOrigin =
      new URL(
        PHOTO_API_BASE
      ).origin;


    // Workerと異なるoriginは禁止
    if (
      url.origin !== apiOrigin
    ) {

      throw new Error(
        'Invalid photo URL'
      );
    }


    return url.href;
  }


  // keyを持つオブジェクト
  if (
    photo &&
    typeof photo.key === 'string'
  ) {

    return `${PHOTO_API_BASE}/photo/${
      photo.key
        .split('/')
        .map(encodeURIComponent)
        .join('/')
    }`;
  }


  throw new Error(
    'Invalid photo entry'
  );
=======
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
>>>>>>> 275cf3192723dddd1ba272f793d3093bc77b52d1
}


// ------------------------------------------------------------
// 写真key取得
// ------------------------------------------------------------

function photoKey(photo) {

  if (
    typeof photo === 'string'
  ) {

    return photo;
  }


  if (
    photo &&
    typeof photo.key === 'string'
  ) {

    return photo.key;
  }


  throw new Error(
    'Invalid photo key'
  );
}


// ============================================================
// ギャラリー読み込み
// ============================================================

async function loadPhotos() {
<<<<<<< HEAD

  setStatus(
    listStatus,
    '写真を読み込んでいます...'
  );


  galleryGrid.hidden = true;

  galleryEmpty.hidden = true;


  try {

    const response =
      await fetch(
        `${PHOTO_API_BASE}/photos`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const result =
      await response.json();


    let photos =
      Array.isArray(result)
        ? result
        : result.photos;


    if (
      !Array.isArray(photos)
    ) {

      throw new Error(
        'Invalid photo list'
      );
    }


    // 新しい写真を上に表示
    photos =
      [...photos].sort(
        (a, b) => {

          const dateA =
            new Date(
              a?.uploaded || 0
            ).getTime();

          const dateB =
            new Date(
              b?.uploaded || 0
            ).getTime();

          return dateB - dateA;
        }
      );


    const fragment =
      document.createDocumentFragment();


    photos.forEach(
      (photo, index) => {

        const figure =
          createGalleryItem(
            photo,
            index
          );


        fragment.append(
          figure
        );
      }
    );


    galleryGrid.replaceChildren(
      fragment
    );


    if (
      photos.length === 0
    ) {

      galleryGrid.hidden =
        true;

      galleryEmpty.hidden =
        false;

    }

    else {

      galleryGrid.hidden =
        false;

      galleryEmpty.hidden =
        true;
    }


    setStatus(
      listStatus,
      ''
    );

  }

  catch (error) {

    console.error(
      'Gallery load failed:',
      error
    );


    setStatus(
      listStatus,
      '写真を読み込めませんでした。時間をおいて再読み込みしてください。',
      true
    );
  }
}


// ============================================================
// ギャラリー1枚分を作成
// ============================================================

function createGalleryItem(
  photo,
  index
) {

  const figure =
    document.createElement(
      'figure'
    );


  figure.className =
    'gallery-item';


  const key =
    photoKey(photo);


  figure.dataset.photoKey =
    key;


  const img =
    document.createElement(
      'img'
    );


  img.src =
    photoUrl(photo);

  img.alt =
    `家族旅行の思い出写真${index + 1}`;

  img.loading =
    'lazy';

  img.decoding =
    'async';


  // iOS Safariの長押し操作を
  // 今後誤操作しにくくする
  img.draggable =
    false;


  // ----------------------------------------------------------
  // 選択チェックマーク
  // ----------------------------------------------------------

  const check =
    document.createElement(
      'span'
    );


  check.className =
    'gallery-select-check';

  check.textContent =
    '✓';

  check.setAttribute(
    'aria-hidden',
    'true'
  );


  // ----------------------------------------------------------
  // 削除モード中のみ写真タップで選択
  // ----------------------------------------------------------

  figure.addEventListener(
    'click',
    () => {

      if (
        !isDeleteMode
      ) {

        return;
      }


      selectPhoto(
        photo,
        figure
      );
    }
  );


  figure.append(
    img,
    check
  );


  return figure;
=======
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
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)) {
    throw new Error('この形式の大きな画像は圧縮できません。20MB以下の画像を選んでください。');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const outputType = ['image/heic', 'image/heif'].includes(file.type) ? 'image/jpeg' : file.type;
    const outputName = outputType === file.type ? file.name : file.name.replace(/\.[^.]+$/, '') + '.jpg';
    let scale = Math.min(1, 6000 / Math.max(image.naturalWidth, image.naturalHeight));
    for (let attempt = 0; attempt < 8; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.floor(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('画像を圧縮できませんでした。');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const quality = outputType === 'image/png' ? undefined : Math.max(.72, .92 - attempt * .025);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, outputType, quality));
      canvas.width = canvas.height = 0;
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        return new File([blob], outputName, { type: outputType, lastModified: file.lastModified });
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
>>>>>>> 275cf3192723dddd1ba272f793d3093bc77b52d1
}


// ============================================================
// 画像圧縮
// 20MBを超えた場合のみ処理
// ============================================================

async function prepareImage(file) {

  // ----------------------------------------------------------
  // 20MB以下は元画像そのまま
  // ----------------------------------------------------------

  if (
    file.size <=
    MAX_UPLOAD_SIZE
  ) {

    return file;
  }


  console.log(
    'Large image detected:',
    file.name,
    `${(
      file.size /
      1024 /
      1024
    ).toFixed(1)}MB`
  );


  // ----------------------------------------------------------
  // 画像をブラウザで読み込み
  // ----------------------------------------------------------

  let bitmap;


  try {

    bitmap =
      await createImageBitmap(
        file
      );

  }

  catch (error) {

    console.error(
      'Image decode failed:',
      error
    );


    throw new Error(
      `${file.name} はブラウザで圧縮できない画像形式です。`
    );
  }


  let width =
    bitmap.width;

  let height =
    bitmap.height;


  // ----------------------------------------------------------
  // 極端に大きな画像はまず長辺を5000px程度へ
  // ----------------------------------------------------------

  const INITIAL_MAX_DIMENSION =
    5000;


  if (
    width >
      INITIAL_MAX_DIMENSION ||
    height >
      INITIAL_MAX_DIMENSION
  ) {

    const scale =
      Math.min(
        INITIAL_MAX_DIMENSION /
          width,

        INITIAL_MAX_DIMENSION /
          height
      );


    width =
      Math.round(
        width * scale
      );

    height =
      Math.round(
        height * scale
      );
  }


  const canvas =
    document.createElement(
      'canvas'
    );


  const context =
    canvas.getContext(
      '2d'
    );


  if (!context) {

    bitmap.close();


    throw new Error(
      '画像処理を開始できませんでした。'
    );
  }


  // ----------------------------------------------------------
  // 保存形式
  // ----------------------------------------------------------

  let outputType =
    file.type;


  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


  // Canvas非対応形式の場合はJPEGへ
  if (
    !supportedTypes.includes(
      outputType
    )
  ) {

    outputType =
      'image/jpeg';
  }


  let quality =
    0.95;


  let resultBlob =
    null;


  // ----------------------------------------------------------
  // 少しずつ縮小して20MB以下を目指す
  // ----------------------------------------------------------

  for (
    let attempt = 0;
    attempt < 8;
    attempt++
  ) {

    canvas.width =
      width;

    canvas.height =
      height;


    context.clearRect(
      0,
      0,
      width,
      height
    );


    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );


    resultBlob =
      await new Promise(
        resolve => {

          canvas.toBlob(
            resolve,
            outputType,
            quality
          );
        }
      );


    if (!resultBlob) {

      bitmap.close();


      throw new Error(
        `${file.name} の圧縮に失敗しました。`
      );
    }


    // 20MB以下
    if (
      resultBlob.size <=
      MAX_UPLOAD_SIZE
    ) {

      break;
    }


    // 画像サイズを少し縮小
    width =
      Math.round(
        width * 0.85
      );

    height =
      Math.round(
        height * 0.85
      );


    // JPEG / WebPの場合は品質も少し下げる
    if (
      outputType ===
        'image/jpeg' ||
      outputType ===
        'image/webp'
    ) {

      quality =
        Math.max(
          0.75,
          quality - 0.04
        );
    }
  }


  bitmap.close();


  if (!resultBlob) {

    throw new Error(
      `${file.name} の圧縮に失敗しました。`
    );
  }


  if (
    resultBlob.size >
    MAX_UPLOAD_SIZE
  ) {

    throw new Error(
      `${file.name} を20MB以下にできませんでした。`
    );
  }


  // ----------------------------------------------------------
  // ファイル名
  // ----------------------------------------------------------

  let newName =
    file.name;


  if (
    outputType ===
      'image/jpeg' &&
    file.type !==
      'image/jpeg'
  ) {

    const baseName =
      file.name.replace(
        /\.[^.]+$/,
        ''
      );


    newName =
      `${baseName}.jpg`;
  }


  const compressedFile =
    new File(
      [resultBlob],
      newName,
      {
        type:
          outputType,

        lastModified:
          file.lastModified
      }
    );


  console.log(
    'Image compressed:',
    file.name,
    `${(
      file.size /
      1024 /
      1024
    ).toFixed(1)}MB`,
    '→',
    `${(
      compressedFile.size /
      1024 /
      1024
    ).toFixed(1)}MB`
  );


  return compressedFile;
}


// ============================================================
// 1枚アップロード
// ============================================================

async function uploadPhoto(file) {

  if (
    !file.type ||
    !file.type.startsWith(
      'image/'
    )
  ) {

    throw new Error(
      `${file.name} は画像ファイルではありません。`
    );
  }


  const uploadFile =
    await prepareImage(
      file
    );


  const body =
    new FormData();


  body.append(
    'file',
    uploadFile
  );


  const response =
    await fetch(
      `${PHOTO_API_BASE}/upload`,
      {
        method:
          'POST',

        body
      }
    );


  if (
    !response.ok
  ) {

    let detail =
      '';


    try {

      const errorData =
        await response.json();


      detail =
        errorData.error ||
        errorData.detail ||
        '';

    }

    catch {
      // JSONでない場合は無視
    }


    throw new Error(
      detail ||
      `HTTP ${response.status}`
    );
  }


  return response.json();
}


// ============================================================
// 複数写真アップロード
// ============================================================

async function uploadPhotos(
  files
) {

  if (
    isUploading ||
    !files ||
    files.length === 0
  ) {

    return;
  }


  isUploading =
    true;


  photoSelectButton.disabled =
    true;

  fileInput.disabled =
    true;


  // 削除モード中なら一旦終了
  if (
    isDeleteMode
  ) {

    exitDeleteMode();
  }


  setStatus(
    uploadStatus,
    'アップロード中...'
  );


  let successCount =
    0;

  let failureCount =
    0;


  try {

    // --------------------------------------------------------
    // 1枚ずつ順番にアップロード
    // --------------------------------------------------------

    for (
      const file of files
    ) {

      try {

        await uploadPhoto(
          file
        );


        successCount++;

      }

      catch (error) {

        failureCount++;


        console.error(
          'Gallery upload failed:',
          file.name,
          error
        );
      }
    }


    // --------------------------------------------------------
    // 結果表示
    // --------------------------------------------------------

    if (
      successCount > 0 &&
      failureCount === 0
    ) {

      setStatus(
        uploadStatus,
        '写真を追加しました！'
      );

    }

    else if (
      successCount > 0 &&
      failureCount > 0
    ) {

      setStatus(
        uploadStatus,
        '一部の写真を追加できませんでした。',
        true
      );

    }

    else {

      setStatus(
        uploadStatus,
        '写真を追加できませんでした。時間をおいてもう一度お試しください。',
        true
      );
    }


    if (
      successCount > 0
    ) {

      await loadPhotos();
    }

  }

  finally {

    fileInput.value =
      '';


    photoSelectButton.disabled =
      false;

    fileInput.disabled =
      false;


    isUploading =
      false;
  }
}


// ============================================================
// 写真追加ボタン
// ============================================================

if (
  photoSelectButton &&
  fileInput
) {

  photoSelectButton.addEventListener(
    'click',
    () => {

      if (
        isUploading
      ) {

        return;
      }


      setStatus(
        uploadStatus,
        ''
      );


      fileInput.click();
    }
  );


  // ----------------------------------------------------------
  // 写真選択後、自動アップロード
  // ----------------------------------------------------------

  fileInput.addEventListener(
    'change',
    async () => {

      const files =
        Array.from(
          fileInput.files || []
        );


      if (
        files.length === 0
      ) {

        return;
      }


      await uploadPhotos(
        files
      );
    }
  );
}


// ============================================================
// 削除モード
// ============================================================

function enterDeleteMode() {

  if (
    isUploading ||
    isDeleting
  ) {

    return;
  }


  isDeleteMode =
    true;


  clearSelectedPhoto();


  if (
    deleteModeBar
  ) {

    deleteModeBar.hidden =
      false;
  }


  if (
    deleteAction
  ) {

    deleteAction.hidden =
      true;
  }


  if (
    deleteModeButton
  ) {

    deleteModeButton.disabled =
      true;
  }


  if (
    photoSelectButton
  ) {

    photoSelectButton.disabled =
      true;
  }


  galleryGrid?.classList.add(
    'is-delete-mode'
  );
}


function exitDeleteMode() {

  isDeleteMode =
    false;


  clearSelectedPhoto();


  if (
    deleteModeBar
  ) {

    deleteModeBar.hidden =
      true;
  }


  if (
    deleteAction
  ) {

    deleteAction.hidden =
      true;
  }


  if (
    deleteModeButton
  ) {

    deleteModeButton.disabled =
      false;
  }


  if (
    photoSelectButton
  ) {

    photoSelectButton.disabled =
      false;
  }


  galleryGrid?.classList.remove(
    'is-delete-mode'
  );
}


// ============================================================
// 写真選択
// ============================================================

function selectPhoto(
  photo,
  figure
) {

  if (
    !isDeleteMode
  ) {

    return;
  }


  clearSelectedPhoto();


  selectedPhoto =
    {
      photo,
      figure,
      key:
        photoKey(photo)
    };


  figure.classList.add(
    'is-selected'
  );


  if (
    deleteAction
  ) {

    deleteAction.hidden =
      false;
  }
}


// ------------------------------------------------------------
// 選択解除
// ------------------------------------------------------------

function clearSelectedPhoto() {

  if (
    selectedPhoto?.figure
  ) {

    selectedPhoto.figure.classList.remove(
      'is-selected'
    );
  }


  selectedPhoto =
    null;


  if (
    deleteAction
  ) {

    deleteAction.hidden =
      true;
  }
}


// ============================================================
// 削除モーダル
// ============================================================

function openDeleteModal() {

  if (
    !selectedPhoto ||
    !deleteModal
  ) {

    return;
  }


  deleteModal.hidden =
    false;


  document.body.classList.add(
    'gallery-modal-open'
  );


  // モーダル表示後に削除ボタンへフォーカス
  requestAnimationFrame(
    () => {

      deleteConfirmButton?.focus();
    }
  );
}


function closeDeleteModal() {

  if (
    !deleteModal
  ) {

    return;
  }


  deleteModal.hidden =
    true;


  document.body.classList.remove(
    'gallery-modal-open'
  );
}


// ============================================================
// 写真削除API
// ============================================================

async function deletePhoto(
  key
) {

  const encodedKey =
    key
      .split('/')
      .map(encodeURIComponent)
      .join('/');


  const response =
    await fetch(
      `${PHOTO_API_BASE}/photo/${encodedKey}`,
      {
        method:
          'DELETE'
      }
    );


  if (
    !response.ok
  ) {

    let detail =
      '';


    try {

      const errorData =
        await response.json();


      detail =
        errorData.error ||
        errorData.detail ||
        '';

    }

    catch {
      // JSONでない場合は無視
    }


    throw new Error(
      detail ||
      `HTTP ${response.status}`
    );
  }


  return response.json();
}


// ============================================================
// 削除確定
// ============================================================

async function confirmDelete() {

  if (
    isDeleting ||
    !selectedPhoto
  ) {

    return;
  }


  isDeleting =
    true;


  const key =
    selectedPhoto.key;


  if (
    deleteConfirmButton
  ) {

    deleteConfirmButton.disabled =
      true;
  }


  if (
    deleteCancelButton
  ) {

    deleteCancelButton.disabled =
      true;
  }


  try {

    await deletePhoto(
      key
    );


    closeDeleteModal();


    exitDeleteMode();


    setStatus(
      listStatus,
      '写真を削除しました。'
    );


    await loadPhotos();

  }

  catch (error) {

    console.error(
      'Gallery delete failed:',
      error
    );


    setStatus(
      listStatus,
      '写真を削除できませんでした。時間をおいてもう一度お試しください。',
      true
    );
  }

  finally {

    if (
      deleteConfirmButton
    ) {

      deleteConfirmButton.disabled =
        false;
    }


    if (
      deleteCancelButton
    ) {

      deleteCancelButton.disabled =
        false;
    }


    isDeleting =
      false;
  }
}


// ============================================================
// 削除関連イベント
// ============================================================

deleteModeButton?.addEventListener(
  'click',
  enterDeleteMode
);


deleteModeCancelButton?.addEventListener(
  'click',
  exitDeleteMode
);


deleteSelectedButton?.addEventListener(
  'click',
  openDeleteModal
);


deleteCancelButton?.addEventListener(
  'click',
  closeDeleteModal
);


deleteModalOverlay?.addEventListener(
  'click',
  closeDeleteModal
);


deleteConfirmButton?.addEventListener(
  'click',
  confirmDelete
);


// ------------------------------------------------------------
// Escキーでモーダルを閉じる
// ------------------------------------------------------------

document.addEventListener(
  'keydown',
  event => {

    if (
      event.key !== 'Escape'
    ) {

      return;
    }


    if (
      deleteModal &&
      !deleteModal.hidden
    ) {

      closeDeleteModal();

      return;
    }


    if (
      isDeleteMode
    ) {

      exitDeleteMode();
    }
  }
);


// ============================================================
// 初回読み込み
// ============================================================

if (
  PHOTO_API_BASE
) {

  loadPhotos();

}

else {

  setStatus(
    listStatus,
    '写真APIの接続先が設定されていません。',
    true
  );
}