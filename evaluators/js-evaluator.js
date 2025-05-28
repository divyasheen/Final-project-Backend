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

        const connection = getDB()

        const [rows] = await connection.execute(query, [exerciseId])

        return rows.map(row => ({
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

    // call the internal, specific function
    const testCases = await getJavaScriptTestCases(exerciseId);
    
    if (testCases.length === 0) {
        console.warn(`No JavaScript test cases found for exerciseId: ${exerciseId}`)
        return [] // No tests to run
    }
    
    const submissions = testCases.map(testCase => ({
        source_code: code,
        language_id: 63, // JavaScript (Node.js)
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
        console.error("Judge0 submission error:", error.response ? error.response.data : error.message);
        return testCases.map(() => ({ passed: false, error: "Evaluation failed due to submission error." }));
    }
}

async function getSubmissionResults(tokens) {

    if (tokens.length === 0) {
        return []
    }
    try {
        const response = await axios.get(
            `${JUDGE0_API}/submissions/batch?tokens=${tokens.join(',')}`,
            {
                headers: {
                    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
                }
            }
        );

        // Filter out submissions that are still processing (status 1 or 2)
        const completedSubmissions = response.data.submissions.filter(sub => sub.status?.id !== 1 && sub.status?.id !==2)

        if (completedSubmissions.length < tokens.length) {
            // Some submissions are still in queue or compiling evtl. re-fetch after delay
            console.warn("Some Judge0 submissions are still processing. Implement polling mechanism?")
            // Currently processing the ones that are done
        }
        
        return completedSubmissions.map(sub => ({
            passed: sub.status?.id === 3, // Judge0 status ID 3 = accepted
            actual: sub.stdout,
            error: sub.stderr,
            time: sub.time,
            memory: sub.memory,
            status_description: sub.status?.description // for debugging
        }));
    } catch (error) {
        console.error("Error fetching results:", error.response ? error.response.data : error.message)
        return tokens.map(() => ({ passed: false, error: "Evaluation failed while fetching results" }));
    }
}
