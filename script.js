const STORAGE_KEY = "my-todo-app-v1";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const todoList = document.getElementById("todo-list");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const doneCount = document.getElementById("done-count");

const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clear-completed");

let todos = loadTodos();
let currentFilter = "all";

// 保存済みTODOを取得
function loadTodos() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("読み込みエラー:", error);
    return [];
  }
}

// TODOを保存
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("保存エラー:", error);
    alert("データの保存に失敗しました。");
  }
}

// ID生成
function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString() + Math.random().toString(36).slice(2);
}

// TODO追加
todoForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const title = todoInput.value.trim();

  if (!title) return;

  const newTodo = {
    id: createId(),
    title: title,
    completed: false,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);

  saveTodos();
  renderTodos();

  todoForm.reset();
  todoInput.focus();
});

// 完了状態切り替え
function toggleTodo(id) {
  const todo = todos.find(todo => todo.id === id);

  if (!todo) return;

  todo.completed = !todo.completed;

  saveTodos();
  renderTodos();
}

// TODO編集
function editTodo(id) {
  const todo = todos.find(todo => todo.id === id);

  if (!todo) return;

  const newTitle = prompt("タスクを編集してください", todo.title);

  if (newTitle === null) return;

  const title = newTitle.trim();

  if (!title) {
    alert("タスク名を入力してください。");
    return;
  }

  if (title.length > 100) {
    alert("タスク名は100文字以内にしてください。");
    return;
  }

  todo.title = title;

  saveTodos();
  renderTodos();
}

// TODO削除
function deleteTodo(id) {
  if (!confirm("このタスクを削除しますか？")) return;

  todos = todos.filter(todo => todo.id !== id);

  saveTodos();
  renderTodos();
}

// 完了済みを一括削除
clearCompletedButton.addEventListener("click", function() {
  const completedCount = todos.filter(todo => todo.completed).length;

  if (completedCount === 0) {
    alert("完了済みのタスクはありません。");
    return;
  }

  if (!confirm(`完了済みの${completedCount}件を削除しますか？`)) {
    return;
  }

  todos = todos.filter(todo => !todo.completed);

  saveTodos();
  renderTodos();
});

// フィルター切り替え
filterButtons.forEach(button => {
  button.addEventListener("click", function() {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    renderTodos();
  });
});

// 件数表示
function updateCounts() {
  totalCount.textContent = todos.length;
  activeCount.textContent = todos.filter(todo => !todo.completed).length;
  doneCount.textContent = todos.filter(todo => todo.completed).length;
}

// 日付の表示
function formatDate(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("-");
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

// 今日の日付
function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// TODO一覧表示
function renderTodos() {
  todoList.innerHTML = "";

  updateCounts();

  let filteredTodos = todos;

  if (currentFilter === "active") {
    filteredTodos = todos.filter(todo => !todo.completed);
  }

  if (currentFilter === "done") {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  emptyMessage.style.display =
    filteredTodos.length === 0 ? "block" : "none";

  filteredTodos.forEach(todo => {
    const li = document.createElement("li");

    li.className = "todo-item";

    if (todo.completed) {
      li.classList.add("completed");
    }

    // チェックボックス
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "完了状態を切り替える");

    checkbox.addEventListener("change", function() {
      toggleTodo(todo.id);
    });

    // タスク本文
    const content = document.createElement("div");
    content.className = "todo-content";

    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = todo.title;

    content.appendChild(title);

    // 優先度と締切
    const meta = document.createElement("div");
    meta.className = "todo-meta";

    const priority = document.createElement("span");

    const priorityValue = ["high", "medium", "low"].includes(todo.priority)
      ? todo.priority
      : "medium";

    priority.className = `priority ${priorityValue}`;

    const priorityLabels = {
      high: "優先度：高",
      medium: "優先度：中",
      low: "優先度：低"
    };

    priority.textContent = priorityLabels[priorityValue];

    meta.appendChild(priority);

    if (todo.dueDate) {
      const due = document.createElement("span");
      due.textContent = `期限：${formatDate(todo.dueDate)}`;

      if (!todo.completed && todo.dueDate < getTodayString()) {
        due.classList.add("overdue");
        due.textContent += "（期限切れ）";
      }

      meta.appendChild(due);
    }

    content.appendChild(meta);

    // 操作ボタン
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "編集";

    editButton.addEventListener("click", function() {
      editTodo(todo.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", function() {
      deleteTodo(todo.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    todoList.appendChild(li);
  });
}

// 初回表示
renderTodos();