#!/bin/bash
# Test script for MCP/Google ADK API endpoints
# Usage: bash test_ai.sh

API_URL="http://localhost:8000"
APP_NAME="sanskara"
USER_ID="test-user-$(date +%s)"

# 1. List all apps
echo "\n--- List Apps ---"
curl -s "$API_URL/list-apps" | jq

# 2. Create a session (POST /apps/{app_name}/users/{user_id}/sessions)
echo "\n--- Create Session ---"
SESSION_ID=$(curl -s -X POST "$API_URL/apps/$APP_NAME/users/$USER_ID/sessions" -H "Content-Type: application/json" -d '{}' | jq -r '.id // .session_id // .sessionId')
echo "Session ID: $SESSION_ID"

# 3. List sessions for user (GET /apps/{app_name}/users/{user_id}/sessions)
echo "\n--- List Sessions ---"
curl -s "$API_URL/apps/$APP_NAME/users/$USER_ID/sessions" | jq

# 4. Send a message (POST /run)
echo "\n--- Run Agent (Send Message) ---"
read -r -d '' MSG_JSON <<EOF
{
  "appName": "$APP_NAME",
  "userId": "$USER_ID",
  "sessionId": "$SESSION_ID",
  "newMessage": {
    "role": "user",
    "parts": [ { "text": "kpuneeth714@gmail.com" } ]
  },
  "streaming": false
}
EOF
curl -s -X POST "$API_URL/run" -H "Content-Type: application/json" -d "$MSG_JSON" | jq


# send email as response
echo "\n--- Send Email Response ---"
read -r -d '' MSG_JSON <<EOF
{
  "appName": "$APP_NAME",
  "userId": "$USER_ID",
  "sessionId": "$SESSION_ID",
  "newMessage": {
    "role": "user",
    "parts": [ { "text": "kpuneeth714@gmail.com is my mail" } ]
  },
  "streaming": false
}
EOF
curl -s -X POST "$API_URL/run" -H "Content-Type: application/json" -d "$MSG_JSON" | jq

# 5. Get session details (GET /apps/{app_name}/users/{user_id}/sessions/{session_id})
echo "\n--- Get Session Details ---"
curl -s "$API_URL/apps/$APP_NAME/users/$USER_ID/sessions/$SESSION_ID" | jq

# 6. List artifacts (GET /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts)
echo "\n--- List Artifacts ---"
curl -s "$API_URL/apps/$APP_NAME/users/$USER_ID/sessions/$SESSION_ID/artifacts" | jq

# 7. Clean up: Delete session (DELETE /apps/{app_name}/users/{user_id}/sessions/{session_id})
echo "\n--- Delete Session ---"
curl -s -X DELETE "$API_URL/apps/$APP_NAME/users/$USER_ID/sessions/$SESSION_ID" | jq

# 8. Test /run_sse (streaming response)
echo "\n--- Run Agent (Streaming, /run_sse) ---"
read -r -d '' MSG_JSON <<EOF
{
  "appName": "$APP_NAME",
  "userId": "$USER_ID",
  "sessionId": "$SESSION_ID",
  "newMessage": {
    "role": "user",
    "parts": [ { "text": "Test streaming response from AI." } ]
  },
  "streaming": true
}
EOF
curl -s -X POST "$API_URL/run_sse" -H "Content-Type: application/json" -d "$MSG_JSON" | jq

echo "Test complete."
