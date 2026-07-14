# NAO_MD WhatsApp Bot

> Modern WhatsApp Bot built with Baileys (ESM), featuring a plugin system, hot reload, sticker support, media processing, and modular architecture.

## Requirements

- [x] NodeJS >= 20
- [x] FFMPEG
- [x] Server vCPU/RAM 1/1GB (Min)

## Installation

Clone repository:

```bash
git clone https://github.com/DUCKTys/NAO_MD.git
cd NAO_MD
```

Install dependencies:

```bash
npm install
```

## Configuration
Edit `.env` file:

```env
BOT=62xx
OWNER=62xx
GEMINI_KEY=your_api_key
DATABASE_URL=mongodb_url # leave empty if use localdb.json
```

> [!NOTE]
> This project uses the Gemini API for AI-powered features.
>
> Get your Gemini API Key here:
> https://aistudio.google.com/app/api-keys
> Then add it to your `.env` file:
> ```env
> GEMINI_KEY=your_api_key_here

> [!IMPORTANT]
> 🔐 Keep your API key private and don't share with other people

## Running Bot

Start bot:

```bash
npm start
```

Start with PM2:

```bash
pm2 start pm2.config.cjs && pm2 logs NAO_MD
```

## Project Structure

```text
NAO_MD/
├── core/
├── lib/
├── plugins/
├── session/
├── config.js
├── handler.js
├── index.js
├── localdb.json
├── package.json
└── README.md
```

## Plugin Example

```js
export const run = {
  cmd: ["ping"],
  category: "main",
  run: async (m, { sock }) => {
    await m.reply("pong!!!");
  }
};
```

> [!WARNING]
> This project is currently under active development.
>
> Features may change without notice.
