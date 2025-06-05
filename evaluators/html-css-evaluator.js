import { JSDOM } from "jsdom";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test cases for a given exercise
export async function getTestCases(exerciseId) {
  try {
    const data = await readFile(
      path.join(__dirname, "../data/testcases.json"),
      "utf8"
    );
    const allTestCases = JSON.parse(data);
    return allTestCases.filter(
      (tc) => String(tc.exercise_id) === String(exerciseId)
    );
  } catch (error) {
    console.error(
      `Error loading test cases for exercise ${exerciseId}:`,
      error
    );
    return [];
  }
}
// Enhanced CSS value normalizer
function normalizeCssValue(value, property) {
  if (!value) return "";

  // Special handling for color properties
  if (["color", "background-color", "border-color"].includes(property)) {
    return normalizeColorValue(value);
  }

  // For other properties, just clean whitespace and lowercase
  return value.toString().toLowerCase().replace(/\s+/g, "");
}

// Robust color normalizer
function normalizeColorValue(color) {
  if (!color) return "";

  // Convert to string and clean
  color = color.toString().toLowerCase().replace(/\s+/g, "");

  // Handle color keywords
  const colorKeywords = {
    green: "rgb(0,128,0)",
    blue: "rgb(0,0,255)",
    red: "rgb(255,0,0)",
    white: "rgb(255,255,255)",
    black: "rgb(0,0,0)",
    yellow: "rgb(255,255,0)",
    lightgray: "rgb(211,211,211)",
    lightgrey: "rgb(211,211,211)",
    lightblue: "rgb(173,216,230)",
    lightgreen: "rgb(144,238,144)",
  };

  // Return normalized keyword if exists
  if (colorKeywords[color]) {
    return colorKeywords[color];
  }

  // Fix common RGB issues
  if (color.startsWith("rgb(")) {
    // Fix invalid values (like 256) by clamping to 255
    const rgbValues = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (rgbValues) {
      const r = Math.min(parseInt(rgbValues[1]), 255);
      const g = Math.min(parseInt(rgbValues[2]), 255);
      const b = Math.min(parseInt(rgbValues[3]), 255);
      return `rgb(${r},${g},${b})`;
    }
  }

  // Fix hex shorthand (like #fff → #ffffff)
  if (color.startsWith("#") && color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return color;
}

// Enhanced property comparison
function compareCssProperty(actual, expected, property) {
  if (!actual || !expected) return false;

  // Handle multiple expected values
  const expectedValues = expected.split("||").map((v) => v.trim());

  // Normalize actual value
  const normActual = normalizeCssValue(actual, property);

  // Check against each expected value
  return expectedValues.some((expected) => {
    const normExpected = normalizeCssValue(expected, property);

    // For colors, compare normalized values directly
    if (["color", "background-color", "border-color"].includes(property)) {
      return normActual === normExpected;
    }

    // For other properties, use regex if expected contains special chars
    if (/[|*+?^${}()]/.test(normExpected)) {
      return new RegExp(normExpected, "i").test(normActual);
    }

    // Default to exact match
    return normActual === normExpected;
  });
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
          case "html_structure":
            element = document.querySelector(test.selector);
            result.actual = element?.textContent?.trim();
            result.passed =
              !!element &&
              new RegExp(test.expected_value, "i").test(result.actual);
            break;

          case "css_property":
            if (test.viewport_size) {
              dom.reconfigure({ windowWidth: test.viewport_size });
            }
            element = document.querySelector(test.selector);
            if (element) {
              style = window.getComputedStyle(element);
              const cssValue = style?.getPropertyValue(test.property)?.trim();

              result.actual = cssValue;
              result.passed = compareCssProperty(
                cssValue,
                test.expected_value,
                test.property
              );
            }
            break;

          case "element_count":
            elements = document.querySelectorAll(test.selector);
            const count = elements.length;
            result.actual = count.toString();

            if (test.expected_value.endsWith("+")) {
              const min = parseInt(test.expected_value);
              result.passed = count >= min;
            } else {
              result.passed = count === parseInt(test.expected_value);
            }
            break;

          case "attribute_check":
            element = document.querySelector(test.selector);
            result.actual = element?.getAttribute(test.property);
            result.passed =
              !!element &&
              new RegExp(test.expected_value, "i").test(result.actual);
            break;

          case "html_content":
            element = document.querySelector(test.selector);
            result.actual = element?.textContent?.trim();
            result.passed =
              !!element &&
              new RegExp(test.expected_value, "i").test(result.actual);
            break;

          case "responsive":
            dom.reconfigure({ windowWidth: test.viewport_size });
            element = document.querySelector(test.selector);
            if (element) {
              style = window.getComputedStyle(element);
              const cssVal = style?.getPropertyValue(test.property)?.trim();
              result.actual = cssVal;
              result.passed = new RegExp(test.expected_value, "i").test(cssVal);
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
    score: calculateScore(results),
  };
}

// Calculate overall score
function calculateScore(results) {
  const totalWeight = results.reduce(
    (sum, test) => sum + (test.weight || 1),
    0
  );
  const earnedWeight = results.reduce(
    (sum, test) => sum + (test.passed ? test.weight || 1 : 0),
    0
  );
  return Math.round((earnedWeight / totalWeight) * 100);
}
