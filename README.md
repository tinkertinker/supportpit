# Support Pit

Real-time Support Chat Prototype

## Developing

Uses node 5.* (probably works no 4.* as well).

### Installing

```
git clone https://github.com/tinkertinker/supportpit
npm install
```

### Setup hosts

Team functionality is based on subdomains so set up subdomains you would like to use to point to localhost.

Example using `/etc/hosts`:

```
127.0.0.1 admin.supportchat.localhost a8c.supportchat.localhost
```

### Running

Start up the server:

```
npm start
```

To see available chats open a team `/hud/` page (e.g. http://a8c.supportchat.localhost:3000/hud/)
To start a chat open a team `/chat/` page (e.g. http://a8c.supportchat.localhost:3000/chat/)