// @ts-nocheck - Test script with Node.js imports
import fs from 'node:fs';
import path from 'node:path';
import { checkForPeopleAndFaces } from './src/lib/google-vision';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

class ImageToVideoTester {
  private results: TestResult[] = [];
  private apiBaseUrl = 'http://localhost:3000';
  private authToken: string | null = null;
  private testImagePath = '';
  private testImageWithFacePath = '';

  constructor() {
    // Check if running in production
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_URL) {
      this.apiBaseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://im2prompt.com';
    }
  }

  private addResult(name: string, passed: boolean, message: string, details?: any) {
    this.results.push({ name, passed, message, details });
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
    if (details) {
      console.log('   Details:', JSON.stringify(details, null, 2));
    }
  }

  private async createTestImage(withFace = false): Promise<string> {
    console.log(`\n📸 Creating test image ${withFace ? '(with face)' : '(landscape)'}`);
    console.log('-'.repeat(80));

    try {
      const { createCanvas } = await import('canvas');
      const canvas = createCanvas(400, 300);
      const ctx = canvas.getContext('2d');

      if (withFace) {
        // Create a simple representation with face-like features
        // This will be used to test rejection
        ctx.fillStyle = '#87CEEB'; // Sky blue background
        ctx.fillRect(0, 0, 400, 300);

        // Draw a simple face
        ctx.fillStyle = '#FFD700'; // Gold for face
        ctx.beginPath();
        ctx.arc(200, 150, 80, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(180, 140, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(220, 140, 10, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.beginPath();
        ctx.arc(200, 150, 40, 0, Math.PI, false);
        ctx.stroke();
      } else {
        // Create a landscape image without people
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 150);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 400, 150);

        // Mountains
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(100, 80);
        ctx.lineTo(200, 120);
        ctx.lineTo(300, 60);
        ctx.lineTo(400, 150);
        ctx.closePath();
        ctx.fill();

        // Ground
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, 150, 400, 150);

        // Tree
        ctx.fillStyle = '#654321';
        ctx.fillRect(320, 120, 20, 60);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(330, 110, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      const buffer = canvas.toBuffer('image/png');
      const filename = withFace ? 'test-image-with-face.png' : 'test-image-landscape.png';
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, buffer);

      console.log(`✅ Test image created: ${filepath}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);

      return filepath;
    } catch (error) {
      console.log('❌ Failed to create test image:', error);
      console.log('   Note: Install canvas package: pnpm add canvas');
      throw error;
    }
  }

  async test1_CreateTestImages() {
    console.log('\n📋 Test 1: Create Test Images');
    console.log('='.repeat(80));

    try {
      this.testImagePath = await this.createTestImage(false);
      this.testImageWithFacePath = await this.createTestImage(true);
      this.addResult('Create Test Images', true, 'Successfully created test images');
    } catch (error) {
      this.addResult(
        'Create Test Images',
        false,
        `Failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async test2_VisionAPICheck() {
    console.log('\n📋 Test 2: Google Vision API - Face Detection');
    console.log('='.repeat(80));

    try {
      // Test landscape image (should pass)
      const landscapeBuffer = fs.readFileSync(this.testImagePath);
      const landscapeResult = await checkForPeopleAndFaces(landscapeBuffer);

      if (!landscapeResult.success) {
        this.addResult(
          'Vision API - Landscape',
          false,
          `API call failed: ${landscapeResult.error}`
        );
        return;
      }

      if (landscapeResult.blocked) {
        this.addResult(
          'Vision API - Landscape',
          false,
          'Landscape image was incorrectly blocked',
          landscapeResult
        );
      } else {
        this.addResult(
          'Vision API - Landscape',
          true,
          'Correctly identified landscape without people',
          {
            faces: landscapeResult.faceCount,
            people: landscapeResult.peopleCount,
          }
        );
      }

      // Test image with face (should be blocked)
      const faceBuffer = fs.readFileSync(this.testImageWithFacePath);
      const faceResult = await checkForPeopleAndFaces(faceBuffer);

      if (!faceResult.success) {
        this.addResult(
          'Vision API - Face Detection',
          false,
          `API call failed: ${faceResult.error}`
        );
        return;
      }

      if (faceResult.blocked) {
        this.addResult('Vision API - Face Detection', true, 'Correctly blocked image with face', {
          faces: faceResult.faceCount,
          people: faceResult.peopleCount,
          reason: faceResult.reason,
        });
      } else {
        this.addResult(
          'Vision API - Face Detection',
          false,
          'Failed to detect face in test image',
          faceResult
        );
      }
    } catch (error) {
      this.addResult(
        'Vision API Check',
        false,
        `Exception: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async test3_APIEndpointReachable() {
    console.log('\n📋 Test 3: API Endpoint Reachability');
    console.log('='.repeat(80));

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health`, {
        method: 'GET',
      });

      if (response.ok) {
        this.addResult('API Health Check', true, `API is reachable at ${this.apiBaseUrl}`);
      } else {
        this.addResult('API Health Check', false, `API returned status ${response.status}`);
      }
    } catch (error) {
      this.addResult(
        'API Health Check',
        false,
        `Cannot reach API: ${error instanceof Error ? error.message : error}`
      );
      console.log('\n⚠️  Note: Make sure your development server is running!');
      console.log('   Run: pnpm dev');
    }
  }

  async test4_ImageToVideoAPI_Landscape() {
    console.log('\n📋 Test 4: Image-to-Video API - Landscape (Should Succeed)');
    console.log('='.repeat(80));

    try {
      const formData = new FormData();
      const imageBuffer = fs.readFileSync(this.testImagePath);
      const blob = new Blob([imageBuffer], { type: 'image/png' });

      formData.append(
        'prompt',
        'Camera slowly zooms in, cinematic lighting, smooth motion, beautiful landscape'
      );
      formData.append('image', blob, 'test-landscape.png');
      formData.append('aspect_ratio', 'landscape');
      formData.append('quality', 'standard');

      const response = await fetch(`${this.apiBaseUrl}/api/v1/sora-image-generate`, {
        method: 'POST',
        body: formData,
        headers: this.authToken
          ? {
              Cookie: `auth_token=${this.authToken}`,
            }
          : {},
      });

      const data = await response.json();

      if (response.status === 401) {
        this.addResult(
          'Image-to-Video API (Landscape)',
          false,
          'Authentication required - skipping API test',
          { status: 401 }
        );
        console.log('   💡 To test with authentication, set up test user credentials');
        return;
      }

      if (response.ok && data.taskId) {
        this.addResult(
          'Image-to-Video API (Landscape)',
          true,
          'Successfully created video generation task',
          {
            taskId: data.taskId,
            creditsUsed: data.creditsUsed || 0,
            usedFreeQuota: data.usedFreeQuota,
          }
        );
      } else if (response.status === 429 || response.status === 402) {
        this.addResult(
          'Image-to-Video API (Landscape)',
          true,
          'API correctly enforced quota/credit limits',
          { status: response.status }
        );
      } else {
        this.addResult(
          'Image-to-Video API (Landscape)',
          false,
          `API returned error: ${data.error || 'Unknown error'}`,
          data
        );
      }
    } catch (error) {
      this.addResult(
        'Image-to-Video API (Landscape)',
        false,
        `Exception: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async test5_ImageToVideoAPI_WithFace() {
    console.log('\n📋 Test 5: Image-to-Video API - Face (Should Be Blocked)');
    console.log('='.repeat(80));

    try {
      const formData = new FormData();
      const imageBuffer = fs.readFileSync(this.testImageWithFacePath);
      const blob = new Blob([imageBuffer], { type: 'image/png' });

      formData.append('prompt', 'Camera movement test');
      formData.append('image', blob, 'test-with-face.png');
      formData.append('aspect_ratio', 'landscape');
      formData.append('quality', 'standard');

      const response = await fetch(`${this.apiBaseUrl}/api/v1/sora-image-generate`, {
        method: 'POST',
        body: formData,
        headers: this.authToken
          ? {
              Cookie: `auth_token=${this.authToken}`,
            }
          : {},
      });

      const data = await response.json();

      if (response.status === 401) {
        this.addResult(
          'Image-to-Video API (Face Block)',
          false,
          'Authentication required - skipping test',
          { status: 401 }
        );
        return;
      }

      if (
        response.status === 400 &&
        data.error &&
        (data.error.toLowerCase().includes('face') ||
          data.error.toLowerCase().includes('people') ||
          data.error.toLowerCase().includes('person'))
      ) {
        this.addResult(
          'Image-to-Video API (Face Block)',
          true,
          'Correctly blocked image with face',
          {
            error: data.error,
            status: response.status,
          }
        );
      } else if (response.ok) {
        this.addResult(
          'Image-to-Video API (Face Block)',
          false,
          'API should have blocked image with face but accepted it',
          data
        );
      } else {
        this.addResult(
          'Image-to-Video API (Face Block)',
          false,
          `Unexpected response: ${data.error || 'Unknown'}`,
          data
        );
      }
    } catch (error) {
      this.addResult(
        'Image-to-Video API (Face Block)',
        false,
        `Exception: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async test6_StatusEndpoint() {
    console.log('\n📋 Test 6: Task Status Endpoint');
    console.log('='.repeat(80));

    try {
      // Test with a dummy task ID
      const dummyTaskId = 'test-task-123';
      const response = await fetch(
        `${this.apiBaseUrl}/api/v1/sora-task-status?taskId=${dummyTaskId}`,
        {
          method: 'GET',
          headers: this.authToken
            ? {
                Cookie: `auth_token=${this.authToken}`,
              }
            : {},
        }
      );

      if (response.status === 401) {
        this.addResult('Task Status Endpoint', false, 'Authentication required - skipping test', {
          status: 401,
        });
        return;
      }

      // We expect this to fail with a proper error since it's a dummy task
      const data = await response.json();

      if (response.status === 400 || response.status === 404) {
        this.addResult('Task Status Endpoint', true, 'Endpoint properly handles invalid task ID', {
          status: response.status,
        });
      } else if (response.ok) {
        this.addResult('Task Status Endpoint', true, 'Endpoint is functional', data);
      } else {
        this.addResult(
          'Task Status Endpoint',
          false,
          `Unexpected response: ${response.status}`,
          data
        );
      }
    } catch (error) {
      this.addResult(
        'Task Status Endpoint',
        false,
        `Exception: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  private cleanup() {
    console.log('\n🧹 Cleaning up test files...');
    console.log('-'.repeat(80));

    try {
      if (this.testImagePath && fs.existsSync(this.testImagePath)) {
        fs.unlinkSync(this.testImagePath);
        console.log(`✅ Deleted: ${this.testImagePath}`);
      }
      if (this.testImageWithFacePath && fs.existsSync(this.testImageWithFacePath)) {
        fs.unlinkSync(this.testImageWithFacePath);
        console.log(`✅ Deleted: ${this.testImageWithFacePath}`);
      }
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error);
    }
  }

  private printSummary() {
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

    console.log('\nDetailed Results:');
    this.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.name}`);
      console.log(`   ${result.message}`);
    });

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Image-to-Video processing is working correctly.\n');
      return 0;
    }
    console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');

    // Provide helpful tips
    console.log('💡 Troubleshooting Tips:');
    if (
      this.results.some((r) => r.name.includes('API') && !r.passed && r.details?.status !== 401)
    ) {
      console.log('   - Ensure your development server is running: pnpm dev');
      console.log('   - Check that all environment variables are set correctly');
      console.log('   - Verify KIE_API_KEY is configured');
    }
    if (this.results.some((r) => r.name.includes('Vision') && !r.passed)) {
      console.log('   - Verify Google Vision API credentials are properly configured');
      console.log('   - Check GOOGLE_APPLICATION_CREDENTIALS environment variable');
    }
    console.log('');

    return 1;
  }

  async runAll() {
    console.log('🧪 Image to Video Processing - Automated Test Suite');
    console.log('='.repeat(80));
    console.log(`API Base URL: ${this.apiBaseUrl}`);
    console.log(`Time: ${new Date().toISOString()}`);

    try {
      await this.test1_CreateTestImages();
      await this.test2_VisionAPICheck();
      await this.test3_APIEndpointReachable();
      await this.test4_ImageToVideoAPI_Landscape();
      await this.test5_ImageToVideoAPI_WithFace();
      await this.test6_StatusEndpoint();
    } catch (error) {
      console.error('\n💥 Fatal error during test execution:', error);
    } finally {
      this.cleanup();
      const exitCode = this.printSummary();
      process.exit(exitCode);
    }
  }
}

// Run tests
const tester = new ImageToVideoTester();
tester.runAll().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});
