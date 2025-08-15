# GoalsAI

AI-powered goal planning app with realistic feasibility assessment that helps users achieve dreams through honest guidance and smart planning.

## 🎯 Features

- **AI Feasibility Analysis**: Get honest, realistic assessments of your goals
- **Smart Alternatives**: When goals aren't feasible, get better alternatives that you can actually achieve
- **Goal Planning**: AI-generated step-by-step plans with timelines and costs
- **Progress Tracking**: Visual progress tracking with modern UI
- **Chat Assistant**: Get personalized guidance and advice
- **Google OAuth**: Secure authentication
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: SQLite (dev) with Prisma ORM
- **Authentication**: Google OAuth 2.0
- **AI**: Google Gemini
- **UI**: Framer Motion for animations

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Google OAuth credentials
- Google Gemini API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/engalejandrovargas/GoalsAI.git
cd GoalsAI
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:push
npm run build
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="file:./prisma/dev.db"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_GEMINI_API_KEY="your_gemini_api_key"
SESSION_SECRET="your_session_secret"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:5000"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
```

## 🏃‍♂️ Running the Application

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173

## 📖 API Documentation

### Goals
- `POST /goals/analyze` - Analyze goal feasibility
- `POST /goals` - Create a new goal
- `GET /goals` - Get user's goals
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal

### Planning
- `POST /planning/generate` - Generate AI plan for goal
- `POST /planning/steps` - Create manual goal step
- `GET /planning/:goalId/steps` - Get goal steps

### Chat
- `POST /chat/message` - Send message to AI
- `POST /chat/stream` - Streaming chat response
- `GET /chat/sessions` - Get chat sessions

## 🎨 Key Components

- **GoalCard**: Interactive goal display with progress tracking
- **FeasibilityAnalysisCard**: Detailed AI assessment visualization
- **GoalCreationModal**: Goal creation with AI guidance
- **ChatInterface**: AI chat with streaming responses

## 🔍 Core Features

### Feasibility Analysis
The app provides honest, realistic goal assessment across 5 dimensions:
- Financial feasibility
- Timeline realism
- Skill requirements
- Market conditions
- Personal circumstances

### Smart Alternatives
When goals aren't realistic, the AI suggests better alternatives that maintain the user's core objectives while being actually achievable.

### AI Planning
Generate detailed step-by-step plans with:
- Specific action items
- Time estimates
- Cost breakdowns
- Priority levels
- Resource recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Prisma for database management
- Tailwind CSS for styling
- Framer Motion for animations