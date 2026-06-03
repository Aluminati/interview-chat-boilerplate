# Interview Chat Boilerplate

A real-time capable chat application used as a base for technical interviews.

## Getting started

```bash
npm install
```

Copy and configure env files (defaults work out of the box for local dev):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Create a sqlite datbase file:

```bash
cd ./server/
touch chat.db
```

### Run the server

```bash
npm run server
```

Validates env, then starts Express on `http://localhost:3000`.

### Run the client

```bash
npm run client
```

Validates env, then starts Vite dev server on `http://localhost:5173`.

### Run tests

```bash
npm run test
```

### Lint

```bash
npm run lint
```

## Architecture

```
interview-chat-boiler/
├── server/                 # Express + SQLite API
│   ├── src/
│   │   ├── env.ts          # Env schema (zod) — export `env` constant
│   │   ├── app.ts          # Express factory
│   │   ├── index.ts        # Entrypoint
│   │   ├── db/schema.ts    # SQLite setup + migrations
│   │   ├── routes/
│   │   │   ├── users.ts    # GET/POST /api/users, GET /api/users/search
│   │   │   └── chats.ts    # CRUD /api/chats, /api/chats/:id/messages
│   │   └── types/index.ts
│   └── tests/
└── client/                 # Vue 3 + Vite + Tailwind + Pinia
    ├── src/
    │   ├── env.ts           # Env schema (zod) — export `env` constant
    │   ├── main.ts
    │   ├── App.vue
    │   ├── api/index.ts     # Typed fetch wrapper
    │   ├── stores/          # Pinia: auth, chats, users
    │   ├── components/      # AppButton, AppInput, ChatSidebar, ChatWindow, …
    │   ├── views/           # LoginView, ChatView
    │   └── router/index.ts
    └── scripts/check-env.ts
```

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/search?q= | Search users by username or display name |
| POST | /api/users | Create user `{ username, display_name }` |
| GET | /api/chats?user_id= | List chats (optionally filtered by user) |
| POST | /api/chats | Create chat `{ name, participant_ids[] }` |
| GET | /api/chats/:id/messages?since= | Fetch messages (optional ISO timestamp cursor) |
| POST | /api/chats/:id/messages | Send message `{ sender_id, content }` |

## Interview tasks

Candidates are expected to extend this codebase. Possible tasks:

- **Real-time updates** — the client currently fetches messages once on load. Implement live updates (polling, SSE, WebSockets…).
- **Message reactions** — add emoji reactions to messages.
- **Message threading** — allow direct replies to individual messages.
