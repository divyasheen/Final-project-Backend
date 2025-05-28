// backend/evaluators/js-evaluator.js
import axios from 'axios';

// import DB connection
import { getDB } from "../utils/db.js" 

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export async function getJavaScriptTestCases(exerciseId) {
    try {

        // Maps DB column "input_value" to "input" for evaluator
        // Maps DB column "expected_value" to "expected_output" for evaluator

        const query = `
        SELECT
            input_value AS input, 
            expected_value AS expected_output,
            time_limit
        FROM
            testcases
        WHERE
            exercise_id = ?
        AND
            test_type = "javascript";
        `

        const result = await getDB.query(query, [exerciseId.Id])

        return result.rows.map(row => ({
            input: row.input,
            expected_output: row.expected_output,
            time_limit: row.time_limit || 1
        }))
    } catch (error) {
        console.error(`Error getting getJavaScriptTestCases for exercise ${exerciseId}:`, error)
        return []
    }
}

export async function evaluateJavaScript(code, exerciseId) {

    // 
    const testCases = await getTestCases(exerciseId);
    const submissions = testCases.map(testCase => ({
        source_code: code,
        language_id: 63, // JavaScript
        stdin: testCase.input,
        expected_output: testCase.expected_output,
        cpu_time_limit: testCase.time_limit || 1
    }));

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
        
        return await getSubmissionResults(response.data.map(s => s.token));
    } catch (error) {
        console.error("Judge0 error:", error);
        return [];
    }
}

async function getSubmissionResults(tokens) {
    try {
        const response = await axios.get(
            `${JUDGE0_API}/submissions/batch?tokens=${tokens.join(',')}`,
            {
                headers: {
                    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
                }
            }
        );
        
        return response.data.submissions.map(sub => ({
            passed: sub.status?.id === 3,
            actual: sub.stdout,
            error: sub.stderr,
            time: sub.time,
            memory: sub.memory
        }));
    } catch (error) {
        console.error("Error fetching results:", error);
        return tokens.map(() => ({ passed: false, error: "Evaluation failed" }));
    }
}