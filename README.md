# AI Task Agent 🤖

A lightweight Node.js backend that turns natural-language task messages into structured data using **Claude AI**, then sends them to **Google Sheets** via a **Zapier webhook**.

## How It Works

```
User Message ──▶ Express API ──▶ Claude AI ──▶ Zapier Webhook ──▶ Google Sheets
```

1. You send a plain-English task to `POST /task`
2. Claude extracts **task**, **assignee**, **deadline**, and **priority**
3. The structured JSON is forwarded to your Zapier webhook
4. Zapier writes a new row in Google Sheets

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key
ZAPIER_WEBHOOK=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
PORT=3000
```

### 3. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

You should see:

```
🚀 AI Task Agent server is running on http://localhost:3000
   POST /task  — send a natural-language task message
   GET  /      — health check
```

---

## API Reference

### `GET /`

Health check.

**Response:**

```json
{
  "status": "ok",
  "message": "AI Task Agent is running 🚀"
}
```

### `POST /task`

Extract structured task data from a natural-language message.

**Request body:**

```json
{
  "message": "Sreeram finish backend integration by Friday high priority"
}
```

**Successful response (200):**

```json
{
  "success": true,
  "taskData": {
    "task": "Finish backend integration",
    "assignee": "Sreeram",
    "deadline": "Friday",
    "priority": "High"
  },
  "zapierResponse": "success"
}
```

**Error response (400 — missing message):**

```json
{
  "success": false,
  "error": "Request body must include a \"message\" string."
}
```

**Error response (500 — server error):**

```json
{
  "success": false,
  "error": "Failed to process the task. Check server logs for details."
}
```

---

## Example Postman Request

| Field        | Value                                   |
| ------------ | --------------------------------------- |
| **Method**   | `POST`                                  |
| **URL**      | `http://localhost:3000/task`             |
| **Headers**  | `Content-Type: application/json`        |
| **Body**     | raw JSON (see below)                    |

```json
{
  "message": "Sreeram finish backend integration by Friday high priority"
}
```

Or use **cURL**:

```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{"message": "Sreeram finish backend integration by Friday high priority"}'
```

---

## Zapier Setup

1. Go to [zapier.com](https://zapier.com) and create a new Zap
2. **Trigger:** Choose *Webhooks by Zapier* → *Catch Hook*
3. Copy the webhook URL and paste it into your `.env` as `ZAPIER_WEBHOOK`
4. **Action:** Choose *Google Sheets* → *Create Spreadsheet Row*
5. Map the fields: `task`, `assignee`, `deadline`, `priority`
6. Test and publish your Zap!

---

## Project Structure

```
ai-task-agent/
├── server.js          # Main application (Express + Claude + Zapier)
├── package.json       # Dependencies and scripts
├── .env.example       # Template for environment variables
├── .gitignore         # Files excluded from version control
└── README.md          # This file
```

---

## Tech Stack

| Tool       | Purpose                          |
| ---------- | -------------------------------- |
| Node.js    | Runtime                          |
| Express    | Web server / routing             |
| Axios      | HTTP client (Claude + Zapier)    |
| CORS       | Cross-origin request support     |
| dotenv     | Load environment variables       |
| Claude AI  | Natural language → structured data |
| Zapier     | Webhook → Google Sheets pipeline |

---

## License

ISC
