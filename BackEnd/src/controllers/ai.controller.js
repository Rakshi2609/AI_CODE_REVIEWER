const aiService = require("../services/ai.service.new")
const aiFixService = require("../services/ai.fix.service")

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
        // Optional review options
        const tone = (req.body.tone || '').toString().toLowerCase();
        const focus = Array.isArray(req.body.focus) ? req.body.focus.map(f=>String(f).toLowerCase()) : [];

        if (!code) {
            return res.status(400).json({ message: "Code is required" });
        }

        // Validate language if provided
        const allowed = [null, 'javascript', 'typescript', 'python', 'c', 'cpp', 'java'];
        if (!allowed.includes(language)) {
            return res.status(400).json({ message: "Unsupported language. Use one of: python, javascript, typescript, c, cpp, java." });
        }
        const allowedTones = ['', 'mentor', 'strict', 'concise'];
        if (!allowedTones.includes(tone)) {
            return res.status(400).json({ message: "Unsupported tone. Use one of: mentor, strict, concise." });
        }
        const allowedFocus = new Set(['security','performance','readability','error-handling','type-safety','best-practices']);
        const invalid = focus.filter(f=>!allowedFocus.has(f));
        if (invalid.length) {
            return res.status(400).json({ message: `Unsupported focus: ${invalid.join(', ')}.` });
        }

        // Check code size (warn if very large)
        const codeSize = Buffer.byteLength(code, 'utf8');
        console.log(`Processing code review for ${codeSize} bytes`);
        
        if (codeSize > 5 * 1024 * 1024) { // 5MB limit
            return res.status(413).json({ 
                message: "Code is too large. Please submit smaller code chunks for better review quality." 
            });
        }

    const response = await aiService(code, language, { tone, focus });

        // Check response size
        const responseSize = Buffer.byteLength(response, 'utf8');
        console.log(`Generated review response: ${responseSize} bytes`);

        res.json({ 
            review: response,
            metadata: {
                codeSize,
                responseSize,
                language: language || 'auto',
                tone: tone || 'mentor',
                focus,
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

module.exports.getFix = async (req, res) => {
    try {
        const code = req.body.code;
        const language = normalizeLanguage(req.params.language || req.body.language);
        const tone = (req.body.tone || '').toString().toLowerCase();
        const focus = Array.isArray(req.body.focus) ? req.body.focus.map(f=>String(f).toLowerCase()) : [];

        if (!code) return res.status(400).json({ message: "Code is required" });

        const allowed = [null, 'javascript', 'typescript', 'python', 'c', 'cpp', 'java'];
        if (!allowed.includes(language)) return res.status(400).json({ message: "Unsupported language. Use one of: python, javascript, typescript, c, cpp, java." });

        const codeSize = Buffer.byteLength(code, 'utf8');
        if (codeSize > 5 * 1024 * 1024) return res.status(413).json({ message: "Code is too large. Please submit a smaller snippet." });

        const fix = await aiFixService(code, language, { tone, focus });

        res.json({ 
            fix,
            metadata: { codeSize, language: language || 'auto', tone: tone || 'mentor', focus, timestamp: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Error getting AI fix:', error);
        res.status(500).json({ message: error?.message || 'Failed to generate fix. Please try again.' })
    }
}