# AI Code Reviewer

An intelligent code review application that leverages AI to analyze and provide feedback on code quality, best practices, and potential improvements.

## Overview

This application consists of a backend API service and a frontend web interface that work together to provide automated code review capabilities using artificial intelligence.

## Architecture

```
AI_CODE_REVIEWER/
├── BackEnd/           # Node.js backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   └── server.js
├── Frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   └── assets/
│   └── index.html
└── README.md         # This file
```

## Features

- 🤖 **AI-Powered Analysis**: Automated code review using advanced AI models
- 📊 **Quality Metrics**: Comprehensive code quality assessment
- 🔍 **Best Practices**: Suggestions for coding standards and best practices
- 🚀 **Fast Processing**: Quick analysis and feedback generation
- 💻 **Modern UI**: Clean, responsive web interface

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rakshi2609/AI_CODE_REVIEWER.git
   cd AI_CODE_REVIEWER
   ```

2. **Setup Backend**
   ```bash
   cd BackEnd
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env and add your Google Gemini API key
   # GOOGLE_GEMINI_KEY=your_actual_api_key_here
   
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # The default values should work for local development
   
   npm run dev
   ```

4. **Access the application**
   - Backend API: `http://localhost:3000` (or configured port)
   - Frontend UI: `http://localhost:5173` (default Vite port)

## Environment Variables

### Backend Variables (BackEnd/.env)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_GEMINI_KEY` | Google Gemini AI API key | - | ✅ Yes |
| `PORT` | Server port | 3000 | No |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:5173 | No |
| `NODE_ENV` | Environment mode | development | No |

### Frontend Variables (Frontend/.env)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | http://localhost:3000 | No |

**Note**: For production deployment, update `CORS_ORIGIN` in backend and `VITE_API_BASE_URL` in frontend to your actual domain URLs.

## Project Structure

### Backend (`/BackEnd`)
- **API Server**: Express.js based REST API
- **AI Integration**: Service layer for AI model communication
- **Controllers**: Request handling and response formatting
- **Routes**: API endpoint definitions

### Frontend (`/Frontend`)
- **React Application**: Modern React with Vite
- **Responsive Design**: Mobile-friendly interface
- **State Management**: Efficient state handling
- **Component Architecture**: Modular and reusable components

## Usage

1. **Upload Code**: Submit your code files through the web interface
2. **AI Analysis**: The system processes your code using AI models
3. **Review Results**: Get detailed feedback and suggestions
4. **Apply Improvements**: Implement recommended changes

## Development

### Backend Development
```bash
cd BackEnd
npm run dev  # Start with nodemon for hot reload
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Start Vite dev server
```

### Building for Production
```bash
# Backend
cd BackEnd
npm run build

# Frontend
cd Frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Technology Stack

**Backend:**
- Node.js
- Express.js
- AI/ML Integration

**Frontend:**
- React
- Vite
- Modern JavaScript/JSX

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [your-email@example.com] or create an issue in the GitHub repository.

## Roadmap

- [ ] Enhanced AI model integration
- [ ] Support for more programming languages
- [ ] Advanced code metrics
- [ ] Team collaboration features
- [ ] CI/CD integration

---

**Made with ❤️ by [Rakshi2609](https://github.com/Rakshi2609)**