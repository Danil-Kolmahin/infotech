'use strict';

const { readFileSync, writeFileSync } =  require('fs');
const { parseJSON } =  require('./utils');

const WRONG_E_P = 'Wrong password or email';

const READ_P = __dirname + '/db.json';
const readDB = () => JSON.parse(
  readFileSync(READ_P).toString(),
);

const WRITE_P = './server/db.json';
const writeDB = (db) => writeFileSync(
  WRITE_P, new Uint8Array(Buffer.from(parseJSON(db))),
);

let dbLogic = readDB();

const getUserIndex = (email, password) => dbLogic.users
  .findIndex(u => u.email === email && u.password.toString() === password);

const getUser = (...args) => dbLogic.users[getUserIndex(...args)];

const getTodos = (email, password) => {
  const user = getUser(email, password);
  if (!user) return WRONG_E_P;
  if (user.isAdmin) return dbLogic.users.map(u => u.todos);
  else return user.todos;
};

const addTodo = (title, body, email, password) => {
  const userId = getUserIndex(email, password);
  if (userId === -1) return WRONG_E_P;
  dbLogic.users[userId].todos.push({ title, body });
  writeDB(dbLogic);
};

const deleteTodo = (title, email, password) => {
  const userId = getUserIndex(email, password);
  if (userId === -1) return WRONG_E_P;
  dbLogic.users[userId].todos = dbLogic
    .users[userId].todos.filter(todo => todo.title !== title);
  writeDB(dbLogic);
};

const updateTodo = (title, body, email, password) => {
  deleteTodo(title, email, password);
  addTodo(title, body, email, password);
};

module.exports = {
  getUser,
  getTodos,
  addTodo,
  deleteTodo,
  updateTodo
}
