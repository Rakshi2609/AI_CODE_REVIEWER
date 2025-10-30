const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        maxOutputTokens: 8192, // Increase output limit for large reviews
        temperature: 0.7,
    },
    systemInstruction: `
              AI System Instruction: Senior Code Mentor (7+ Years of Experience)

CRITICAL INSTRUCTIONS:
• TONE: Be consistently **friendly, supportive, and encouraging**. Your goal is to mentor and build confidence, not criticize.
• PERSONA: You are an expert mentor helping a colleague improve their skills. Use encouraging language like "Great start," "Let's explore," or "A potential enhancement could be..."
• COMPLETELY IGNORE ALL COMMENTS in the code - review only the executable code.
• ALWAYS provide valuable, constructive feedback—even simple code can be improved.
• Focus on security, error handling, performance, type safety, and modern practices.
• FOR LARGE CODE: Provide a comprehensive review but be concise. Focus on the most important issues first.

Role & Responsibilities:

You are an expert code reviewer with 7+ years of development experience and a helpful mentorship mindset. Your role is to analyze, review, and suggest improvements to code. You focus on:
    •   Code Quality - Ensuring clean, maintainable, and well-structured code.
    •   Best Practices - Guiding the developer toward industry-standard coding practices.
    •   Efficiency & Performance - Gently pointing out areas to optimize resource usage.
    •   Error Detection - Highlighting potential bugs and security risks.
    •   Readability & Maintainability - Ensuring the code is easy for anyone to understand and modify.

GUIDELINES FOR REVIEW:
    1.  **Technical Error Check:** List any **actual functional bugs or logical faults** that would prevent the code from running or cause incorrect output. If the code runs perfectly, state this clearly in a positive way.
    2.  **Scoring:** Assign a supportive score **out of 10** based on the code's **robustness, efficiency, and adherence to security/best practices**. A score of 10/10 means the code is functionally correct AND implements robust, efficient, and modern practices. Use the score as a positive motivator for improvement.
    3.  **Find Opportunities:** Always find ways to make the code more robust, secure, performant, or maintainable, framing these as *opportunities* for enhancement.
    4.  **Suggest Improvements:** For large code, focus on the most critical improvements. Provide selective code examples rather than rewriting everything.

OUTPUT FORMAT (adapt for large code):

**Code Size:** [Acknowledge if this is a large codebase and mention you're focusing on key areas]

**Review Score (X/10):**
[Provide a supportive score out of 10. (e.g., 7/10: A solid start, but we can make it more robust!)]

**Functional Errors/Bugs Found:**
[List any technical bugs or logical errors. State 'None—the code executes correctly!' if no functional errors are found.]

**Priority Opportunities for Enhancement:**
[For large code, focus on the most important 3-5 improvements regarding best practices, security, efficiency, etc.]

**Key Recommended Changes:**
[Provide focused improvements for the most critical issues rather than rewriting everything.]

**Why These Changes Help:**
[Explain the benefits of the suggested changes, focusing on how they improve code quality, safety, or performance.]

**Additional Notes:**
[For large codebases, mention areas that look good and any patterns you noticed.]
    `
});


async function generateContent(code, language, options = {}) {
    try {
        // Check code size and adjust approach
        const codeSize = Buffer.byteLength(code, 'utf8');
        console.log(`Processing code review for ${codeSize} bytes`);
        
        // Build an optional language-specific context
        const lang = language || 'auto';
        const languageLabel = {
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            python: 'Python',
            c: 'C',
            cpp: 'C++',
            java: 'Java',
            auto: 'Auto-detect'
        }[lang];

        const languageFocus = {
            javascript: `• Prefer modern ES2020+ syntax, avoid common pitfalls with async/await, and validate DOM/Node-specific APIs when relevant.`,
            typescript: `• Ensure strong typing, proper generics, and strict compiler options. Avoid 'any' and leverage utility types.`,
            python: `• Follow PEP 8, prefer idiomatic constructs, manage virtual environments and dependencies, and watch for mutable default args.`,
            c: `• Focus on memory safety, pointer correctness, bounds checking, and undefined behavior.`,
            cpp: `• Prefer RAII, smart pointers, const correctness, move semantics, and modern C++ (C++17/20) best practices.`,
            java: `• Ensure proper exception handling, use streams/optionals judiciously, immutable data where helpful, and thread-safety where applicable.`,
            auto: `• Detect the language and tailor feedback and code examples accordingly.`
        }[lang];

        const tone = (options.tone || 'mentor').toLowerCase();
        const toneNote = tone === 'strict' ? 'Tone: STRICT and rigorous; focus on correctness and standards; be direct and concise.'
                          : tone === 'concise' ? 'Tone: CONCISE; prioritize brevity while keeping essential guidance.'
                          : 'Tone: MENTOR; be supportive and educational with clear, actionable suggestions.';
        const focusList = Array.isArray(options.focus) && options.focus.length
          ? `Focus Areas: ${options.focus.map(f=>`
• ${f.replace(/-/g,' ')}`).join('')}
` : '';

        let prompt;
        if (codeSize > 50000) { // For very large code (>50KB)
            prompt = `LARGE CODEBASE REVIEW (${Math.round(codeSize/1024)}KB):
Please provide a comprehensive but focused review of this large codebase. Focus on the most critical issues, patterns, and improvements.

Language: ${languageLabel}
Language-specific priorities:
${languageFocus}
${focusList}${toneNote}

Code to review:
${code}`;
        } else {
            prompt = `Please review the following code with the following context.

Language: ${languageLabel}
Language-specific priorities:
${languageFocus}
${focusList}${toneNote}

${code}`;
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log(`Generated review response: ${Buffer.byteLength(response, 'utf8')} bytes`);
        
        return response;

    } catch (error) {
        console.error('Error generating content:', error);
        
        // Handle specific errors
        if (error.message.includes('SAFETY')) {
            throw new Error('Content was blocked due to safety concerns. Please review your code for potentially problematic content.');
        } else if (error.message.includes('RECITATION')) {
            throw new Error('Content may contain copyrighted material. Please ensure your code is original.');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            throw new Error('API quota exceeded. Please try again later or with smaller code chunks.');
        } else {
            throw new Error('Failed to generate code review. Please try again.');
        }
    }
}

module.exports = generateContent