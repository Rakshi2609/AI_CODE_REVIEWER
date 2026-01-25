# BackEnd

This folder contains the backend code for the project.

## Structure
- `package.json`: Node.js dependencies and scripts
- `server.js`: Entry point for the backend server
- `.env`: Environment variables configuration (create from .env.example)
- `.env.example`: Example environment variables template
- `src/`: Source code
  - `app.js`: Main app configuration
  - `controllers/`: Controller logic
  - `routes/`: API route definitions
  - `services/`: Service layer for business logic

## Getting Started

### 1. Install dependencies:
```sh
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from the example template:
```sh
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
# Google Gemini AI API Key (Required)
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_KEY=your_gemini_api_key_here

# Server Port (Optional, defaults to 3000)
PORT=3000

# CORS Configuration (Optional)
CORS_ORIGIN=http://localhost:5173

# Node Environment (Optional)
NODE_ENV=development
```

### 3. Start the server:
```sh
npm start
```

For development with hot reload:
```sh
npm run dev
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_GEMINI_KEY` | Google Gemini AI API key for code review functionality | ✅ Yes | - |
| `PORT` | Port number for the server | No | 3000 |
| `CORS_ORIGIN` | Allowed origin for CORS requests (frontend URL) | No | http://localhost:5173 |
| `NODE_ENV` | Environment mode (development, production, test) | No | development |

## API Endpoints

- `GET /` - Health check endpoint
- `POST /ai/review` - Submit code for AI review
- `POST /ai/fix` - Get code fix suggestions

## Notes
- Ensure all environment variables are properly configured before starting the server
- The GOOGLE_GEMINI_KEY is required for the AI functionality to work
- For production deployment, update CORS_ORIGIN to match your frontend domain
- See individual files in `src/` for more implementation details