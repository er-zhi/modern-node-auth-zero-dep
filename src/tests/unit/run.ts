import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, extname, join } from 'path';

// Get the directory of the test files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all test files (excluding run.ts)
const testFiles = readdirSync(__dirname)
  .filter((file) => extname(file) === '.ts' && file !== 'run.ts')
  .map((file) => pathToFileURL(join(__dirname, file)).href);

// Function to run a test file with a timeout of 1 second for execution
async function runTest(file: string) {
  console.log(`🚀 Running test: ${file}`);

  try {
    // Load the test module before starting the timeout
    const testModule = await import(file);

    await testModule.default?.();

    console.log(`✅ Passed: ${file}\n`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error); // ✅ Type-safe error handling
    console.error(`❌ Failed: ${file} - ${errorMessage}\n`);
    process.exit(1); // Stop execution on first failure
  }
}

// Run all tests sequentially, ensuring 🎉 appears last
async function runTests() {
  for (const file of testFiles) {
    await runTest(file); // Run each test sequentially
  }

  // Ensure the test framework fully prints before 🎉
  await new Promise((resolve) => setTimeout(resolve, 10));

  console.log(`\n🎉 All tests completed successfully! 🎯\n`);
}

// Execute test runner
void runTests();
