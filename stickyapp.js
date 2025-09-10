(() => {

// === 保存・復元まわり ===
const STICKIES_KEY = 'stickies_v3';
const root = document.getElementById('Stickynote');

let draggedElem = null;

// 一意ID
function uid() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 保存
function saveStickies() {
  const data = [...root.querySelectorAll('.sticky')].map(el => ({
    id: el.dataset.id,
    text: getMsgContent(el.querySelector('.msg'))
  }));
  localStorage.setItem(STICKIES_KEY, JSON.stringify(data));
}

// 読み込み
function loadStickies() {
  const raw = localStorage.getItem(STICKIES_KEY);
  if (!raw) return;
  let arr = [];
  try { arr = JSON.parse(raw) || []; } catch { arr = []; }
  //root.innerHTML = ''; // 保存内容を正にする
  root.querySelectorAll('.sticky').forEach(n => n.remove());
  arr.forEach(s => createSticky(s));
  highestZ = Math.max(1, ...arr.map(s => s.z || 1));
}

// === 付箋生成 ===
function createSticky(opt = {}) {
  const {
    id = uid(),
    text = ''
  } = opt;

  const wrapper = document.createElement('div');
  wrapper.className = 'sticky';
  wrapper.dataset.id = id;

  wrapper.innerHTML = `
    <div class="dragErea" ontouchstart="startDrag(event)" onmousedown="startDrag(event)">
      <div class ="stickyEx" onclick="exSticky(this)">▼</div>
      <div class="stickyDlPointa" onclick="clsSticky(this)">×</div>
    </div>
    <div class="msg" contenteditable="true" rows="4" cols="40"></div>
  `;

  // テキスト復元
  const ta = wrapper.querySelector('.msg');
  //ta.value = text;
  setMsgContent(ta, text);

  enableMsgRichInput(ta);

  // 入力で保存
  ta.addEventListener('input', saveStickies);

  // クリックで最前面
  wrapper.addEventListener('mousedown', () => bringToFront(wrapper));
  wrapper.addEventListener('touchstart', () => bringToFront(wrapper), {passive:true});

  // リサイズ監視で保存
  const ro = new ResizeObserver(() => saveStickies());
  ro.observe(wrapper);

  root.appendChild(wrapper);
  return wrapper;
}

// === 付箋追加（元の memoAdd を保存対応に差し替え） ===
async function memoAdd() {

  const area = document.getElementById('Stickynote');
  area.prepend(createSticky());
  saveTasks();
}

// === ドラッグ ===
function startDrag(e) {
  draggedElem = e.target.closest('.sticky');
  if (!draggedElem) return;

  const point = e.touches ? e.touches[0] : e;

  bringToFront(draggedElem);

  const rect = draggedElem.getBoundingClientRect();
  offsetX = point.clientX - rect.left;
  offsetY = point.clientY - rect.top;

  draggedElem.style.position = 'absolute';

  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', dragMove, { passive: false });
  document.addEventListener('touchend', endDrag);
}

function dragMove(e) {
  if (!draggedElem) return;
  const point = e.touches ? e.touches[0] : e;
  e.preventDefault(); // タッチスクロール抑止

  // ルートに対する相対座標にしたい場合
  const rootRect = root.getBoundingClientRect();
  const x = point.clientX - rootRect.left - offsetX;
  const y = point.clientY - rootRect.top  - offsetY;

  draggedElem.style.left = `${x}px`;
  draggedElem.style.top  = `${y}px`;
}

function endDrag() {
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', dragMove);
  document.removeEventListener('touchend', endDrag);
  if (draggedElem) saveStickies();
  draggedElem = null;
}

// 削除
async function clsSticky(buttonElem) {
  const stickyMemo = buttonElem.closest(".sticky");
  if (stickyMemo) {
    stickyMemo.remove();
    saveStickies();
  }
}

async function exSticky(buttonElem) {
  const stickyMemoEx = buttonElem.closest(".sticky");
  if (stickyMemoEx) {
    stickyMemoEx.classList.toggle("Exsticky");
    document.getElementById('.stickyEx').innerText = "▲";
  }
}

// 既存要素にもイベント付与して保存
function enableExistingStickies() {
  root.querySelectorAll('.sticky').forEach(el => {
    if (!el.dataset.id) el.dataset.id = uid();
    el.style.position = 'absolute';
    el.querySelector('.msg')?.addEventListener('input', saveStickies);
    el.addEventListener('mousedown', () => bringToFront(el));
    el.addEventListener('touchstart', () => bringToFront(el), {passive:true});
    const ro = new ResizeObserver(() => saveStickies());
    ro.observe(el);
  });
  saveStickies();
}

// 初期化：保存があれば復元、なければ既存DOMを有効化
document.addEventListener('DOMContentLoaded', () => {
  const hasSaved = !!localStorage.getItem(STICKIES_KEY);
  if (hasSaved) {
    loadStickies();
  } else {
    enableExistingStickies();
  }
});

// 追加：msg要素の中身を取得
function getMsgContent(node) {
  if (!node) return '';
  if (node.isContentEditable) return node.innerHTML;           // contenteditable
  if ('value' in node) return node.value;                      // textarea/input
  return node.textContent ?? '';                               // それ以外
}

// 追加：msg要素へ中身をセット
function setMsgContent(node, val = '') {
  if (!node) return;
  if (node.isContentEditable) {
    node.innerHTML = val;                                      // HTMLとして復元（改行保持）
  } else if ('value' in node) {
    // 万一HTML文字列が保存されていても見栄え良く
    node.value = val.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  } else {
    node.textContent = val;
  }
}

// msg要素にD&D／ペーストを付与
function enableMsgRichInput(msgEl) {
  if (!msgEl) return;

  // 視覚フィードバック用クラス（任意）
  msgEl.addEventListener('dragenter', (e) => {
    e.preventDefault();
    msgEl.classList.add('dragover');
  });
  msgEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
    msgEl.classList.remove('dragover');
  });
  msgEl.addEventListener('dragover', (e) => {
    // 既定の「開く」を抑止
    e.preventDefault();
  });


}

new Sortable(document.getElementById("Stickynote"), {
  animation: 500,
  ghostClass: 'sortable-ghost' // 選択中のスタイル（任意）
});


  window.memoAdd   = memoAdd;
  window.clsSticky = clsSticky;
  window.exSticky = exSticky;
  window.startDrag = startDrag;


})();
