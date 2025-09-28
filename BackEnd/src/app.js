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


app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/ai', aiRoutes)

module.exports = app
