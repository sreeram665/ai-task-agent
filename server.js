// ============================================
//  AI Task Agent — server.js
// ============================================
//  This is the main entry point of the app.
//  It spins up an Express server with a single
//  POST /task endpoint that:
//    1. Receives a natural-language message
//    2. Sends it to Claude AI to extract structured data
//    3. Forwards the structured JSON to a Zapier webhook
//       (which stores it in Google Sheets)
// ============================================

// --------------------------------------------------
// 1. LOAD ENVIRONMENT VARIABLES
// --------------------------------------------------
// dotenv reads the .env file and makes its values
// available via process.env.VARIABLE_NAME
const dotenv = require("dotenv");
dotenv.config();

// --------------------------------------------------
// 2. IMPORT DEPENDENCIES
// --------------------------------------------------
const express = require("express");   // Web framework
const cors = require("cors");         // Cross-Origin Resource Sharing
const axios = require("axios");       // HTTP client for API calls

// --------------------------------------------------
// 3. INITIALIZE EXPRESS APP
// --------------------------------------------------
const app = express();

// Parse incoming JSON request bodies automatically
app.use(express.json());

// Allow requests from any origin (useful when testing
// with Postman or a future frontend)
app.use(cors());

// --------------------------------------------------
// 4. CONFIGURATION
// --------------------------------------------------
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;

// Quick sanity check — warn if keys are missing
if (!ANTHROPIC_API_KEY) {
  console.warn("⚠️  ANTHROPIC_API_KEY is not set in .env");
}
if (!ZAPIER_WEBHOOK) {
  console.warn("⚠️  ZAPIER_WEBHOOK is not set in .env");
}

// --------------------------------------------------
// 5. HELPER — Call Claude AI to extract task data
// --------------------------------------------------
// Takes a raw natural-language message like:
//   "Sreeram finish backend integration by Friday high priority"
// and returns structured JSON:
//   { task, assignee, deadline, priority }
async function extractTaskWithClaude(message) {
  console.log("🤖 Sending message to Claude AI...");

  // Call the Anthropic Messages API
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      // The system prompt tells Claude exactly what format to return
      system: `You are a task extraction assistant.
Extract the following fields from the user's message:
- task: a short description of the work to be done
- assignee: the person responsible
- deadline: when it should be done
- priority: Low, Medium, or High

Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.
Example output:
{"task":"Finish backend integration","assignee":"Sreeram","deadline":"Friday","priority":"High"}`,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01", // required API version header
      },
    }
  );

  // Claude returns an array of content blocks; grab the text from the first one
  const rawText = response.data.content[0].text;
  console.log("📝 Claude raw response:", rawText);

  // Parse the JSON string into a real JavaScript object
  const taskData = JSON.parse(rawText);
  return taskData;
}

// --------------------------------------------------
// 6. HELPER — Send structured data to Zapier webhook
// --------------------------------------------------
// Zapier will receive this JSON and can map each field
// to a column in Google Sheets.
async function sendToZapier(taskData) {
  console.log("📤 Sending data to Zapier webhook...");

  const response = await axios.post(ZAPIER_WEBHOOK, taskData);

  console.log("✅ Zapier response status:", response.status);
  return response.data;
}

// --------------------------------------------------
// 7. ROUTES
// --------------------------------------------------

// Health-check endpoint (GET /)
// Useful to quickly verify the server is running.
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Task Agent is running 🚀",
  });
});

// Main endpoint (POST /task)
// Accepts: { "message": "..." }
// Returns: { success, taskData, zapierResponse }
app.post("/task", async (req, res) => {
  try {
    // --- 7a. Validate the request body ---
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: 'Request body must include a "message" string.',
      });
    }

    console.log("\n============================");
    console.log("📥 New task received:", message);
    console.log("============================");

    // --- 7b. Extract structured data via Claude ---
    const taskData = await extractTaskWithClaude(message);
    console.log("✅ Extracted task data:", taskData);

    // --- 7c. Forward to Zapier webhook ---
    let zapierResponse = null;

    if (ZAPIER_WEBHOOK) {
      zapierResponse = await sendToZapier(taskData);
    } else {
      console.log("⏭️  Skipping Zapier (no webhook URL configured)");
    }

    // --- 7d. Send success response back to the client ---
    return res.status(200).json({
      success: true,
      taskData,
      zapierResponse,
    });
  } catch (error) {
    // --------------------------------------------------
    // Error handling — log the full error for debugging
    // and send a clean message back to the client
    // --------------------------------------------------
    console.error("❌ Error processing task:", error.message);

    // If Claude or Zapier returned an HTTP error, include details
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", JSON.stringify(error.response.data));
    }

    return res.status(500).json({
      success: false,
      error: "Failed to process the task. Check server logs for details.",
    });
  }
});

// --------------------------------------------------
// 8. START THE SERVER
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 AI Task Agent server is running on http://localhost:${PORT}`);
  console.log(`   POST /task  — send a natural-language task message`);
  console.log(`   GET  /      — health check\n`);
});
