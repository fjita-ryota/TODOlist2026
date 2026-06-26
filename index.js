const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

// 設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'));

const DATA_FILE = path.join(__dirname, 'data', 'todo.json');

const readTodos = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data || '[]');
};

const writeTodos = (todos) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
};

app.get('/', (req, res) => {
  res.redirect('/TODO.html');
});

// 一覧取得
app.get('/api/index', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// 新規追加
app.post('/api/create', (req, res) => {
  const { user, title, body, dueDate, priority } = req.body;
  const todos = readTodos();

  const newTodo = {
    id: Date.now().toString(),
    user,
    title,
    body,
    dueDate,
    priority,
    isCompleted: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo);
});

// 削除
app.delete('/api/delete/:id', (req, res) => {
  const { id } = req.params;
  const todos = readTodos();

  const filteredTodos = todos.filter(todo => todo.id !== id);

  if (todos.length === filteredTodos.length) {
    return res.status(404).json({ error: 'TODO not found' });
  }

  writeTodos(filteredTodos);
  res.status(204).send();
});

// 完了・未完了切り替え
app.patch('/api/toggle/:id', (req, res) => {
  const { id } = req.params;
  const todos = readTodos();

  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'TODO not found' });
  }

  todos[index].isCompleted = !todos[index].isCompleted;
  writeTodos(todos);
  res.json(todos[index]);
});

// 編集
app.put('/api/edit/:id', (req, res) => {
  const { id } = req.params;
  const { user, title, body, dueDate, priority } = req.body;
  const todos = readTodos();

  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'TODO not found' });
  }

  todos[index] = {
    ...todos[index],
    user,
    title,
    body,
    dueDate,
    priority
  };

  writeTodos(todos);
  res.json(todos[index]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});