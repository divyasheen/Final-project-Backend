import express from 'express';
import { evaluateHTML } from '../evaluators/html-css-evaluator.js';
import { evaluateJavaScript } from '../evaluators/js-evaluator.js';

const router = express.Router();

router.post('/evaluate', async (req, res, next) => {
    try {
        const { code, exerciseId, language } = req.body;
        
        let response;
        if (!code || !exerciseId || !language) {
            return res.status(400).json({ success: false, message: "Missing code, exerciseId or language"}) 
        } 
        
        let evaluationResult
        let score = 0

        if (language === "html" || language === "css") {
            // for HTML/CSS, evaluateHTML returns { success, tests, score, htmlPreview }
            evaluationResult = await evaluateHTML(code, exerciseId)
            score = evaluationResult.score // evaluateHTML calculates the score
            // Include htmlPreview in response
            return res.json({
                success: true,
                tests: evaluationResult.tests,
                score: score,
                htmlPreview: code // send the suibmitted code as htmlPreview for HTML/CSS
            })
        } else if (language === "javascript") {
            // For JS, evaluateJavaScript returns an array of individual test results
            const jsTestResults = await evaluateJavaScript(code, exerciseId)

            // calculate score for results
            const totalWeight = jsTestResults.reduce((sum, test) => sum + (test.weight || 1), 0)
            const earnedWeight = jsTestResults.reduce((sum, test) => sum + (test.passed ? (test.weight || 1) : 0), 0)
            score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0

            return res.json({
                success: true,
                tests: jsTestResults, // array of objects [{ passed, actual, error, time, memory, status_description }]
                score: score,
                htmlPreview: null 
            })
        } else {
            return res.status(400).json({ success: false, message: "Unsupported language for evaluation." })
        }
        
    } catch (error) {
        console.error("Evaluation Endpoint Error", error)
        next(error);
    }
});

export default router;