#!/bin/bash

API_KEY="re_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu"
OWNER_EMAIL="994235892@qq.com"
TEST_EMAIL="jefflee2002@gmail.com"
FROM_EMAIL="im2prompt <onboarding@resend.dev>"

echo "📧 Email Template Test Suite"
echo "===================================="
echo ""
echo "📬 Sending to: $OWNER_EMAIL"
echo "📋 BCC: $TEST_EMAIL"
echo "📨 From: $FROM_EMAIL"
echo ""

sent=0
failed=0

send_email() {
  local name="$1"
  local subject="$2"
  local html="$3"
  
  echo "📤 Sending: $name..."
  
  response=$(curl -s -X POST 'https://api.resend.com/emails' \
    -H "Authorization: Bearer $API_KEY" \
    -H 'Content-Type: application/json' \
    -d @- <<EOF
{
  "from": "$FROM_EMAIL",
  "to": ["$OWNER_EMAIL"],
  "bcc": ["$TEST_EMAIL"],
  "subject": "$subject",
  "html": "$html"
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

echo "🚀 Starting email tests..."
echo ""

send_email "Welcome Email" \
  "[TEST] Welcome to im2prompt!" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Welcome</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;'><h1 style='color: white; margin: 0;'>Welcome to im2prompt! 🎉</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Thank you for signing up! Your account has been created successfully.</p><div style='background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;'><p style='margin: 0; font-size: 18px; color: #667eea; font-weight: bold;'>🎁 15 Free Credits</p><p style='margin: 8px 0 0 0; color: #6b7280;'>Start creating amazing prompts right away!</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/dashboard' style='display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Go to Dashboard</a></div><p style='font-size: 14px; color: #6b7280;'>Best regards,<br>The im2prompt Team</p></div></body></html>"

send_email "Email Verification" \
  "[TEST] Verify Your Email Address" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Email Verification</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>📧 Verify Your Email</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Please verify your email address by entering this code:</p><div style='background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #4F46E5;'><p style='font-size: 32px; font-weight: bold; color: #4F46E5; margin: 0; letter-spacing: 8px;'>123456</p></div><p style='font-size: 14px; color: #6b7280;'>This code expires in 60 minutes.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/verify?token=test123' style='display: inline-block; background: #4F46E5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Verify Email</a></div></div></body></html>"

send_email "Password Reset" \
  "[TEST] Reset Your Password" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Password Reset</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🔒 Password Reset Request</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>We received a request to reset your password. Click the button below to create a new password:</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/reset-password?token=test123' style='display: inline-block; background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Reset Password</a></div><p style='font-size: 14px; color: #6b7280;'>This link expires in 60 minutes.</p><p style='font-size: 14px; color: #dc2626;'>⚠️ If you did not request this, please ignore this email.</p></div></body></html>"

send_email "Subscription Confirmation" \
  "[TEST] Pro Subscription Activated" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Subscription Confirmed</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>✅ Subscription Activated!</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Your <strong>Pro Plan</strong> subscription has been activated!</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Plan:</strong> Pro (Monthly)</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Price:</strong> \$14.90/month</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Credits:</strong> 500/month</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Extractions:</strong> 300/month</p></div><ul style='color: #374151; margin: 20px 0;'><li>Commercial license</li><li>No watermark</li><li>Priority support</li></ul><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/dashboard' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>View Dashboard</a></div></div></body></html>"

send_email "Payment Failed" \
  "[TEST] Payment Failed - Action Required" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Payment Failed</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>⚠️ Payment Failed</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>We were unable to process your payment for the <strong>Pro Plan</strong>.</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Amount:</strong> \$14.90</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Reason:</strong> Card declined</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Payment Method:</strong> Visa •••• 4242</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/billing' style='display: inline-block; background: #dc2626; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Update Payment Method</a></div><p style='font-size: 14px; color: #6b7280;'>This is attempt 1 of 3. Please update your payment method to avoid service interruption.</p></div></body></html>"

send_email "Credits Low Warning" \
  "[TEST] Credits Running Low" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Credits Low</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>⚡ Credits Running Low</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Your credits are running low. You have <strong>50 credits</strong> remaining (10% of your monthly allocation).</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><div style='background: #fee2e2; height: 30px; border-radius: 15px; overflow: hidden;'><div style='background: #ef4444; height: 100%; width: 10%;'></div></div><p style='font-size: 14px; color: #6b7280; margin-top: 10px; text-align: center;'>10% remaining</p></div><p style='font-size: 14px; color: #6b7280;'>Your credits will refill in 15 days.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/pricing' style='display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Upgrade Plan</a></div></div></body></html>"

send_email "Credits Exhausted" \
  "[TEST] Credits Exhausted" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Credits Exhausted</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🚫 Credits Exhausted</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>You have used all your credits for this month.</p><p style='font-size: 14px; color: #6b7280;'>Your credits will automatically refill in 10 days. Or you can upgrade your plan to get more credits now.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/pricing' style='display: inline-block; background: #4F46E5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;'>Upgrade Plan</a><a href='https://im2prompt.com/buy-credits' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Buy Credits</a></div></div></body></html>"

send_email "Credits Refilled" \
  "[TEST] Credits Refilled Successfully" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Credits Refilled</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>✅ Credits Refilled!</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Your monthly credits have been refilled!</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'><p style='font-size: 14px; color: #6b7280; margin: 0;'>Credits Added</p><p style='font-size: 36px; font-weight: bold; color: #10b981; margin: 10px 0;'>+500</p><p style='font-size: 14px; color: #6b7280; margin: 0;'>New Balance: 500 credits</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/dashboard' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Start Creating</a></div></div></body></html>"

send_email "Generation Complete (Image)" \
  "[TEST] Your Image is Ready 🎨" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Image Ready</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🎨 Your Image is Ready!</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Your image generation is complete!</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><img src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500' alt='Generated Image' style='width: 100%; border-radius: 8px; margin-bottom: 15px;' /><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Model:</strong> flux-1.1-pro</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Prompt:</strong> A beautiful sunset over mountains with vibrant colors</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Processing Time:</strong> 45 seconds</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Credits Used:</strong> 5</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/generations/test123' style='display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;'>View Image</a><a href='https://im2prompt.com/download/test123' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Download</a></div></div></body></html>"

send_email "Generation Complete (Video)" \
  "[TEST] Your Video is Ready 🎬" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Video Ready</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🎬 Your Video is Ready!</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Your video generation is complete!</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><img src='https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500' alt='Video Thumbnail' style='width: 100%; border-radius: 8px; margin-bottom: 15px;' /><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Model:</strong> sora-1.0</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Prompt:</strong> A cat walking through a garden in slow motion</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Processing Time:</strong> 5 minutes</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Credits Used:</strong> 50</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/generations/test456' style='display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;'>View Video</a><a href='https://im2prompt.com/download/test456' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Download</a></div></div></body></html>"

send_email "Generation Failed" \
  "[TEST] Generation Failed - Credits Refunded" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Generation Failed</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>❌ Generation Failed</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>Unfortunately, your image generation failed.</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Error:</strong> Service temporarily unavailable</p><p style='font-size: 14px; color: #10b981; margin: 8px 0;'><strong>Credits Refunded:</strong> 5</p></div><p style='font-size: 14px; color: #6b7280;'>We apologize for the inconvenience. Your credits have been automatically refunded.</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/retry/test123' style='display: inline-block; background: #4F46E5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;'>Try Again</a><a href='https://im2prompt.com/support' style='display: inline-block; background: #6b7280; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Contact Support</a></div></div></body></html>"

send_email "Feedback Email" \
  "[TEST] [FEATURE] Request for new feature" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Feedback</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #4F46E5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>📝 New Feedback Received</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>From:</strong> Jeff Lee (jefflee2002@gmail.com)</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Category:</strong> Feature Request</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Subject:</strong> Request for new feature</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Priority:</strong> Normal</p></div><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #374151;'>It would be great to have a batch processing feature for multiple images at once.</p></div></div></body></html>"

send_email "Notification Email" \
  "[TEST] New Feature Available" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Notification</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #10b981; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>🎉 New Feature Available</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Hi Jeff Lee,</p><p style='font-size: 16px; color: #374151;'>We have just released a new feature: <strong>Batch Image Processing</strong>. You can now process multiple images at once!</p><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/features/batch-processing' style='display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Try It Now</a></div></div></body></html>"

send_email "Alert Email" \
  "[TEST] [USAGE] High API Usage Detected" \
  "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Alert</title></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'><div style='background: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'><h1 style='color: white; margin: 0;'>⚠️ High API Usage Detected</h1></div><div style='background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;'><p style='font-size: 16px; color: #374151;'>Unusual API usage pattern detected for user test-user-123</p><div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>User ID:</strong> test-user-123</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>API Calls:</strong> 1000</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Time Window:</strong> 5 minutes</p><p style='font-size: 14px; color: #6b7280; margin: 8px 0;'><strong>Threshold:</strong> 500</p><p style='font-size: 14px; color: #f59e0b; margin: 8px 0;'><strong>Severity:</strong> HIGH</p></div><div style='text-align: center; margin: 30px 0;'><a href='https://im2prompt.com/admin/users/test-user-123' style='display: inline-block; background: #f59e0b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;'>View User Details</a></div></div></body></html>"

echo ""
echo "===================================="
echo ""
echo "📊 Results: $sent sent, $failed failed"
echo "✅ Success Rate: $(echo "scale=1; $sent * 100 / ($sent + $failed)" | bc)%"
echo ""

if [ $failed -gt 0 ]; then
  echo "❌ Some emails failed to send!"
  exit 1
else
  echo "🎉 All emails sent successfully!"
  echo ""
  echo "📬 Check $OWNER_EMAIL and $TEST_EMAIL for the test emails."
  echo ""
  echo "💡 Total emails sent: $sent"
  exit 0
fi
