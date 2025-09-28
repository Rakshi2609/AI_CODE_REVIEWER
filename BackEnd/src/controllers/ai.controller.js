const aiService = require("../services/ai.service.new")


module.exports.getReview = async (req, res) => {
    try {
        const code = req.body.code;

        if (!code) {
            return res.status(400).json({ message: "Code is required" });
        }

        // Check code size (warn if very large)
        const codeSize = Buffer.byteLength(code, 'utf8');
        console.log(`Processing code review for ${codeSize} bytes`);
        
        if (codeSize > 5 * 1024 * 1024) { // 5MB limit
            return res.status(413).json({ 
                message: "Code is too large. Please submit smaller code chunks for better review quality." 
            });
        }

        const response = await aiService(code);

        // Check response size
        const responseSize = Buffer.byteLength(response, 'utf8');
        console.log(`Generated review response: ${responseSize} bytes`);

        res.json({ 
            review: response,
            metadata: {
                codeSize,
                responseSize,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in code review:', error);
        res.status(500).json({ 
            message: "Failed to generate code review. Please try again." 
        });
    }
}