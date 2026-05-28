require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;


// ======================================
// CLAUDE AI TASK EXTRACTION
// ======================================
async function extractTaskDetails(message) {

  console.log("🤖 Sending message to Claude AI...");

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `
Extract task details from this message and return ONLY valid JSON.

Message:
"${message}"

Return format:
{
  "task": "",
  "assignee": "",
  "deadline": "",
  "priority": ""
}
`
        }
      ]
    },
    {
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    }
  );

  let rawText = response.data.content[0].text;

  console.log("📝 Claude raw response:", rawText);

  // Remove markdown formatting if Claude adds it
  rawText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(rawText);

  console.log("✅ Extracted task data:", parsed);

  return parsed;
}


// ======================================
// SEND TO ZAPIER
// ======================================
async function sendToZapier(taskData) {

  console.log("📩 Sending data to Zapier webhook...");

  const response = await axios.post(
    ZAPIER_WEBHOOK,
    {
      task: taskData.task,
      assignee: taskData.assignee,
      deadline: taskData.deadline,
      priority: taskData.priority
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  console.log("✅ Zapier response status:", response.status);

  return response.data;
}


// ======================================
// NORMAL API ROUTE
// ======================================
app.post("/task", async (req, res) => {

  try {

    const { message } = req.body;

    console.log("\n==============================");
    console.log("📥 New task received:", message);
    console.log("==============================\n");

    const taskData = await extractTaskDetails(message);

    await sendToZapier(taskData);

    res.json({
      success: true,
      data: taskData
    });

  } catch (err) {

    console.error("❌ Error processing task:", err.message);

    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }

    res.status(500).json({
      success: false,
      error: "Failed to process the task."
    });
  }
});


// ======================================
// SLACK EVENTS ROUTE
// ======================================
app.post("/slack/events", async (req, res) => {

  const body = req.body;

  console.log("Slack body:", body);

  // Slack verification
  if (body.type === "url_verification") {
    return res.status(200).send(body.challenge);
  }

  // Slack event callback
  if (body.event) {

    // Ignore bot messages
    if (body.event.bot_id) {
      return res.sendStatus(200);
    }

    // Extract Slack message
    let message = body.event.text;

    // Remove bot mention
    message = message.replace(/<@[^>]+>/g, "").trim();

    console.log("💬 Cleaned Slack message:", message);

    try {

      // AI extraction
      const taskData = await extractTaskDetails(message);

      console.log("FINAL TASK DATA:", taskData);

      // Send to Zapier
      await sendToZapier(taskData);

      console.log("🎉 Slack task automation completed successfully");

    } catch (err) {

      console.error("❌ Slack processing error:", err.message);

      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
    }
  }

  res.sendStatus(200);
});


// ======================================
// HEALTH CHECK
// ======================================
app.get("/", (req, res) => {
  res.send("🚀 AI Task Agent Server is Running");
});


// ======================================
// START SERVER
// ======================================
app.listen(PORT, () => {

  console.log(`
🚀 AI Task Agent server is running on http://localhost:${PORT}

POST /task
POST /slack/events
GET /
`);
});