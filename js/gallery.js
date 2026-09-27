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