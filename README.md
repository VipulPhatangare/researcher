# Multi-Phase AI Research Platform - Phase 1

A comprehensive research automation platform with AI-powered prompt enhancement, built with React and Node.js.

## 🎯 Project Overview

This is **Phase 1** of a multi-phase research platform that automates the research pipeline. Phase 1 focuses on:
- Problem statement submission (minimum 30 words)
- Automatic prompt enhancement via n8n workflow
- Unique chat ID generation for session tracking
- MongoDB storage of original and enhanced inputs
- Real-time dashboard updates

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Server**: `server.js` - Main Express server
- **Database**: MongoDB Atlas with Mongoose ODM
- **API Routes**: RESTful endpoints for research management
- **n8n Integration**: Webhook service for prompt enhancement
- **Error Handling**: Comprehensive error middleware

### Frontend (React)
- **ResearchForm**: Input form with 30-word validation
- **Dashboard**: Real-time session monitoring with auto-polling
- **SessionList**: Paginated view of all research sessions
- **API Service**: Centralized fetch utilities

## 📁 Project Structure

```
Reseracher/
├── server.js                    # Express server entry point
├── package.json                 # Backend dependencies
├── .env                         # Environment variables (create from .env.example)
├── .env.example                 # Template for environment configuration
├── config/
│   └── database.js              # MongoDB connection setup
├── models/
│   └── ResearchSession.model.js # Mongoose schema for sessions
├── controllers/
│   └── research.controller.js   # Business logic for research endpoints
├── routes/
│   └── research.routes.js       # API route definitions
├── services/
│   └── n8n.service.js           # n8n webhook integration
├── middleware/
│   └── errorHandler.js          # Global error handling
└── client/                      # React frontend
    ├── package.json             # Frontend dependencies
    ├── .env                     # Frontend environment variables
    ├── public/
    └── src/
        ├── App.js               # Main React component
        ├── App.css              # Main styles
        ├── services/
        │   └── api.js           # API client utilities
        └── components/
            ├── ResearchForm.js  # Problem statement input form
            ├── ResearchForm.css
            ├── Dashboard.js     # Session monitoring dashboard
            ├── Dashboard.css
            ├── SessionList.js   # All sessions view
            └── SessionList.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (or local MongoDB)
- n8n instance with webhook endpoint

### Installation

1. **Clone and navigate to project**
```powershell
cd "c:\Users\vipul\OneDrive\Desktop\web dev\Collage projects\Reseracher"
```

2. **Install backend dependencies**
```powershell
npm install
```

3. **Install frontend dependencies**
```powershell
cd client
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` in the root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/researcher?retryWrites=true&w=majority
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/prompt-enhancer
PORT=5000
NODE_ENV=development
```

5. **Start the development servers**

Option 1 - Run both simultaneously:
```powershell
npm run dev:full
```

Option 2 - Run separately:

Terminal 1 (Backend):
```powershell
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd client
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 📡 API Endpoints

### POST `/api/research/initiate`
Initiates Phase 1 with problem statement submission.

**Request Body:**
```json
{
  "problemStatement": "Your research problem (minimum 30 words)...",
  "metadata": {
    "additionalInfo": "optional"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Research session initiated...",
  "data": {
    "chatId": "unique-uuid-v4",
    "originalInput": "...",
    "currentPhase": 1,
    "status": "processing",
    "progress": 10
  }
}
```

### GET `/api/research/status/:chatId`
Get current status of a research session.

**Response:**
```json
{
  "success": true,
  "data": {
    "chatId": "...",
    "currentPhase": 1,
    "overallStatus": "processing",
    "progress": 33,
    "phase1Status": "completed",
    "enhancedInput": "Enhanced prompt from n8n..."
  }
}
```

### GET `/api/research/session/:chatId`
Get full details of a research session.

### GET `/api/research/sessions?page=1&limit=10`
Get all sessions with pagination.

## 🔧 n8n Webhook Configuration

Your n8n workflow should:

1. **Accept POST requests** with this payload:
```json
{
  "chatId": "unique-id",
  "originalInput": "problem statement",
  "timestamp": "ISO-8601",
  "phase": 1,
  "action": "enhance_prompt"
}
```

2. **Return enhanced prompt**:
```json
{
  "enhancedPrompt": "AI-enhanced version of the problem statement",
  "confidence": 0.95,
  "suggestions": []
}
```

3. **Webhook URL Format**: 
```
https://your-n8n-instance.app.n8n.cloud/webhook/prompt-enhancer
```

## 🎨 Features

### Phase 1 Features
✅ Problem statement validation (30-word minimum)  
✅ Unique chat ID generation (UUID v4)  
✅ n8n webhook integration for prompt enhancement  
✅ MongoDB storage (original + enhanced inputs)  
✅ Real-time dashboard with auto-polling  
✅ Session history with pagination  
✅ Progress tracking (0-100%)  
✅ Error handling and retry mechanisms  
✅ Responsive design for mobile/desktop  

### Upcoming Phases
🔜 Phase 2: Research Discovery (Domain identification, paper retrieval)  
🔜 Phase 3: Analysis & Synthesis (Paper analysis, solution generation)  
🔜 Phase 4+: Advanced analytics, knowledge graphs, etc.

## 📊 Database Schema

### ResearchSession Model
```javascript
{
  chatId: String (unique, indexed),
  originalInput: String (min 30 chars),
  enhancedInput: String,
  phases: {
    phase1: {
      status: 'pending' | 'processing' | 'completed' | 'failed',
      startedAt: Date,
      completedAt: Date,
      n8nWebhookSent: Boolean,
      n8nResponse: Object
    },
    phase2: { ... },
    phase3: { ... }
  },
  currentPhase: Number,
  overallStatus: String,
  progress: Number (0-100),
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Development

### Running Tests
```powershell
npm test
```

### Code Quality
```powershell
npm run lint
```

### Building for Production

Backend:
```powershell
npm start
```

Frontend:
```powershell
cd client
npm run build
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your IP

### n8n Webhook Errors
- Verify `N8N_WEBHOOK_URL` is correct
- Test webhook endpoint manually
- Check n8n workflow is active
- Review n8n logs for errors

### CORS Issues
- Backend includes CORS middleware
- Check `REACT_APP_API_URL` in `client/.env`
- Ensure ports don't conflict

### React App Not Starting
- Clear node_modules: `rm -rf node_modules; npm install`
- Clear cache: `npm cache clean --force`
- Check port 3000 is available

## 📝 Environment Variables

### Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| MONGODB_URI | MongoDB connection string | Yes | - |
| N8N_WEBHOOK_URL | n8n webhook endpoint | Yes | - |
| PORT | Server port | No | 5000 |
| NODE_ENV | Environment mode | No | development |

### Frontend (client/.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| REACT_APP_API_URL | Backend API URL | No | http://localhost:5000/api |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for your research automation needs!

## 🙏 Acknowledgments

- OpenAI for GPT models
- n8n for workflow automation
- MongoDB Atlas for database hosting
- React and Express.js communities

## 📞 Support

For issues or questions:
1. Check this README thoroughly
2. Review error logs in terminal
3. Test API endpoints with Postman
4. Verify n8n webhook is responding

---

**Built with ❤️ for automated research workflows**
