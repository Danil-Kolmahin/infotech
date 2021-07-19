const { Questioner } =  require('cli-features');
const http =  require('http');

const parseJSON = (str) => JSON.stringify(str, null, 3);

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
      response.on('data', function(chunk) {
        str += chunk;
      });
      response.on('end', function() {
        resolve(str);
      });
    };

    let req = http.request(makeOptions(options), callback);
    req.write(body || '');
    req.end();
  });
};

const {
  generalQuestion, passQuestion, alternativeQuestion,
} = new Questioner({
  input: process.stdin,
  output: process.stdout,
});

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
  const todos = await speak({ path: 'todos', body: { email, password } });
  console.log(todos);
  const doWhat = ['See todos', 'Add todo', 'Update todo', 'Delete todo', 'Exit'];
  const DO_Q = 'What do you want to do?';
  while (true) {
    const answer = await alternativeQuestion(DO_Q, doWhat);
    switch (answer) {
      case 'See todos': {
        console.log(await speak({
          path: 'todos', body: { email, password }
        }));
        break;
      }
      case 'Add todo': {
        const TITLE_Q = 'Title:';
        const BODY_Q = 'Body:';
        const title = await generalQuestion(TITLE_Q);
        const body = await generalQuestion(BODY_Q);
        await speak({
          path: 'todos', method: 'POST', body: { title, body, email, password },
        });
        break;
      }
      case 'Update todo': {
        const TITLE_Q = 'Title:';
        const BODY_Q = 'Body:';
        const title = await generalQuestion(TITLE_Q);
        const body = await generalQuestion(BODY_Q);
        await speak({
          path: 'todos', method: 'PUT', body: { title, body, email, password },
        });
        break;
      }
      case 'Delete todo': {
        const TITLE_Q = 'Title:';
        const title = await generalQuestion(TITLE_Q);
        await speak({
          path: 'todos', method: 'DELETE', body: { title, email, password },
        });
        break;
      }
      case 'Exit': {
        return process.exit();
      }
    }
  }
})();
