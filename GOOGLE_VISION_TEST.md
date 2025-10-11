# Google Vision API - Sora 2 Image Validation Test

## ✅ Setup Verified

1. **Credentials**: `/config/google-vision-key.json` ✅
2. **Package**: `@google-cloud/vision@5.3.3` ✅  
3. **Function**: `checkForPeopleAndFaces()` ✅
4. **Integration**: API route + UI warnings ✅

## 🧪 Manual Testing Steps

### Test the Full Integration:

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

2. **Navigate to**: `http://localhost:3000/text-to-video`

3. **Switch to "Image to Video" tab**

4. **Verify Warning Notice (BEFORE upload)**:
   - You should see an amber alert box
   - Message: "Sora 2 has strict requirements..."
   - States: "Images containing people or faces are not supported"

5. **Test with CLEAN image** (no people):
   - Upload a landscape photo
   - Should proceed to generation

6. **Test with PERSON image**:
   - Upload a photo with a person/face
   - Should show error: "Detected X face(s)..."
   - Alert: "❌ [error message] 💡 Please upload without people"

## 📊 What Gets Checked:

- ✅ Faces (Face Detection API)
- ✅ People objects (Object Localization)  
- ✅ Person-related labels (person, people, human, man, woman, child)

## 🔄 Flow:

```
Upload Image
    ↓
[UI Warning Shown]
    ↓
Google Vision Analysis
    ↓
Has People/Faces?
    ├─ YES → 🚫 Blocked (400 error with reason)
    └─ NO  → ✅ Proceeds to Sora 2
```

## 📝 Expected Behaviors:

### ✅ PASS (No People):
- Landscapes
- Objects
- Animals
- Buildings
- Abstract art

### 🚫 FAIL (Blocked):
- Portrait photos
- Group photos
- Photos with faces
- Photos with people (even without visible faces)

## 🐛 Troubleshooting:

If errors occur:
1. Check credentials: `ls -la config/google-vision-key.json`
2. Check API enabled: Google Cloud Console → Vision API
3. Check service account role: "Cloud Vision AI Service Agent"
4. View logs in terminal while testing

## 🎯 Test Result Expectations:

**Test 1 - Landscape Photo**:
- Expected: ✅ Upload succeeds, video generation starts

**Test 2 - Person Photo**:
- Expected: 🚫 Blocked with message like:
  "Detected 1 face(s) in image. Sora 2 does not support images with people or faces."

