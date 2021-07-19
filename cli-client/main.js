'use strict';

import { Questioner } from 'cli-features';
import http from 'http';
import { parseJSON } from '../server/utils.js';

const {
  generalQuestion, passQuestion, alternativeQuestion,
} = new Questioner({
  input: process.stdin,
  output: process.stdout,
});

const makeOptions = ({
                       path = '', port = 8000,
                       method = 'GET', host = 'localhost',
                       headers,
                     } = {}) => ({
  host,
  path: '/' + path,
  port: port.toString(),
  method,
  headers,
});

const speak = (options) => {
  let { body } = options;
  if (body) {
    body = parseJSON(body);
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
  }

  return new Promise((resolve) => {
    const callback = response => {
      let str = '';
      response.on('data', (chunk) => str += chunk);
      response.on('end', () => resolve(str));
    };

    let req = http.request(makeOptions(options), callback);
    req.write(body || '');
    req.end();
  });
};

const PASS_Q = 'What is your password?';
const EMAIL_Q = 'What is your email?';

let email = '';
let password = '';

const authorization = async () => {
  email = await generalQuestion(EMAIL_Q);
  password = await passQuestion(PASS_Q, {
    possibleChars: [...'0123456789'],
  });

  return await speak({
    path: 'auth',
    body: { email, password },
  });
};

(async () => {
  while (await authorization() === 'false') {
  }

  console.log(await speak({ path: 'todos', body: { email, password } }));

  const DO_Q = 'What do you want to do?';
  const TITLE_Q = 'Title:';
  const BODY_Q = 'Body:';

  const doWhat = {
    'See todos': async () => console.log(
      await speak({ path: 'todos', body: { email, password } }),
    ),
    'Add todo': async () => {
      const title = await generalQuestion(TITLE_Q);
      const body = await generalQuestion(BODY_Q);
      await speak({
        path: 'todos', method: 'POST', body: { title, body, email, password },
      });
    },
    'Update todo': async () => {
      const title = await generalQuestion(TITLE_Q);
      const body = await generalQuestion(BODY_Q);
      await speak({
        path: 'todos', method: 'PUT', body: { title, body, email, password },
      });
    },
    'Delete todo': async () => {
      const title = await generalQuestion(TITLE_Q);
      await speak({
        path: 'todos', method: 'DELETE', body: { title, email, password },
      });
    },
    'Exit': () => process.exit(),
  };

  while (true) await doWhat[
    await alternativeQuestion(DO_Q, Object.keys(doWhat))
    ]();
})();
