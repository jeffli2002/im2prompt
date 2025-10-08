import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Try Cloudinary upload
    const CLOUDINARY_URL = process.env.CLOUDINARY_URL
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET
    
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      try {
        const cloudinaryFormData = new FormData()
        cloudinaryFormData.append('file', `data:${file.type};base64,${base64}`)
        cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
        // Set folder for organization (helps with URL cleanliness)
        cloudinaryFormData.append('folder', 'sora-inputs')
        // Ensure public access (critical for Sora API to fetch the image)
        cloudinaryFormData.append('resource_type', 'image')
        cloudinaryFormData.append('type', 'upload')
        // Set access mode to public
        cloudinaryFormData.append('access_mode', 'public')
        
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: cloudinaryFormData
          }
        )
        
        const cloudinaryData = await cloudinaryResponse.json()
        
        if (cloudinaryData.secure_url) {
          const imageUrl = cloudinaryData.secure_url.trim()
          console.log('[Upload Image] Successfully uploaded to Cloudinary:', imageUrl)
          console.log('[Upload Image] Cloudinary full response:', JSON.stringify({
            secure_url: cloudinaryData.secure_url,
            url: cloudinaryData.url,
            format: cloudinaryData.format,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            bytes: cloudinaryData.bytes,
            resource_type: cloudinaryData.resource_type
          }, null, 2))
          
          console.log('[Upload Image] Waiting 3 seconds for CDN propagation...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          let validated = false
          for (let attempt = 1; attempt <= 5; attempt++) {
            try {
              const validationResponse = await fetch(imageUrl, { 
                method: 'GET',
                headers: { 'Range': 'bytes=0-1023' },
                signal: AbortSignal.timeout(15000)
              })
              
              if (validationResponse.ok || validationResponse.status === 206) {
                console.log(`[Upload Image] Cloudinary URL validation passed (attempt ${attempt})`)
                validated = true
                break
              } else {
                console.warn(`[Upload Image] Cloudinary URL validation failed attempt ${attempt}:`, validationResponse.status)
              }
            } catch (validationError) {
              console.warn(`[Upload Image] Cloudinary URL validation error attempt ${attempt}:`, validationError)
            }
            
            if (attempt < 5) {
              await new Promise(resolve => setTimeout(resolve, attempt * 1000))
            }
          }
          
          if (validated) {
            return NextResponse.json({ 
              imageUrl,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            })
          } else {
            console.error('[Upload Image] Cloudinary URL never became accessible after 5 attempts')
            return NextResponse.json(
              { error: 'Image uploaded but not yet accessible. Please try again in a few seconds.' },
              { status: 503 }
            )
          }
        }
        
        console.error('[Upload Image] Cloudinary upload failed:', cloudinaryData)
      } catch (cloudinaryError) {
        console.error('[Upload Image] Cloudinary error:', cloudinaryError)
      }
    }
    
    // Fallback: return data URL (not ideal but works for testing)
    const dataUrl = `data:${file.type};base64,${base64}`
    
    console.warn('[Upload Image] Cloudinary not configured or failed, using data URL fallback')
    return NextResponse.json({ 
      imageUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      warning: 'Using data URL fallback - Cloudinary not configured'
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
