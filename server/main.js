'use strict';

import http from 'http';
import { addTodo, deleteTodo, getTodos, getUser, updateTodo } from './db.js';
import { parseJSON } from './utils.js';

const PORT = process.env.PORT ?? 8000;

const routing = {
  'GET': {
    '/auth': async (req) => {
      const { email, password } = JSON.parse(req.body);
      return (!!getUser(email, password)).toString();
    },
    '/todos': async (req) => {
      const { email, password } = JSON.parse(req.body);
      return getTodos(email, password);
    },
  },
  'POST': {
    '/todos': async (req) => {
      const { title, body, email, password } = JSON.parse(req.body);
      addTodo(title, body, email, password);
    },
  },
  'PUT': {
    '/todos': async (req) => {
      const { title, body, email, password } = JSON.parse(req.body);
      updateTodo(title, body, email, password);
    },
  },
  'DELETE': {
    '/todos': async (req) => {
      const { title, email, password } = JSON.parse(req.body);
      deleteTodo(title, email, password);
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
