const testTextToImage = async (model, prompt) => {
  console.log(`\n🧪 Testing ${model}...`);
  console.log(`📝 Prompt: "${prompt}"`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3002/api/v1/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-mode': 'true',
      },
      body: JSON.stringify({
        prompt,
        model,
        width: 1024,
        height: 1024,
        aspect_ratio: '1:1',
        output_format: 'jpeg'
      }),
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ ${model} FAILED:`, error.error || 'Unknown error');
      console.error(`   Status: ${response.status}`);
      console.error(`   Duration: ${duration}s`);
      return { success: false, model, error: error.error, duration };
    }

    const data = await response.json();
    console.log(`✅ ${model} SUCCESS`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Image URL length: ${data.imageUrl?.length || 0} characters`);
    
    return { success: true, model, duration, imageUrl: data.imageUrl };
  } catch (error) {
    console.error(`❌ ${model} ERROR:`, error.message);
    return { success: false, model, error: error.message };
  }
};

const runTests = async () => {
  console.log('🚀 Starting Text-to-Image Generation Tests\n');
  console.log('=' .repeat(60));
  
  const testPrompt = 'A serene mountain landscape at sunset with a crystal clear lake';
  
  const models = [
    'nano-banana',
    'flux-1.1',
    'flux-1.1-pro',
    'flux-1.1-ultra',
    'flux-kontext-pro',
    'flux-kontext-max',
    'stable-diffusion'
  ];

  const results = [];

  for (const model of models) {
    const result = await testTextToImage(model, testPrompt);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Passed: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successful Models:');
    successful.forEach(r => {
      console.log(`   - ${r.model}: ${r.duration}s`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Models:');
    failed.forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
};

runTests().catch(console.error);
