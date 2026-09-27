// ============================================================
// 思い出写真ページ
// GitHub Pages + Cloudflare Worker + R2
//
// 機能:
// - 写真一覧取得
// - 写真追加ボタンから写真選択
// - 複数アップロード
// - 20MB超の画像のみ圧縮
// - 新しい写真を上に表示
// - 正方形ギャラリー
// - 写真タップで拡大表示
// - 削除モード
// - 写真1枚選択
// - 削除確認モーダル
// - R2から写真削除
// ============================================================


// ------------------------------------------------------------
// Cloudflare Worker URL
// ------------------------------------------------------------

const PHOTO_API_BASE =
  'https://awaji-photo-api.nagoharu2024.workers.dev'
    .replace(/\/+$/, '');


// ------------------------------------------------------------
// 設定
// ------------------------------------------------------------

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


// 写真拡大ビューア
const galleryViewer =
  document.querySelector('#gallery-viewer');

const galleryViewerImage =
  document.querySelector('#gallery-viewer-image');

const galleryViewerOverlay =
  document.querySelector('#gallery-viewer-overlay');

const galleryViewerClose =
  document.querySelector('#gallery-viewer-close');


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


// 削除確認モーダル
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

let isDeleteMode =
  false;

let selectedPhoto =
  null;

let isUploading =
  false;

let isDeleting =
  false;


// ============================================================
// 共通
// ============================================================

function setStatus(
  element,
  message,
  isError = false
) {

  if (!element) return;

  element.textContent =
    message;

  element.classList.toggle(
    'is-error',
    isError
  );
}


// ============================================================
// 写真key
// ============================================================

function photoKey(photo) {

  const key =
    typeof photo === 'string'
      ? photo
      : photo?.key;


  if (
    typeof key !== 'string' ||
    !key.startsWith('gallery/') ||
    key === 'gallery/'
  ) {

    throw new Error(
      'Invalid photo key'
    );
  }


  return key;
}


// ============================================================
// 写真URL
// ============================================================

function photoUrl(photo) {

  const key =
    photoKey(photo);


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


    if (
      url.origin !== apiOrigin
    ) {

      throw new Error(
        'Invalid photo URL'
      );
    }


    return url.href;
  }


  return `${PHOTO_API_BASE}/photo/${encodeURIComponent(key)}`;
}


// ============================================================
// 写真一覧取得
// ============================================================

async function loadPhotos() {

  setStatus(
    listStatus,
    '写真を読み込んでいます...'
  );


  galleryGrid.hidden =
    true;

  galleryEmpty.hidden =
    true;


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


    photos =
      [...photos].sort(
        (a, b) => {

          const timeA =
            Date.parse(
              a?.uploaded || ''
            ) || 0;

          const timeB =
            Date.parse(
              b?.uploaded || ''
            ) || 0;


          return timeB - timeA;
        }
      );


    const fragment =
      document.createDocumentFragment();


    photos.forEach(
      (photo, index) => {

        fragment.append(
          createGalleryItem(
            photo,
            index
          )
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
// ギャラリー1枚分
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

  img.draggable =
    false;


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


  figure.addEventListener(
    'click',
    () => {

      // 削除モード中
      if (
        isDeleteMode
      ) {

        selectPhoto(
          photo,
          figure
        );

        return;
      }


      // 通常モード
      openGalleryViewer(
        img.src,
        img.alt
      );
    }
  );


  figure.append(
    img,
    check
  );


  return figure;
}


// ============================================================
// 写真拡大ビューア
// ============================================================

function openGalleryViewer(
  src,
  alt
) {

  if (
    !galleryViewer ||
    !galleryViewerImage
  ) {

    return;
  }


  galleryViewerImage.src =
    src;

  galleryViewerImage.alt =
    alt || '拡大した思い出写真';


  galleryViewer.hidden =
    false;


  document.body.classList.add(
    'gallery-viewer-open'
  );


  requestAnimationFrame(
    () => {

      galleryViewerClose?.focus();
    }
  );
}


function closeGalleryViewer() {

  if (
    !galleryViewer ||
    !galleryViewerImage
  ) {

    return;
  }


  galleryViewer.hidden =
    true;


  galleryViewerImage.src =
    '';


  document.body.classList.remove(
    'gallery-viewer-open'
  );
}


// ============================================================
// 画像圧縮
// 20MB超のみ
// ============================================================

async function prepareImage(file) {

  if (
    file.size <=
    MAX_UPLOAD_SIZE
  ) {

    return file;
  }


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
        INITIAL_MAX_DIMENSION / width,
        INITIAL_MAX_DIMENSION / height
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


  let outputType =
    file.type;


  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


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


    if (
      resultBlob.size <=
      MAX_UPLOAD_SIZE
    ) {

      break;
    }


    width =
      Math.round(
        width * 0.85
      );

    height =
      Math.round(
        height * 0.85
      );


    if (
      outputType === 'image/jpeg' ||
      outputType === 'image/webp'
    ) {

      quality =
        Math.max(
          0.75,
          quality - 0.04
        );
    }
  }


  bitmap.close();


  if (
    !resultBlob ||
    resultBlob.size >
      MAX_UPLOAD_SIZE
  ) {

    throw new Error(
      `${file.name} を20MB以下にできませんでした。`
    );
  }


  let newName =
    file.name;


  if (
    outputType === 'image/jpeg' &&
    file.type !== 'image/jpeg'
  ) {

    const baseName =
      file.name.replace(
        /\.[^.]+$/,
        ''
      );


    newName =
      `${baseName}.jpg`;
  }


  return new File(
    [resultBlob],
    newName,
    {
      type:
        outputType,

      lastModified:
        file.lastModified
    }
  );
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

      const data =
        await response.json();


      detail =
        data.error ||
        data.detail ||
        '';

    }

    catch {
      // JSON以外は無視
    }


    throw new Error(
      detail ||
      `HTTP ${response.status}`
    );
  }


  return response.json();
}


// ============================================================
// 複数アップロード
// ============================================================

async function uploadPhotos(files) {

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
      successCount > 0
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
// 写真追加イベント
// ============================================================

photoSelectButton?.addEventListener(
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


fileInput?.addEventListener(
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


  deleteModeBar.hidden =
    false;

  deleteAction.hidden =
    true;

  deleteModeButton.disabled =
    true;

  photoSelectButton.disabled =
    true;


  galleryGrid.classList.add(
    'is-delete-mode'
  );
}


function exitDeleteMode() {

  isDeleteMode =
    false;


  clearSelectedPhoto();


  deleteModeBar.hidden =
    true;

  deleteAction.hidden =
    true;

  deleteModeButton.disabled =
    false;

  photoSelectButton.disabled =
    false;


  galleryGrid.classList.remove(
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


  if (
    selectedPhoto?.figure ===
    figure
  ) {

    clearSelectedPhoto();

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


  deleteAction.hidden =
    false;
}


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
// 削除確認モーダル
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
// DELETE API
// ============================================================

async function deletePhoto(key) {

  const response =
    await fetch(
      `${PHOTO_API_BASE}/photo/${encodeURIComponent(key)}`,
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

      const data =
        await response.json();


      detail =
        data.error ||
        data.detail ||
        '';

    }

    catch {
      // JSON以外は無視
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


  deleteConfirmButton.disabled =
    true;

  deleteCancelButton.disabled =
    true;


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

    deleteConfirmButton.disabled =
      false;

    deleteCancelButton.disabled =
      false;


    isDeleting =
      false;
  }
}


// ============================================================
// イベント
// ============================================================

// ビューア
galleryViewerClose?.addEventListener(
  'click',
  closeGalleryViewer
);


galleryViewerOverlay?.addEventListener(
  'click',
  closeGalleryViewer
);


// 削除
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


// ============================================================
// Escapeキー
// ============================================================

document.addEventListener(
  'keydown',
  event => {

    if (
      event.key !== 'Escape'
    ) {

      return;
    }


    if (
      galleryViewer &&
      !galleryViewer.hidden
    ) {

      closeGalleryViewer();

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