'use strict';

import http from 'http';
import { readFileSync, writeFileSync } from 'fs';

const readDB = () => JSON.parse(
  readFileSync(new URL('./db.json', import.meta.url)).toString(),
);

const writeDB = (db) => writeFileSync(
  './server/db.json', new Uint8Array(Buffer.from(parseJSON(db))),
);

let db = readDB();

const parseJSON = (str) => JSON.stringify(str, null, 3);

const PORT = process.env.PORT ?? 8000;

const routing = {
  'GET': {
    '/auth': async (req) => {
      const { email, password } = JSON.parse(req.body);
      return db.users
        .some(u => u.email === email && u.password.toString() === password)
        .toString();
    },
    '/todos': async (req) => {
      const { email, password } = JSON.parse(req.body);
      const user = db.users
        .find(u => u.email === email && u.password.toString() === password);
      if (!user) return 'Not allowed';
      if (user.isAdmin) return db.users.map(u => u.todos);
      else return user.todos;
    },
  },
  'POST': {
    '/todos': async (req) => {
      const { title, body, email, password } = JSON.parse(req.body);
      const userId = db.users
        .findIndex(u => u.email === email && u.password.toString() === password);
      if (userId === -1) return 'Not allowed';
      db.users[userId].todos.push({ title, body });
      writeDB(db);
    },
  },
  'PUT': {
    '/todos': async (req) => {
      const { title, body, email, password } = JSON.parse(req.body);
      const userId = db.users
        .findIndex(u => u.email === email && u.password.toString() === password);
      if (userId === -1) return 'Not allowed';
      db.users[userId].todos = db.users[userId].todos.filter(todo => todo.title !== title);
      db.users[userId].todos.push({ title, body });
      writeDB(db);
      return db.todos;
    },
  },
  'DELETE': {
    '/todos': async (req) => {
      const { title, email, password } = JSON.parse(req.body);
      const userId = db.users
        .findIndex(u => u.email === email && u.password.toString() === password);
      if (userId === -1) return 'Not allowed';
      db.users[userId].todos = db.users[userId].todos.filter(todo => todo.title !== title);
      writeDB(db);
      return db.todos;
    },
  },
  'OPTIONS': {},
};

const types = {
  'object': parseJSON,
  'function': async (fn, req, res) => await fn(req, res),
  'undefined': () => 'not found',
};

http.createServer(async (req, res) => {
  const { method, url } = req;
  let result = routing[method][url];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', async () => {
    req.body = req.body || Buffer.concat(body).toString();
    let type = typeof result;
    let serializer;
    while (type !== 'string') {
      serializer = types[type];
      result = await serializer(result, req, res);
      type = typeof result;
    }
    res.end(result);
  });
}).listen(
  PORT, undefined, undefined,
  () => console.log(`Server started on PORT: ${PORT}`),
);
