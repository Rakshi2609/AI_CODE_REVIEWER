const aiService = require("../services/ai.service.new")

// Normalize and validate language values
function normalizeLanguage(lang) {
    if (!lang) return null;
    const v = String(lang).trim().toLowerCase();
    const map = {
        js: 'javascript', 'javascript': 'javascript',
        ts: 'typescript', 'typescript': 'typescript',
        py: 'python', 'python': 'python',
        c: 'c',
        'c++': 'cpp', cpp: 'cpp',
        java: 'java'
    };
    return map[v] || null;
}

module.exports.getReview = async (req, res) => {
    try {
        const code = req.body.code;
        // Accept language via path param or body
        const language = normalizeLanguage(req.params.language || req.body.language);

        if (!code) {
            return res.status(400).json({ message: "Code is required" });
        }

        // Validate language if provided
        const allowed = [null, 'javascript', 'typescript', 'python', 'c', 'cpp', 'java'];
        if (!allowed.includes(language)) {
            return res.status(400).json({ message: "Unsupported language. Use one of: python, javascript, typescript, c, cpp, java." });
        }

        // Check code size (warn if very large)
        const codeSize = Buffer.byteLength(code, 'utf8');
        console.log(`Processing code review for ${codeSize} bytes`);
        
        if (codeSize > 5 * 1024 * 1024) { // 5MB limit
            return res.status(413).json({ 
                message: "Code is too large. Please submit smaller code chunks for better review quality." 
            });
        }

        const response = await aiService(code, language);

        // Check response size
        const responseSize = Buffer.byteLength(response, 'utf8');
        console.log(`Generated review response: ${responseSize} bytes`);

        res.json({ 
            review: response,
            metadata: {
                codeSize,
                responseSize,
                language: language || 'auto',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in code review:', error);
        res.status(500).json({ 
            message: error?.message || "Failed to generate code review. Please try again." 
        });
    }
}