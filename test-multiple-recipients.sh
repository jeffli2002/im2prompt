#!/bin/bash

API_KEY="re_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu"
FROM_EMAIL="im2prompt <onboarding@resend.dev>"

echo "Testing multiple recipients..."

curl -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $API_KEY" \
  -H 'Content-Type: application/json' \
  -d @- <<'EOF'
{
  "from": "im2prompt <onboarding@resend.dev>",
  "to": ["994235892@qq.com", "jefflee2002@gmail.com"],
  "subject": "Testing Multiple Recipients",
  "html": "<p>This should go to both emails</p>"
}
EOF
