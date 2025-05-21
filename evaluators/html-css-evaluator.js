import { JSDOM } from 'jsdom';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test cases for a given exercise
export async function getTestCases(exerciseId) {
    try {
        const data = await readFile(
            path.join(__dirname, '../data/testcases.json'),
            'utf8'
        );
        const allTestCases = JSON.parse(data);
        return allTestCases.filter(tc => String(tc.exercise_id) === String(exerciseId));
    } catch (error) {
        console.error(`Error loading test cases for exercise ${exerciseId}:`, error);
        return [];
    }
}

// Main HTML/CSS evaluator
export async function evaluateHTML(submittedCode, exerciseId) {
    const exerciseTests = await getTestCases(exerciseId);
    const results = [];

    try {
        const dom = new JSDOM(submittedCode);
        const { document, window } = dom.window;


        for (const test of exerciseTests) {
            let result = { ...test, passed: false, actual: null };
            let element = null;
            let elements = null;
            let style = null;

            try {
                switch (test.test_type) {
                    case 'html_structure':
                        element = document.querySelector(test.selector);
                        result.actual = element?.textContent?.trim();
                        result.passed = !!element && new RegExp(test.expected_value, 'i').test(result.actual);
                        break;

                    case 'css_property':
                        if (test.viewport_size) {
                            dom.reconfigure({ windowWidth: test.viewport_size });
                        }
                        element = document.querySelector(test.selector);
                        if (element) {
                            style = window.getComputedStyle(element);
                            const cssValue = style?.getPropertyValue(test.property)?.trim();
                            result.actual = cssValue;
                            result.passed = new RegExp(test.expected_value, 'i').test(cssValue);
                        }
                        break;

                    case 'element_count':
                        elements = document.querySelectorAll(test.selector);
                        const count = elements.length;
                        result.actual = count.toString();

                        if (test.expected_value.endsWith('+')) {
                            const min = parseInt(test.expected_value);
                            result.passed = count >= min;
                        } else {
                            result.passed = count === parseInt(test.expected_value);
                        }
                        break;

                    case 'attribute_check':
                        element = document.querySelector(test.selector);
                        result.actual = element?.getAttribute(test.property);
                        result.passed = !!element && new RegExp(test.expected_value, 'i').test(result.actual);
                        break;

                    case 'html_content':
                        element = document.querySelector(test.selector);
                        result.actual = element?.textContent?.trim();
                        result.passed = !!element && new RegExp(test.expected_value, 'i').test(result.actual);
                        break;

                    case 'responsive':
                        dom.reconfigure({ windowWidth: test.viewport_size });
                        element = document.querySelector(test.selector);
                        if (element) {
                            style = window.getComputedStyle(element);
                            const cssVal = style?.getPropertyValue(test.property)?.trim();
                            result.actual = cssVal;
                            result.passed = new RegExp(test.expected_value, 'i').test(cssVal);
                        }
                        break;

                    default:
                        result.error = `Unknown test type: ${test.test_type}`;
                        break;
                }
            } catch (innerError) {
                result.error = `Error evaluating test: ${innerError.message}`;
            }

            results.push(result);
        }
    } catch (error) {
        console.error("Evaluation error:", error);
    }

    return {
        success: true,
        exercise_id: exerciseId,
        tests: results,
        score: calculateScore(results)
    };
}

// Calculate overall score
function calculateScore(results) {
    const totalWeight = results.reduce((sum, test) => sum + (test.weight || 1), 0);
    const earnedWeight = results.reduce((sum, test) => sum + (test.passed ? (test.weight || 1) : 0), 0);
    return Math.round((earnedWeight / totalWeight) * 100);
}
