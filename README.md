# infotech
Test task

## See
![🎞️ here must be presentation video, please wait, or page reload can help](https://drive.google.com/uc?export=view&id=1qpapzCdZPdqXXNWihjVZYj7N3aUtdzaZ)

## Steps to run
1. Must have:
    * Node.JS
    * GitHub account
2. Steps:
    * `git clone git@github.com:KolmaginDanil/infotech.git`
    * `npm i`
    * `npm run server`
    * `npm run client`

## Task

Create NodeJS application suite to manage ToDoList

details:
- should be made 2 apps: cli-client / server
- show to user only its own items (authorization), except admin,which can manage all items
- types of user: admin / user
- store server items in-memory
- authorization by username/password

client:
>used to connect to server and manage list-items (CRUD)

server:
>will be executed as system daemon, will reply on clients requests

will be plus:
- config should have option to switch between InMemoryStorage or PersistentStorage to store items
- add temporary items and erase them when ttl expired
- add client with own repl
