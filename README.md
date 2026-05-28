# AI Task Agent 🚀

AI-powered workflow automation system that converts natural language task messages from Slack into structured task entries using Claude AI, Zapier, and Google Sheets.

---

## Features

* Natural language task extraction using Claude AI
* Slack bot integration with event subscriptions
* Automated workflow processing using Zapier
* Real-time Google Sheets task tracking
* Backend API built with Node.js and Express.js
* JSON-based structured task extraction
* Webhook automation pipeline

---

## Workflow

```text
Slack Message
      ↓
Node.js Backend
      ↓
Claude AI Extraction
      ↓
Structured JSON
      ↓
Zapier Webhook
      ↓
Google Sheets Update
```

---

## Example Input

```text
@AI Task Agent assign Rahul backend integration by Sunday high priority
```

---

## Example Extracted Output

```json
{
  "task": "backend integration",
  "assignee": "Rahul",
  "deadline": "Sunday",
  "priority": "high"
}
```

---

## Tech Stack

* Node.js
* Express.js
* Anthropic Claude API
* Slack API
* Zapier Webhooks
* Google Sheets
* Axios

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/sreeram665/ai-task-agent.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ZAPIER_WEBHOOK=your_zapier_webhook_url
PORT=3000
```

### 4. Start Server

```bash
node server.js
```

---

## API Endpoints

### POST `/task`

Processes natural language task messages.

Example Request:

```json
{
  "message": "Assign Rahul frontend integration by Friday high priority"
}
```

---

### POST `/slack/events`

Handles Slack event subscriptions and automation workflows.

---

## Slack Integration

* Slack Event Subscriptions
* `app_mention` event handling
* Real-time Slack task automation
* AI-powered task extraction

---

## Project Structure

```text
ai-task-agent/
│
├── server.js
├── package.json
├── .env
├── README.md
└── node_modules/
```

---

## Screenshots

### Slack Task Input

<img width="891" height="178" alt="image" src="https://github.com/user-attachments/assets/af3d45af-1ba0-45ee-83c1-b0c73733d00c" />

---

### Zapier Workflow Automation

<img width="706" height="654" alt="image" src="https://github.com/user-attachments/assets/17511ee5-1ea3-416f-9ed9-f0d988fd4310" />

---
### Slack Bot Message
<img width="772" height="93" alt="image" src="https://github.com/user-attachments/assets/8778573d-1db0-4d92-b4fa-ac27157a8736" />




## Future Improvements

* Slack confirmation replies
* AI-generated task summaries
* Deadline reminders
* Notion/Jira integration
* Team dashboards
* Multi-user authentication

---

## Author

Sreeram A
