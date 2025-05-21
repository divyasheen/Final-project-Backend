import express from 'express';
import { evaluateHTML } from '../evaluators/html-css-evaluator.js';
import { evaluateJavaScript } from '../evaluators/js-evaluator.js';

const router = express.Router();

router.post('/evaluate', async (req, res, next) => {
    try {
        const { code, exerciseId, language } = req.body;
        
        let response;
        if (language === 'html') {
            response = await evaluateHTML(code, exerciseId);
        } else if (language === 'javascript') {
            response = await evaluateJavaScript(code, exerciseId);
        } else {
            throw new Error('Unsupported language');
        }
        
        res.json({ success: true, ...response });
    } catch (error) {
        next(error);
    }
});

export default router;