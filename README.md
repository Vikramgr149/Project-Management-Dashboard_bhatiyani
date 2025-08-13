# Project Management Dashboard

A comprehensive full-stack project management application built with **React**, **FastAPI**, and **MongoDB**. This application provides a complete solution for managing projects, tasks, team members, and analytics with modern web technologies.

![Project Management Dashboard](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop)

## 🚀 Features

### Core Functionality
- **Project Management**: Create, edit, delete, and track projects with status, progress, and team assignments
- **Task Management**: Comprehensive task tracking with priorities, due dates, assignments, and status updates
- **Team Management**: User management with roles and team assignments
- **Analytics Dashboard**: Interactive charts and insights using Chart.js
- **Workflow Visualization**: React Flow-based visual workflow representation
- **AI-Powered Insights**: Intelligent project health analysis and recommendations

### Technical Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data synchronization between frontend and backend
- **RESTful API**: Comprehensive FastAPI backend with full CRUD operations
- **Interactive Charts**: Data visualization with Chart.js and React-ChartJS-2
- **Workflow Diagrams**: Interactive project workflows using React Flow
- **JSON Server Integration**: Mock data integration for team and template data

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks and context
- **TypeScript/JavaScript** - Type-safe development
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router Dom** - Client-side routing
- **React Flow** - Interactive workflow diagrams
- **Chart.js & React-ChartJS-2** - Data visualization
- **Axios** - HTTP client for API communication
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic** - Data validation and serialization
- **Python 3.11+** - Latest Python features
- **CORS Middleware** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Additional Tools
- **JSON Server** - Mock REST API for team data
- **Supervisor** - Process management
- **Docker** - Containerization support

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

### Backend Setup

1. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Set up environment variables**:
```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=project_management
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

3. **Start MongoDB**:
```bash
sudo service mongod start
# or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Run the backend server**:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. **Install Node.js dependencies**:
```bash
cd frontend
yarn install
```

2. **Set up environment variables**:
```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. **Start the development server**:
```bash
yarn start
```

4. **Start JSON Server (for mock data)**:
```bash
yarn json-server
```

## 🔧 Development Setup

### Using Supervisor (Recommended)

The application includes supervisor configuration for running all services:

```bash
# Start all services
sudo supervisorctl start all

# Restart specific service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status
```

### Manual Setup

1. **Start MongoDB**:
```bash
sudo service mongod start
```

2. **Start Backend**:
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

3. **Start Frontend**:
```bash
cd frontend
yarn start
```

4. **Start JSON Server**:
```bash
cd frontend
yarn json-server
```

## 📖 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Authentication
Currently using basic authentication. All endpoints require valid user session.

### Core Endpoints

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### Tasks
- `GET /api/tasks` - Get all tasks (optional: ?project_id=)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Analytics
- `GET /api/analytics/projects` - Get project analytics
- `GET /api/analytics/tasks` - Get task analytics

#### AI Insights
- `GET /api/ai/insights/{project_id}` - Get AI-powered project insights

### Sample API Calls

```bash
# Create a new project
curl -X POST "http://localhost:8001/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web App Redesign",
    "description": "Complete redesign of the company website",
    "status": "planning",
    "owner_id": "user-1",
    "budget": 50000
  }'

# Get project analytics
curl "http://localhost:8001/api/analytics/projects"
```

## 🏗 Project Structure

```
project-management-dashboard/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main application file
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/                  # React frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── Projects.js    # Project management
│   │   │   ├── Tasks.js       # Task management
│   │   │   ├── Analytics.js   # Charts and analytics
│   │   │   ├── WorkflowView.js # React Flow workflows
│   │   │   └── Layout.js      # App layout
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── lib/
│   │   │   └── utils.js       # Utility functions
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   ├── db.json                # JSON Server mock data
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Frontend environment variables
├── tests/                     # Test files
├── scripts/                   # Utility scripts
└── README.md                  # Documentation
```

## 🎯 Usage Guide

### Getting Started

1. **Access the Dashboard**: Navigate to `http://localhost:3000`
2. **Create Your First Project**: Click "New Project" on the dashboard
3. **Add Tasks**: Go to Projects → Select Project → Add Tasks
4. **View Analytics**: Check the Analytics page for insights
5. **Visualize Workflow**: Use the Workflow view for project visualization

### Key Features

#### Dashboard
- Overview of all projects and tasks
- Quick statistics and recent activity
- Navigation to different sections

#### Project Management
- Create projects with details like budget, timeline, and team
- Track project progress automatically based on task completion
- View AI-powered insights and recommendations
- Visual workflow representation

#### Task Management
- Create tasks with priorities, due dates, and assignments
- Filter and search tasks by various criteria
- Track time estimates vs actual time spent
- Update task status with drag-and-drop (in workflow view)

#### Analytics
- Interactive charts showing project and task distributions
- Trend analysis over time
- Performance metrics and KPIs
- Export capabilities for reporting

#### Workflow Visualization
- Interactive React Flow diagrams
- Visual representation of task dependencies
- Drag-and-drop task organization
- Status-based color coding

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=project_management
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### MongoDB Configuration

The application uses MongoDB with the following collections:
- `projects` - Project information
- `tasks` - Task details and assignments
- `users` - User profiles and roles

### JSON Server Configuration

Mock data is served from `frontend/db.json` and includes:
- Team information
- Team member profiles
- Project templates
- Company settings

## 🚀 Deployment

### Production Build

1. **Build Frontend**:
```bash
cd frontend
yarn build
```

2. **Prepare Backend**:
```bash
cd backend
pip install -r requirements.txt
```

3. **Environment Setup**:
- Update environment variables for production
- Configure MongoDB connection
- Set up SSL certificates

### Docker Deployment

```dockerfile
# Example Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Deployment Platforms

The application can be deployed on:
- **Vercel** (Frontend)
- **Heroku** (Backend)
- **Netlify** (Frontend)
- **Railway** (Full-stack)
- **AWS** (Complete infrastructure)

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
yarn test
```

### Integration Testing
- API endpoint testing with Postman/Thunder Client
- E2E testing with Playwright
- Load testing with Apache Bench

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React
- Write unit tests for new features
- Update documentation for API changes
- Use semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API documentation at `http://localhost:8001/docs`

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **React Flow** for workflow visualization capabilities
- **Chart.js** for powerful data visualization
- **FastAPI** for the robust backend framework
- **MongoDB** for flexible data storage

---

**Built with ❤️ using modern web technologies**