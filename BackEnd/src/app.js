const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const cors = require('cors')

const app = express()

// Define the origins based on the environment variables
// The CORS_ORIGIN should be set to the Vercel URL in production (Render)
// and localhost in development.
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// CORS configuration for deployment
const corsOptions = {
    // CRITICAL FIX: Use the configured allowedOrigin variable
    origin: allowedOrigin,
    credentials: true,
    optionsSuccessStatus: 200
}

// Log the allowed origin for debugging purposes on the server console
console.log(`CORS Policy: Allowing requests from origin: ${allowedOrigin}`);

app.use(cors(corsOptions))

// Increase payload limits for large code submissions
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Add timeout for long-running AI requests
app.use((req, res, next) => {
    // Set timeout to 5 minutes for AI processing
    req.setTimeout(300000);
    res.setTimeout(300000);
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/ai', aiRoutes)

module.exports = app
