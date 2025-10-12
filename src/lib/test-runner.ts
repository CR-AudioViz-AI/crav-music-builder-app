import { runSmokeTests, generateTestPrompts } from './smoke-tests';
import type { SmokeTestResult } from './smoke-tests';

export async function executeAllTests(): Promise<void> {
  console.log('🧪 Running AI Song Builder Smoke Tests\n');
  console.log('═'.repeat(60));

  const results = await runSmokeTests();

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${icon}${reset} ${result.test}`);

    if (!result.passed) {
      console.log(`  Expected: ${JSON.stringify(result.expected)}`);
      console.log(`  Actual:   ${JSON.stringify(result.actual)}`);
      if (result.message) {
        console.log(`  Message:  ${result.message}`);
      }
    }

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('═'.repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${results.length} tests`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
  }
}

export function displayTestPrompts(): void {
  console.log('\n📝 Sample Test Prompts\n');
  console.log('═'.repeat(60));

  const prompts = generateTestPrompts();

  console.log('\n✓ Valid Jingle (30s):');
  console.log(JSON.stringify(prompts.validJingle30s, null, 2));

  console.log('\n✓ Valid Instrumental (60s):');
  console.log(JSON.stringify(prompts.validInstrumental60s, null, 2));

  console.log('\n✗ Blocked - Artist Style:');
  console.log(JSON.stringify(prompts.blockedArtistStyle, null, 2));

  console.log('\n✗ Blocked - Profanity:');
  console.log(JSON.stringify(prompts.blockedProfanity, null, 2));

  console.log('\n' + '═'.repeat(60));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  executeAllTests().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
