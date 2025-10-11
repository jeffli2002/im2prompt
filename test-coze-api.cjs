const fs = require('fs');
const path = require('path');

const COZE_FILE_UPLOAD_URL = 'https://api.coze.cn/v1/files/upload';
const COZE_WORKFLOW_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || '7550263539588399142';
const COZE_API_KEY = process.env.COZE_API_KEY;

async function testCozeAPI() {
  console.log('=== Testing Coze API Integration ===\n');

  if (!COZE_API_KEY) {
    console.error('❌ COZE_API_KEY is not set');
    process.exit(1);
  }

  console.log('✓ COZE_API_KEY is configured');
  console.log(`✓ COZE_WORKFLOW_ID: ${COZE_WORKFLOW_ID}\n`);

  const testImagePath = process.argv[2];
  if (!testImagePath) {
    console.error('❌ Please provide a test image path as argument');
    console.log('Usage: node test-coze-api.cjs <path-to-image>');
    process.exit(1);
  }

  if (!fs.existsSync(testImagePath)) {
    console.error(`❌ Test image not found: ${testImagePath}`);
    process.exit(1);
  }

  console.log(`Test image: ${testImagePath}\n`);

  try {
    console.log('Step 1: Uploading file to Coze...');
    const FormData = require('form-data');
    const uploadFormData = new FormData();
    uploadFormData.append('file', fs.createReadStream(testImagePath));

    const uploadResponse = await fetch(COZE_FILE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        ...uploadFormData.getHeaders(),
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ File upload failed:', uploadResponse.status, errorText);
      process.exit(1);
    }

    const uploadData = await uploadResponse.json();
    console.log('✓ File uploaded successfully');
    console.log('Upload response:', JSON.stringify(uploadData, null, 2));

    const cozeFileData = uploadData.data || uploadData;
    const cozeFileId = cozeFileData.id || cozeFileData.file_id;

    if (!cozeFileId) {
      console.error('❌ No file_id in upload response');
      process.exit(1);
    }

    console.log(`✓ File ID: ${cozeFileId}\n`);

    console.log('Step 2: Calling Coze Workflow API...');
    const workflowParams = {
      promptStyle: 'normal',
      language: 'english',
      Img: JSON.stringify({
        ...cozeFileData,
        file_id: cozeFileId
      })
    };

    const cozePayload = {
      workflow_id: COZE_WORKFLOW_ID,
      parameters: workflowParams,
      bot_id: COZE_WORKFLOW_ID
    };

    console.log('Workflow payload:', JSON.stringify(cozePayload, null, 2));

    const workflowResponse = await fetch(COZE_WORKFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cozePayload),
    });

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text();
      console.error('❌ Workflow execution failed:', workflowResponse.status, errorText);
      process.exit(1);
    }

    const workflowData = await workflowResponse.json();
    console.log('✓ Workflow executed successfully');
    console.log('Workflow response:', JSON.stringify(workflowData, null, 2));

    console.log('\nStep 3: Extracting prompt from response...');
    let extractedPrompt = '';
    
    if (workflowData.data) {
      const output = workflowData.data.output || workflowData.data;
      
      if (typeof output === 'string') {
        extractedPrompt = output;
      } else if (output.prompt) {
        extractedPrompt = output.prompt;
      } else if (output.result) {
        extractedPrompt = output.result;
      }
    }

    if (extractedPrompt) {
      console.log('✓ Prompt extracted successfully:');
      console.log('---');
      console.log(extractedPrompt);
      console.log('---');
    } else {
      console.log('⚠️  No prompt found in response');
    }

    console.log('\n=== Test Complete ===');
    console.log('✓ All API calls successful');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCozeAPI();
