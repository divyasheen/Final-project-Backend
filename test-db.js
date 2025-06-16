// backend/test-db-connection.js
import { connect2DB, getDB } from './utils/db.js';
import { evaluateJavaScript } from './evaluators/js-evaluator.js'; // Import evaluateJavaScript

async function runTest() {
    console.log("Attempting to connect to DB...");
    try {
        await connect2DB();
        console.log("DB connection successful!");

        // const fetchedTestCases = await evaluateJavaScript.getJavaScriptTestCases(exerciseIdToTest);
        // console.log(`Fetched ${fetchedTestCases.length} test cases.`);

        // --- TEST evaluateJavaScript (the full flow with Judge0) ---
        const exerciseIdToTest = 17; // Using lesson ID 17 for "Hello, world!"
        console.log(`\n--- Testing evaluateJavaScript for exercise ID: ${exerciseIdToTest} ---`);

        // Sample user code for Lesson 17: "Hello, world!"
        const userCode = `console.log('Hello, world!');`;
        console.log(`Evaluating code:\n${userCode}`);

        const results = await evaluateJavaScript(userCode, exerciseIdToTest);

        if (results && results.length > 0) {
            console.log("\nJudge0 Evaluation Results:");
            results.forEach((res, index) => {
                console.log(`  Test Case ${index + 1}:`);
                console.log(`    Passed: ${res.passed}`);
                console.log(`    Status: ${res.status_description}`);
                console.log(`    Actual Output: ${res.actual ? JSON.stringify(res.actual) : 'None'}`);
                console.log(`    Error Output: ${res.error ? JSON.stringify(res.error) : 'None'}`);
                console.log(`    Time: ${res.time}s`);
                console.log(`    Memory: ${res.memory}KB`);
            });
        } else {
            console.log("No evaluation results returned or an error occurred.");
            if (results) {
                console.log("Raw results:", results);
            }
        }

    } catch (error) {
        console.error("Full evaluation test failed:", error);
    } finally {
        // No need to explicitly close connection for pools in test script
    }
}

runTest();