'use strict';

import { readFileSync, writeFileSync } from 'fs';
import { parseJSON } from './utils.js';

const WRONG_E_P = 'Wrong password or email';

const isInMemory = false; // change to "true" if you want to set "in-memory" mode

const READ_P = isInMemory ? './dbInit.json' : './db.json';
const readDB = () => JSON.parse(
  readFileSync(new URL(READ_P, import.meta.url)).toString(),
);

const WRITE_P = './server/db.json';
const writeDB = (db) => isInMemory ? {} : writeFileSync(
  WRITE_P, new Uint8Array(Buffer.from(parseJSON(db))),
);

let db = readDB();

const getUserIndex = (email, password) => db.users
  .findIndex(u => u.email === email && u.password.toString() === password);

export const getUser = (...args) => db.users[getUserIndex(...args)];

export const getTodos = (email, password) => {
  const user = getUser(email, password);
  if (!user) return WRONG_E_P;
  if (user.isAdmin) return db.users.map(u => u.todos);
  else return user.todos;
};

export const addTodo = (title, body, email, password) => {
  const userId = getUserIndex(email, password);
  if (userId === -1) return WRONG_E_P;
  db.users[userId].todos.push({ title, body });
  writeDB(db);
};

export const deleteTodo = (title, email, password) => {
  const userId = getUserIndex(email, password);
  if (userId === -1) return WRONG_E_P;
  db.users[userId].todos = db
    .users[userId].todos.filter(todo => todo.title !== title);
  writeDB(db);
};

export const updateTodo = (title, body, email, password) => {
  deleteTodo(title, email, password);
  addTodo(title, body, email, password);
};
