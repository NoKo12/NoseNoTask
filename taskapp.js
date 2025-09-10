(() => {
    
 //======  厳格化  このコードは厳格化してマッスル =============================
  'use strict';

 // ====== 永続化(localStorage) 　このアプリはストレージに永続化しマッスル======
  const STORAGE_KEY = 'tasks_v1';

  function saveTasks() {
    const records = [...document.querySelectorAll('#taskErea .taskRecord')].map(el => ({
      id: el.dataset.id,
      date: el.querySelector('.taskDate')?.innerText || '',
      time: el.querySelector('.taskTime')?.innerText || '',
      text: el.querySelector('.textTask')?.innerText || '',
      //done: el.classList.contains('is-done')
      done: el.querySelector('.taskValue')?.classList.contains('taskDone') || false
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

 // =========アプリ起動時の保存されているタスク読み込み=======================
  function loadTasks() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return;
    const list = JSON.parse(json);
    const area = document.getElementById('taskErea');
    area.innerHTML = '';
    list.forEach(t => area.appendChild(createTaskRecord(t)));
  }

 // ========= タスク生成/追加 =============================================
  function createTaskRecord({ id, date, time, text, done } = {}) {
    const el = document.createElement('div');
    el.className = 'taskRecord';
    el.dataset.id = id || crypto.randomUUID();
    if (done) el.classList.add('is-done');

    el.innerHTML = `
        <div class ="taskMenu">
            <div class ="menuPointa"  onclick ="opnMenu(this)">三</div>
             <div class ="taskPointa" onclick="clsTask(this)">DEL</div>
            <div class ="LinkPointa">Link</div>
            <div class ="LinkPointa">Link</div>
            <div class ="LinkPointa">Link</div>
        </div>
        <div class ="taskMain">
            <div class ="donePointa" onclick ="doneTask(this)">済</div>
            <div class ="taskValue">
                <div class ="textTask" contenteditable="true" maxlength="14"></div>
            </div>
            <div class="taskPointa1">
                 <img src="img/pointa.png" alt="ドラッグ" class="dragIcon">
            </div>
        </div>
    `;
    el.querySelector('.textTask').innerText = text || '';
    return el;
  }

 // ======== 追加ボタンのクリック ============================================= 
  function taskAdd() {
    const area = document.getElementById('taskErea');
    area.prepend(createTaskRecord());
    saveTasks();

      // （任意）すぐ編集できるようにフォーカス
    el.querySelector('.textTask')?.focus();

  // （任意）スクロールを少しだけ合わせたい場合
    el.scrollIntoView({ block: 'nearest' });
  }

 // ======== 完了処理    既存の onClick 互換（必要関数だけ公開） ==============
  function doneTask(button) {
    const card = button.closest('.taskRecord');
    if (!card) return;

    // 保存用の単一真実（ソース・オブ・トゥルース）
    card.classList.toggle('is-done');
      // 見た目を合わせたい場合のみ（任意）
    const v = card.querySelector('.taskValue');
    const m = card.querySelector('.taskMeta');
    const d = card.querySelector('.donePointa');
    const on = card.classList.contains('is-done');
    v?.classList.toggle('taskDone', on);
    m?.classList.toggle('taskDone', on);
    d?.classList.toggle('taskDoneLight', on);

    saveTasks();
  }

 // ====== タスクの削除 =============================================================
  function clsTask(button) {
    const card = button.closest('.taskRecord');
    if (!card) return;
    card.remove();
    saveTasks();
  }

 async function opnMenu(buttonElem) {
    const record = buttonElem.closest('.taskRecord');
    if (!record) return;

    const menu = record.querySelector('.taskMenu');
    if (!menu) return;
    menu.classList.toggle('taskMenudisp');

    const tMain = record.querySelector('.taskMain');
    tMain.classList.toggle('taskRight');
 }


 // ====== 入力内容の監視 ===========================================================
  const taskErea = document.getElementById('taskErea');

  taskErea.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('.taskDate, .taskTime, .textTask')) {
      enforceMaxLength(t, t.classList.contains('textTask') ? 18 : 50);
      saveTasks();
    }


    if (e.target.classList.contains("textTask")) {
        const maxLength = 18;
        const currentLength = e.target.innerText.length;

        // 超過制御
        if (currentLength > maxLength) {
            e.target.innerText = e.target.innerText.slice(0, maxLength);
        }
    }
  });

 //=========キーボートのキータッチ判定===============================================
  taskErea.addEventListener("keydown", function(e) {
    //タスク内容入力欄でEnter押したら入力を解除
    if (e.target.classList.contains("textTask") && e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
    }
  });

 //======= クリック（完了/削除）デリゲート ※ inline onclick併用でもOK==============
  taskErea.addEventListener('click', (e) => {
    const del = e.target.closest('[data-role="delete"]');
    const done = e.target.closest('[data-role="done"]');
    //タスク削除へ
    if (del) { clsTask(del); }
    //タスク完了へ
    if (done) { doneTask(done); }
  });

  function enforceMaxLength(el, max) {
    const txt = el.innerText ?? '';
    if (txt.length > max) {
      el.innerText = txt.slice(0, max);
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

 // ====== タスク並び替え（ソート） ============================================
  new Sortable(document.getElementById('taskErea'), {
    animation: 300,
    handle: '.taskPointa1',
    ghostClass: 'sortable-ghost',
    onEnd: saveTasks,
  });

 // ====== アプリ起動時に前回までのタスクの内容を読み込み反映 =====================
  document.addEventListener('DOMContentLoaded', loadTasks);

 // ====== グローバル公開（inline属性対策） =====================================
  window.taskAdd   = taskAdd;
  window.doneTask  = doneTask;
  window.clsTask   = clsTask;
  window.opnMenu   = opnMenu;

})();
