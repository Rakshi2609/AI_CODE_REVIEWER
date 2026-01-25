# Frontend

This folder contains the frontend code for the AI Code Reviewer project.

## Structure
- `package.json`: Frontend dependencies and scripts
- `index.html`: Main HTML file
- `vite.config.js`: Vite configuration
- `.env`: Environment variables configuration (create from .env.example)
- `.env.example`: Example environment variables template
- `src/`: Source code
  - `App.jsx`: Main React component
  - `main.jsx`: Entry point for React
  - `assets/`: Static assets

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

Edit the `.env` file if needed (default values work for local development):

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for production:
```sh
npm run build
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | No | http://localhost:3000 |

**Note**: For production deployment, update `VITE_API_BASE_URL` to your deployed backend URL.

## Technology Stack

- **React**: UI library
- **Vite**: Build tool and dev server for fast development
- **HMR**: Hot Module Replacement for instant updates during development

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Notes
- Uses Vite for fast development with Hot Module Replacement (HMR)
- Configured with ESLint for code quality
- For production, ensure backend URL is properly configured in `.env`
