#!/bin/bash

curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu' \
  -H 'Content-Type: application/json' \
  -d @- <<'EOF'
{
  "from": "im2prompt <onboarding@resend.dev>",
  "to": ["994235892@qq.com"],
  "bcc": ["jefflee2002@gmail.com"],
  "subject": "[TEST] im2prompt Email Template Test",
  "html": "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Test Email</title></head><body style='font-family: Arial, sans-serif; padding: 20px;'><h1 style='color: #4F46E5;'>Welcome to im2prompt!</h1><p>This is a test of the email templates.</p><p>You have received 15 credits to get started.</p></body></html>"
}
EOF
