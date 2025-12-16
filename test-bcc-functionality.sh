#!/bin/bash

API_KEY="re_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu"
OWNER_EMAIL="994235892@qq.com"
BCC_EMAIL="jefflee2002@gmail.com"
FROM_EMAIL="im2prompt <onboarding@resend.dev>"

echo "🧪 Testing BCC Functionality for Specific Categories"
echo "======================================================"
echo ""
echo "📋 Categories that should BCC jefflee2002@gmail.com:"
echo "   - feedback"
echo "   - subscription"
echo "   - bug"
echo "   - credits-exhausted"
echo ""

sent=0
failed=0

send_test_email() {
  local name="$1"
  local subject="$2"
  local category="$3"
  local html_content="$4"
  
  echo "📤 Sending: $name (category: $category)..."
  
  response=$(curl -s -X POST 'https://api.resend.com/emails' \
    -H "Authorization: Bearer $API_KEY" \
    -H 'Content-Type: application/json' \
    -d @- <<EOF
{
  "from": "$FROM_EMAIL",
  "to": ["$OWNER_EMAIL"],
  "bcc": ["$BCC_EMAIL"],
  "subject": "$subject",
  "html": "$html_content"
}
EOF
)
  
  if echo "$response" | grep -q '"id"'; then
    email_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ SUCCESS: $email_id"
    ((sent++))
  else
    echo "   ❌ FAILED: $response"
    ((failed++))
  fi
  
  sleep 1
}

echo "🚀 Sending emails..."
echo ""

# These should all be BCC'd
send_test_email "Feedback Email" \
  "[FEATURE] Request for batch processing" \
  "feedback" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Feedback</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>📝 New Feedback Received</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>From:</strong> Jeff Lee (jefflee2002@gmail.com)</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Category:</strong> Feature Request</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Priority:</strong> Normal</p></div><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #374151;'>It would be great to have a batch processing feature for multiple images at once. This would save a lot of time when working with large projects.</p></div></div></body></html>"

send_test_email "Subscription Email" \
  "Welcome to im2prompt Pro! Your Subscription is Active" \
  "subscription" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Subscription Confirmed</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>✅ Subscription Activated!</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff,</p><p style='font-size: 16px; color: #374151;'>Your <strong>Pro Plan</strong> subscription has been activated!</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Plan:</strong> Pro (Monthly)</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Price:</strong> \$14.90/month</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Credits:</strong> 500/month</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/dashboard' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>View Dashboard</a></div></div></body></html>"

send_test_email "Bug Report" \
  "[BUG] Image upload fails on mobile Safari" \
  "bug" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Bug Report</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🐛 Bug Report</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>From:</strong> Jeff Lee (jefflee2002@gmail.com)</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Device:</strong> iPhone 13, Safari 17.2</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Severity:</strong> High</p></div><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #374151;'><strong>Issue:</strong> When attempting to upload images on mobile Safari, the upload fails with no error message. Works fine on Chrome mobile.</p><p style='font-size: 14px; color: #374151; margin-top: 10px;'><strong>Steps to Reproduce:</strong><br>1. Open im2prompt.com on iPhone Safari<br>2. Click upload button<br>3. Select image from camera roll<br>4. Upload fails silently</p></div></div></body></html>"

send_test_email "Credits Exhausted" \
  "Your im2prompt Credits Are Exhausted" \
  "credits-exhausted" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Credits Exhausted</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🚫 Credits Exhausted</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff,</p><p style='font-size: 16px; color: #374151;'>You have used all your credits for this month.</p><p style='font-size: 14px; color: #6b7280;'>Your credits will automatically refill in 10 days. Or you can upgrade your plan to get more credits now.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/pricing' style='display: inline-block; background: #4F46E5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;'>Upgrade Plan</a><a href='https://im2prompt.com/buy-credits' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Buy Credits</a></div></div></body></html>"

echo ""
echo "📊 Other categories (for comparison - these won't have BCC in production):"
echo ""

# These would NOT be BCC'd in the app
send_test_email "Welcome Email" \
  "Welcome to im2prompt! Your 15 Free Credits Are Ready" \
  "welcome" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Welcome</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;'><h1 style='color: white; margin: 0;'>Welcome to im2prompt! 🎉</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff,</p><p style='font-size: 16px; color: #374151;'>Thank you for signing up! Your account has been created successfully.</p><div style='background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;'><p style='margin: 0; font-size: 18px; color: #667eea; font-weight: bold;'>🎁 15 Free Credits</p><p style='margin: 8px 0 0 0; color: #6b7280;'>Start creating amazing prompts right away!</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/dashboard' style='display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Go to Dashboard</a></div></div></body></html>"

send_test_email "Credits Low Warning" \
  "Your im2prompt Credits Are Running Low (10% Remaining)" \
  "credits" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Credits Low</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>⚡ Credits Running Low</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff,</p><p style='font-size: 16px; color: #374151;'>Your credits are running low. You have <strong>50 credits</strong> remaining (10% of your monthly allocation).</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><div style='background: #fee2e2; height: 30px; border-radius: 15px; overflow: hidden;'><div style='background: #ef4444; height: 100%; width: 10%;'></div></div><p style='font-size: 14px; color: #6b7280; margin-top: 10px; text-align: center;'>10% remaining</p></div><p style='font-size: 14px; color: #6b7280;'>Your credits will refill in 15 days.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/pricing' style='display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Upgrade Plan</a></div></div></body></html>"

echo ""
echo "======================================================"
echo ""
echo "📊 Results: $sent sent, $failed failed"
echo ""
echo "✅ Check both inboxes:"
echo "   - Primary: $OWNER_EMAIL"
echo "   - BCC: $BCC_EMAIL"
echo ""
echo "📝 Expected BCC emails: 4 (feedback, subscription, bug, credits-exhausted)"
echo "📝 Non-BCC emails: 2 (welcome, credits)"
echo ""
