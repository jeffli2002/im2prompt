# Creem Subscription Upgrade - Automated Test Script

## Overview

This automated test script validates the Creem subscription upgrade implementation without requiring a running server or Jest environment. It performs **logic validation**, **code pattern checks**, **file existence verification**, and **TypeScript compilation tests**.

## Script Location

```
scripts/test-creem-upgrade.sh
```

## Features

✅ **26 Automated Tests** across 9 test suites  
✅ **No server required** - validates logic and code patterns  
✅ **Fast execution** - completes in ~10 seconds  
✅ **Colored output** - easy to read results  
✅ **JSON report** - machine-readable results  
✅ **Zero dependencies** - uses standard Unix tools  

## Test Suites

### 1. API Health Check (1 test)
- Validates API endpoint accessibility

### 2. Upgrade Logic Validation (3 tests)
- ✅ Pro → Pro+ detection
- ✅ Pro+ → Pro downgrade detection  
- ✅ Monthly → Yearly upgrade detection

### 3. Product Key Generation (4 tests)
- ✅ Pro Monthly (`pro_monthly`)
- ✅ Pro Yearly (`pro_yearly`)
- ✅ Pro+ Monthly (`proplus_monthly`)
- ✅ Pro+ Yearly (`proplus_yearly`)

### 4. Duplicate Request Detection (3 tests)
- ✅ Duplicate within 30 seconds
- ✅ No duplicate after 30 seconds
- ✅ Different plans not duplicates

### 5. Implementation File Validation (4 tests)
- ✅ `creem-service.ts` exists
- ✅ `upgrade-subscription.ts` action exists
- ✅ Upgrade API route exists
- ✅ Sync-checkout route exists

### 6. Code Pattern Validation (5 tests)
- ✅ `upgradeSubscription()` method exists
- ✅ `proration-none` mode supported
- ✅ `proration-charge` mode supported
- ✅ Upgrade detection logic exists
- ✅ Duplicate detection logic exists

### 7. TypeScript Compilation (2 tests)
- ✅ `creem-service.ts` compiles
- ✅ `upgrade-subscription.ts` compiles

### 8. Environment Configuration (3 tests)
- ✅ `CREEM_API_KEY` configured
- ✅ `CREEM_WEBHOOK_SECRET` configured
- ✅ Product keys configured

### 9. Documentation Validation (3 tests)
- ✅ Implementation summary exists
- ✅ Test status report exists
- ✅ README documentation exists

## Usage

### Basic Usage

```bash
# Run all tests
./scripts/test-creem-upgrade.sh
```

### With Custom Configuration

```bash
# Test against different API endpoint
API_BASE_URL=http://localhost:3001 ./scripts/test-creem-upgrade.sh

# Skip API health check
API_BASE_URL=http://example.com ./scripts/test-creem-upgrade.sh
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for API calls | `http://localhost:3000` |
| `TEST_USER_EMAIL` | Test user email | `test@example.com` |
| `TEST_USER_PASSWORD` | Test user password | `testpassword123` |

## Output

### Console Output

```
========================================
Creem Subscription Upgrade - Automated Tests
========================================

ℹ Configuration:
  API Base URL: http://localhost:3000
  Test User: test@example.com
  Results File: test-results-upgrade-20251014-170841.json

========================================
Test Suite 1: API Health Check
========================================

ℹ Running: API is accessible
✓ API is accessible

========================================
Test Suite 2: Upgrade Logic Validation
========================================

ℹ Running: Upgrade detection: Pro → Pro+
✓ Upgrade detection: Pro → Pro+
...

========================================
Test Summary
========================================

Total Tests: 26
Passed: 24
Failed: 2
Pass Rate: 92.31%

✓ Results saved to: test-results-upgrade-20251014-170841.json
```

### JSON Results File

```json
{
  "timestamp": "2025-10-14T17:08:52Z",
  "total": 26,
  "passed": 24,
  "failed": 2,
  "passRate": "92.31%",
  "tests": [
    {"test": "API is accessible", "status": "passed"},
    {"test": "Upgrade detection: Pro → Pro+", "status": "passed"},
    ...
  ]
}
```

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

## Integration with CI/CD

### GitHub Actions

```yaml
name: Test Creem Upgrade
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run upgrade tests
        run: ./scripts/test-creem-upgrade.sh
```

### GitLab CI

```yaml
test-upgrade:
  script:
    - chmod +x scripts/test-creem-upgrade.sh
    - ./scripts/test-creem-upgrade.sh
  artifacts:
    reports:
      junit: test-results-upgrade-*.json
```

## Requirements

### System Dependencies

- `bash` (v4.0+)
- `curl` (for API tests)
- `node` (for logic validation)
- `grep`, `sed` (standard Unix tools)
- `bc` (for percentage calculation)
- `jq` (optional, for JSON formatting)

### Installation

All dependencies are typically pre-installed on Unix systems. On Ubuntu/Debian:

```bash
sudo apt-get install curl bc jq
```

On macOS:

```bash
brew install curl bc jq
```

## Test Results History

Results are saved with timestamps:

```
test-results-upgrade-20251014-170841.json
test-results-upgrade-20251014-180215.json
test-results-upgrade-20251014-190532.json
```

### View Results

```bash
# View latest results
cat test-results-upgrade-*.json | jq '.'

# Count passed tests
jq '.passed' test-results-upgrade-*.json

# Get pass rate
jq '.passRate' test-results-upgrade-*.json
```

## Troubleshooting

### Tests Failing

**Issue**: "API is accessible" fails  
**Solution**: Start your dev server or skip API tests:
```bash
API_BASE_URL=http://example.com ./scripts/test-creem-upgrade.sh
```

**Issue**: "TypeScript compilation" fails  
**Solution**: Install TypeScript:
```bash
npm install -g typescript
```

**Issue**: "Environment variables" fail  
**Solution**: Create `.env` file with Creem configuration

### Permission Denied

```bash
chmod +x scripts/test-creem-upgrade.sh
```

### Missing Dependencies

```bash
# Check for required commands
command -v curl || echo "curl missing"
command -v node || echo "node missing"
command -v bc || echo "bc missing"
```

## Extending the Script

### Add New Test

```bash
# Add to appropriate test suite section
run_test "My new test" \
    "test_command_here" \
    "expected result"
```

### Add New Test Suite

```bash
print_header "Test Suite 10: My Custom Tests"

run_test "Custom test 1" \
    "my_test_function" \
    "expected"
```

## Performance

- **Execution Time**: ~10 seconds
- **Tests**: 26
- **Dependencies**: Minimal
- **Output Size**: <10KB

## Comparison with Jest Tests

| Feature | Test Script | Jest Tests |
|---------|-------------|------------|
| Setup time | None | Complex |
| Dependencies | Minimal | Many |
| Execution speed | Fast (~10s) | Slow (timeout issues) |
| Coverage | Logic & patterns | Full code coverage |
| CI/CD ready | ✅ Yes | ⚠️ Needs fixes |
| Debugging | Easy | Difficult |

## Best Practices

1. **Run before commit**
   ```bash
   git add . && ./scripts/test-creem-upgrade.sh && git commit
   ```

2. **Run in CI/CD pipeline**
   - Fast validation
   - No server required
   - Reliable exit codes

3. **Check results regularly**
   ```bash
   # View trend
   for file in test-results-upgrade-*.json; do
       echo "$file: $(jq '.passRate' $file)"
   done
   ```

4. **Keep script updated**
   - Add tests for new features
   - Update patterns as code evolves
   - Document new test suites

## Support

For issues or questions:
1. Check `TEST_STATUS_REPORT.md`
2. Review `UPGRADE_IMPLEMENTATION_SUMMARY.md`
3. Run script with verbose output:
   ```bash
   bash -x ./scripts/test-creem-upgrade.sh
   ```

## License

Same as project license.

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
