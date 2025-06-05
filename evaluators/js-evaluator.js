// backend/evaluators/js-evaluator.js
import axios from 'axios';
import { getDB } from "../utils/db.js" // Ensure this path is correct

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com'; // Your Judge0 API endpoint

// Helper function for delays in polling
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Fetches JavaScript test cases from the database for a given exercise.
 * @param {number} exerciseId - The ID of the exercise.
 * @returns {Promise<Array<Object>>} An array of test case objects.
 */
export async function getJavaScriptTestCases(exerciseId) {
    try {
        const query = `
        SELECT
            id,              -- Crucial for ordering and feedback
            description,     -- Useful for feedback to the user
            input_value AS input,
            expected_value AS expected_output_or_regex, 
            time_limit
        FROM
            testcases
        WHERE
            exercise_id = ?
        AND
            test_type = "javascript"
        ORDER BY id ASC;
        `;

        const connection = getDB();
        const [rows] = await connection.execute(query, [exerciseId]);

        return rows.map(row => ({
            id: row.id,
            description: row.description,
            input: row.input,
            expected_output_or_regex: row.expected_output_or_regex,
            time_limit: row.time_limit || 1
        }));
    } catch (error) {
        console.error(`Error getting JavaScript test cases for exercise ${exerciseId}:`, error);
        return [];
    }
}

/**
 * Evaluates JavaScript code against an exercise's test cases.
 * Dynamically chooses between I/O-based batch submission and console.log-based single submission + regex check.
 * @param {string} code - The user's JavaScript code.
 * @param {number} exerciseId - The ID of the exercise to evaluate against.
 * @returns {Promise<Array<Object>>} An array of test results.
 */
export async function evaluateJavaScript(code, exerciseId) {
    const testCases = await getJavaScriptTestCases(exerciseId);

    console.log("--- DEBUG: Fetched testCases for Exercise", exerciseId, "---"); // New line for clarity
    console.log(testCases); // <-- THIS IS THE CRITICAL LINE
    console.log("------------------------------------------");

    if (testCases.length === 0) {
        console.warn(`No JavaScript test cases found for exerciseId: ${exerciseId}`);
        return []; // No tests to run
    }

    // Determine evaluation strategy:
    // If any test case has an 'input' value, it's an I/O based test (e.g., Exercise 20)
    // and we'll use Judge0's built-in comparison (batch submission).
    const isIOBasedTest = testCases.some(tc => tc.input !== null && tc.input !== undefined && tc.input !== '');

    console.log(isIOBasedTest)

    let finalResults = [];

    if (isIOBasedTest) {
        // Strategy 1: I/O Based Test (Judge0 does comparison for each input)
        console.log(`Evaluating JavaScript exercise ${exerciseId} with I/O based strategy.`);
        const submissions = testCases.map(testCase => ({
            // CRITICAL CHANGE HERE: Prepend the testCase.input to the user's code
            source_code: testCase.input + '\n' + code, // This combines "let temperature = X;" with the actual logic
            language_id: 63, // JavaScript (Node.js)
            stdin: '', // CLEAR STDIN: We've now put the input directly into the source_code
            // For I/O tests, expected_output_or_regex IS the exact expected output for Judge0
            expected_output: testCase.expected_output_or_regex,
            cpu_time_limit: testCase.time_limit || 1
        }))

        try {
            const response = await axios.post(
                `${JUDGE0_API}/submissions/batch`,
                { submissions },
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // Poll for batch results
            finalResults = await getBatchSubmissionResults(response.data.map(s => s.token), testCases);
        } catch (error) {
            console.error("Judge0 batch submission error:", error.response ? error.response.data : error.message);
            // Map original test cases to a failed state if there's a submission error
            finalResults = testCases.map(testCase => ({
                id: testCase.id,
                description: testCase.description || 'Test',
                passed: false,
                actual: null,
                error: "Evaluation failed due to submission error.",
                time: null,
                memory: null,
                status_description: "Submission Error"
            }));
        }

    } else {
        // Strategy 2: Console.log Sequence Test (single submission + custom regex check)
        console.log(`Evaluating JavaScript exercise ${exerciseId} with console.log sequence strategy.`);
        const submission = {
            source_code: code,
            language_id: 63, // JavaScript (Node.js)
            // No stdin for these types of tests
            cpu_time_limit: testCases[0]?.time_limit || 1 // Use time limit from first test case
        };

        let judge0Result;
        try {
            const response = await axios.post(
                `${JUDGE0_API}/submissions`, // Single submission endpoint
                submission,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const token = response.data.token;
            judge0Result = await getSingleSubmissionResult(token);

        } catch (error) {
            console.error("Judge0 submission error:", error.response ? error.response.data : error.message);
            finalResults = testCases.map(testCase => ({
                id: testCase.id,
                description: testCase.description || 'Test',
                passed: false,
                actual: null,
                error: "Evaluation failed due to submission error.",
                time: null,
                memory: null,
                status_description: "Submission Error"
            }));
        }

        const judge0Stdout = judge0Result?.stdout || '';
        const judge0Stderr = judge0Result?.stderr || '';
        const judge0StatusId = judge0Result?.status?.id;
        const judge0Time = judge0Result?.time;
        const judge0Memory = judge0Result?.memory;

        // Handle Judge0 compilation/runtime/timeout errors first for single submission
        if (judge0StatusId === 6) { // Compilation Error
            return testCases.map(testCase => ({
                id: testCase.id,
                description: testCase.description || 'Test',
                passed: false,
                actual: judge0Stdout,
                error: judge0Stderr || "Compilation Error. Check your syntax.",
                time: judge0Time,
                memory: judge0Memory,
                status_description: "Compilation Error"
            }));
        } else if (judge0StatusId >= 7 && judge0StatusId <= 12) { // Runtime Errors
             return testCases.map(testCase => ({
                id: testCase.id,
                description: testCase.description || 'Test',
                passed: false,
                actual: judge0Stdout,
                error: judge0Stderr || "Runtime Error. Your code crashed during execution.",
                time: judge0Time,
                memory: judge0Memory,
                status_description: judge0Result?.status?.description || "Runtime Error"
            }));
        } else if (judge0StatusId === 5) { // Time Limit Exceeded
            return testCases.map(testCase => ({
                id: testCase.id,
                description: testCase.description || 'Test',
                passed: false,
                actual: judge0Stdout,
                error: "Time Limit Exceeded. Your code took too long to run.",
                time: judge0Time,
                memory: judge0Memory,
                status_description: "Time Limit Exceeded"
            }));
        }

        // Split stdout into lines and trim whitespace, filtering out empty lines
        const outputLines = judge0Stdout.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Iterate through each test case and perform custom regex assertions
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            let passed = false;
            let error_message = '';
            // Get the corresponding output line based on test case order
            let actualLine = outputLines[i] || ''; // Use empty string if line doesn't exist

            try {
                // For sequential console.log tests, expected_output_or_regex is a regex pattern
                const regex = new RegExp(testCase.expected_output_or_regex);

                if (regex.test(actualLine)) {
                    passed = true;
                } else {
                    error_message = `Expected line ${i+1} to match pattern "${testCase.expected_output_or_regex}", but got "${actualLine}"`;
                    // If a test case fails, we can stop evaluating further or mark remaining as failed
                    // For now, we'll continue to provide feedback for all.
                }
            } catch (regexError) {
                passed = false;
                error_message = `Invalid regex in test case for description "${testCase.description}": ${regexError.message}`;
            }

            finalResults.push({
                id: testCase.id, // Pass ID for frontend mapping
                description: testCase.description || `Test ${i + 1}`, // Pass description for frontend
                passed: passed,
                actual: judge0Stdout, // Show full stdout for context
                expected_output: testCase.expected_output_or_regex, // Show the regex pattern
                error: error_message,
                time: judge0Time,
                memory: judge0Memory,
                status_description: passed ? "Accepted" : "Wrong Answer"
            });
        }
    }

    return finalResults;
}

/**
 * Helper to poll for a single Judge0 submission result.
 * @param {string} token - The submission token.
 * @returns {Promise<Object>} The Judge0 submission result.
 */
async function getSingleSubmissionResult(token) {
    const MAX_POLLING_ATTEMPTS = 2;
    const POLLING_INTERVAL_MS = 5000;

    let attempts = 0;
    let submissionResult = null;

    while (!submissionResult && attempts < MAX_POLLING_ATTEMPTS) {
        try {
            const response = await axios.get(
                `${JUDGE0_API}/submissions/${token}?base64_encoded=false&fields=*`,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
                    }
                }
            );

            const sub = response.data;
            // Status ID 1 (In Queue) or 2 (Processing) means it's not done yet
            if (sub.status?.id !== 1 && sub.status?.id !== 2) {
                submissionResult = sub;
            } else {
                console.warn(`[Polling] Submission ${token} still processing. Attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS}. Retrying in ${POLLING_INTERVAL_MS / 1000}s...`);
                await delay(POLLING_INTERVAL_MS);
            }
        } catch (error) {
            console.error("Error fetching single submission result during polling:", error.response ? error.response.data : error.message);
            throw error; // Re-throw to be caught by the main evaluation function
        }
        attempts++;
    }
    if (!submissionResult) {
        throw new Error("Submission did not complete within the allowed time.");
    }
    return submissionResult;
}

/**
 * Helper to poll for batch Judge0 submission results.
 * @param {Array<string>} tokens - Array of submission tokens.
 * @param {Array<Object>} originalTestCases - The original test case objects to map results back to.
 * @returns {Promise<Array<Object>>} An array of formatted test results.
 */
async function getBatchSubmissionResults(tokens, originalTestCases) {
    if (tokens.length === 0) {
        return [];
    }
    const MAX_POLLING_ATTEMPTS = 2;
    const POLLING_INTERVAL_MS = 5000;

    let completedSubmissions = [];
    let attempts = 0;

    while (completedSubmissions.length < tokens.length && attempts < MAX_POLLING_ATTEMPTS) {
        try {
            const response = await axios.get(
                `${JUDGE0_API}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=false&fields=*`,
                {
                    headers: {
                        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
                    }
                }
            );

            completedSubmissions = response.data.submissions.filter(
                sub => sub.status?.id !== 1 && sub.status?.id !== 2
            );

            if (completedSubmissions.length < tokens.length) {
                console.warn(`[Polling] ${tokens.length - completedSubmissions.length} submissions still processing. Attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS}. Retrying in ${POLLING_INTERVAL_MS / 1000}s...`);
                await delay(POLLING_INTERVAL_MS);
            }

        } catch (error) {
            console.error("Error fetching results during polling:", error.response ? error.response.data : error.message);
            break; // Break the loop if an error occurs during fetching
        }
        attempts++;
    }

    if (completedSubmissions.length < tokens.length) {
        console.warn(`[Polling] Max polling attempts reached. ${tokens.length - completedSubmissions.length} submissions might still be processing.`);
    }

    const finalResults = tokens.map(token => {
        const sub = completedSubmissions.find(s => s.token === token);
        // Find the original test case details based on the order of tokens received
        const originalTestCase = originalTestCases[tokens.indexOf(token)];

        if (!sub) {
            return {
                id: originalTestCase.id, // Include test case ID
                description: originalTestCase.description || 'Test',
                passed: false,
                actual: null,
                error: originalTestCase?.error_message || "Submission did not complete within the allowed time or due to an internal error.",
                time: null,
                memory: null,
                status_description: "Not completed"
            };
        }

        const isPassed = sub.status?.id === 3; // Judge0 status ID 3 = Accepted (success)
        let error_message = sub.stderr; // Default to Judge0's stderr

        // Provide more descriptive error messages based on Judge0 status codes
        if (sub.status?.id === 4) { // Wrong Answer
            // For I/O tests, Judge0's expected_output is the exact string.
            // If originalTestCase.error_message is defined, use that for better user feedback.
            error_message = originalTestCase?.error_message || `Wrong Answer. Expected: "${originalTestCase.expected_output_or_regex.trim()}", Got: "${sub.stdout ? sub.stdout.trim() : ''}".`;
        } else if (sub.status?.id === 5) { // Time Limit Exceeded
            error_message = "Time Limit Exceeded. Your code took too long to run.";
        } else if (sub.status?.id === 6) { // Compilation Error
            error_message = "Compilation Error. Your code could not be compiled. Check your syntax.";
        } else if (sub.status?.id >= 7 && sub.status?.id <= 12) { // Runtime Errors (various types)
            error_message = "Runtime Error. Your code crashed during execution.";
        } else if (sub.status?.id === 13) { // Internal Error
            error_message = "Judge0 Internal Error. Please try again or contact support.";
        } else if (!isPassed && sub.status?.description) {
            error_message = `Submission Failed: ${sub.status.description}.`;
        }

        return {
            id: originalTestCase.id, // Include test case ID
            description: originalTestCase.description || 'Test',
            passed: isPassed,
            actual: sub.stdout,
            error: error_message,
            time: sub.time,
            memory: sub.memory,
            status_description: sub.status?.description
        };
    });

    return finalResults;
}