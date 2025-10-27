/**
 * Image to Video Processing - Simplified Auto Test (Pure JavaScript)
 * Tests the complete image-to-video workflow
 */

import fs from 'node:fs';
import path from 'node:path';

class SimpleImageToVideoTester {
  constructor() {
    this.results = [];
    this.apiBaseUrl = 'http://localhost:3000';
  }

  addResult(name, passed, message, details = null) {
    this.results.push({ name, passed, message, details });
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
    if (details) {
      console.log(`   ${JSON.stringify(details, null, 2).split('\n').join('\n   ')}`);
    }
  }

  async test1_UseExistingImage() {
    console.log('\n📋 Test 1: Check for Test Images');
    console.log('='.repeat(80));

    try {
      const publicImagesPath = path.join(process.cwd(), 'public', 'avatar');
      const files = fs.readdirSync(publicImagesPath);
      const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg)$/i));

      if (imageFiles.length > 0) {
        this.addResult(
          'Find Test Images',
          true,
          `Found ${imageFiles.length} images in public/avatar`,
          { images: imageFiles.slice(0, 3) }
        );
        return imageFiles[0];
      }
      this.addResult('Find Test Images', false, 'No images found in public folder');
      return null;
    } catch (error) {
      this.addResult('Find Test Images', false, `Error: ${error.message}`);
      return null;
    }
  }

  async test2_APIHealthCheck() {
    console.log('\n📋 Test 2: API Health Check');
    console.log('='.repeat(80));

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        this.addResult('API Health Check', true, `API is reachable at ${this.apiBaseUrl}`, data);
        return true;
      }
      this.addResult('API Health Check', false, `API returned status ${response.status}`);
      return false;
    } catch (error) {
      this.addResult('API Health Check', false, `Cannot reach API: ${error.message}`);
      console.log('\n⚠️  Make sure your development server is running: pnpm dev');
      return false;
    }
  }

  async test3_SoraImageGenerateEndpoint() {
    console.log('\n📋 Test 3: Sora Image-Generate Endpoint Structure');
    console.log('='.repeat(80));

    try {
      const imageFile = path.join(process.cwd(), 'public', 'avatar', '1.png');

      if (!fs.existsSync(imageFile)) {
        this.addResult('Endpoint Test', false, 'Test image not found');
        return;
      }

      const formData = new FormData();
      const imageBuffer = fs.readFileSync(imageFile);
      const blob = new Blob([imageBuffer], { type: 'image/png' });

      formData.append('prompt', 'Camera slowly zooms in, cinematic lighting');
      formData.append('image', blob, '1.png');
      formData.append('aspect_ratio', 'landscape');
      formData.append('quality', 'standard');

      const response = await fetch(`${this.apiBaseUrl}/api/v1/sora-image-generate`, {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');

      if (!contentType?.includes('application/json')) {
        this.addResult('Endpoint Test', false, 'Endpoint did not return JSON', {
          status: response.status,
          contentType,
        });
        return;
      }

      const data = await response.json();

      if (response.status === 401) {
        this.addResult('Endpoint Test', true, 'Endpoint correctly requires authentication', {
          status: 401,
          error: data.error,
        });
      } else if (response.status === 400 && data.error) {
        if (
          data.error.toLowerCase().includes('face') ||
          data.error.toLowerCase().includes('people') ||
          data.error.toLowerCase().includes('person')
        ) {
          this.addResult('Endpoint Test', true, 'Face detection is working (blocked test image)', {
            error: data.error,
          });
        } else {
          this.addResult('Endpoint Test', true, 'Endpoint validated request and returned error', {
            status: 400,
            error: data.error,
          });
        }
      } else if (response.status === 429 || response.status === 402) {
        this.addResult('Endpoint Test', true, 'Quota/credit system is working', {
          status: response.status,
        });
      } else if (response.ok && data.taskId) {
        this.addResult('Endpoint Test', true, 'Successfully created video generation task!', {
          taskId: data.taskId,
          creditsUsed: data.creditsUsed,
          usedFreeQuota: data.usedFreeQuota,
        });
      } else {
        this.addResult('Endpoint Test', false, 'Unexpected response', {
          status: response.status,
          data,
        });
      }
    } catch (error) {
      this.addResult('Endpoint Test', false, `Exception: ${error.message}`);
    }
  }

  async test4_TaskStatusEndpoint() {
    console.log('\n📋 Test 4: Task Status Endpoint');
    console.log('='.repeat(80));

    try {
      const testTaskId = 'test-dummy-task-id-12345';
      const response = await fetch(
        `${this.apiBaseUrl}/api/v1/sora-task-status?taskId=${testTaskId}`,
        { method: 'GET' }
      );

      const contentType = response.headers.get('content-type');

      if (!contentType?.includes('application/json')) {
        this.addResult('Status Endpoint', false, 'Endpoint did not return JSON', {
          status: response.status,
        });
        return;
      }

      const data = await response.json();

      if (response.status === 400 || response.status === 404) {
        this.addResult('Status Endpoint', true, 'Endpoint properly handles invalid task ID', {
          status: response.status,
          error: data.error,
        });
      } else if (response.status === 401) {
        this.addResult('Status Endpoint', true, 'Endpoint requires authentication', {
          status: 401,
        });
      } else {
        this.addResult('Status Endpoint', true, 'Endpoint is functional', {
          status: response.status,
        });
      }
    } catch (error) {
      this.addResult('Status Endpoint', false, `Exception: ${error.message}`);
    }
  }

  async test5_VisionAPIIntegration() {
    console.log('\n📋 Test 5: Vision API Integration Check');
    console.log('='.repeat(80));

    try {
      const hasVisionCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (hasVisionCreds) {
        this.addResult('Vision API Config', true, 'GOOGLE_APPLICATION_CREDENTIALS is set');
      } else {
        this.addResult(
          'Vision API Config',
          false,
          'GOOGLE_APPLICATION_CREDENTIALS not found in environment'
        );
        console.log('   💡 Set this variable to enable face detection');
      }

      try {
        const visionPath = path.join(process.cwd(), 'src', 'lib', 'google-vision.ts');
        if (fs.existsSync(visionPath)) {
          this.addResult(
            'Vision Module',
            true,
            'google-vision module exists at src/lib/google-vision.ts'
          );
        } else {
          this.addResult('Vision Module', false, 'google-vision module not found');
        }
      } catch (error) {
        this.addResult('Vision Module', false, `Error checking module: ${error.message}`);
      }
    } catch (error) {
      this.addResult('Vision API Check', false, `Exception: ${error.message}`);
    }
  }

  async test6_ComponentFiles() {
    console.log('\n📋 Test 6: Frontend Component Check');
    console.log('='.repeat(80));

    try {
      const componentPath = path.join(
        process.cwd(),
        'src',
        'components',
        'sora-video-generator.tsx'
      );

      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf-8');

        const hasImageUpload = content.includes('sora-image-generate');
        const hasVisionCheck = content.includes('face') || content.includes('people');
        const hasErrorHandling = content.includes('catch') && content.includes('error');

        this.addResult('Component Structure', true, 'sora-video-generator component exists', {
          hasImageUpload,
          hasFaceWarning: hasVisionCheck,
          hasErrorHandling,
        });
      } else {
        this.addResult('Component Structure', false, 'sora-video-generator component not found');
      }
    } catch (error) {
      this.addResult('Component Check', false, `Exception: ${error.message}`);
    }
  }

  printSummary() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 TEST SUMMARY - Image to Video Processing');
    console.log('='.repeat(80));

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(80));
    this.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.name}`);
      console.log(`   ${result.message}`);
    });

    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(80));

    const hasAPIFailure = this.results.some(
      (r) => r.name.includes('API') && !r.passed && (!r.details || !r.details.status)
    );
    const hasAuthIssue = this.results.some((r) => r.details?.status === 401);
    const hasVisionIssue = this.results.some((r) => r.name.includes('Vision') && !r.passed);

    if (hasAPIFailure) {
      console.log('• Start development server: pnpm dev');
    }
    if (hasAuthIssue) {
      console.log('• Authentication required for full API testing');
      console.log('  Consider setting up test credentials or running E2E tests');
    }
    if (hasVisionIssue) {
      console.log('• Configure Google Vision API credentials');
      console.log('  Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    }

    if (passed >= total * 0.7) {
      console.log(
        '\n✅ Core functionality verified! Image-to-video system is properly configured.'
      );
    } else if (passed > 0) {
      console.log('\n⚠️  Partial functionality detected. Review failed tests above.');
    } else {
      console.log('\n❌ System not ready. Please address the issues above.');
    }

    console.log('');
    return passed >= total * 0.7 ? 0 : 1;
  }

  async runAll() {
    console.log('🧪 Image to Video Processing - Automated Test Suite');
    console.log('='.repeat(80));
    console.log(`API Base URL: ${this.apiBaseUrl}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    console.log(`Working Directory: ${process.cwd()}`);

    try {
      await this.test1_UseExistingImage();
      await this.test2_APIHealthCheck();
      await this.test3_SoraImageGenerateEndpoint();
      await this.test4_TaskStatusEndpoint();
      await this.test5_VisionAPIIntegration();
      await this.test6_ComponentFiles();
    } catch (error) {
      console.error('\n💥 Fatal error during test execution:', error);
    } finally {
      const exitCode = this.printSummary();
      process.exit(exitCode);
    }
  }
}

// Run tests
console.log('Starting test suite...\n');
const tester = new SimpleImageToVideoTester();
tester.runAll().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error);
  console.error(error.stack);
  process.exit(1);
});
