
# Sanskara AI - Hindu Wedding Planning Assistant

A comprehensive wedding planning platform with AI assistance tailored for Hindu weddings.

## Architecture Overview

This project follows a three-tier architecture:

1. **Frontend**: React application with Vite, shadcn/ui, and TailwindCSS
2. **Backend**: Python FastAPI application with AutoGen for AI orchestration
3. **Database**: Supabase (PostgreSQL) for data storage

## API Endpoints

The API is expected to run at http://localhost:8000 (or your custom URL configured via VITE_API_BASE_URL).

The following endpoints need to be implemented in your FastAPI backend:

### Authentication
- All endpoints require a valid Firebase ID token in the Authorization header: `Bearer <token>`

### Chat Endpoints
- `POST /chat` - Send a message to AutoGen-powered AI
  - Request: `{ message: string, session_id?: string, category?: string }`
  - Response: `{ messages: ChatMessage[], session_id: string }`

### Ritual Endpoints
- `GET /rituals/:ritualName` - Get information about a specific ritual
  - Response: RitualInfo object
- `GET /rituals/suggested?tradition=:tradition` - Get suggested rituals for a tradition
  - Response: Array of RitualInfo objects
- `GET /rituals/search?query=:query` - Search for rituals
  - Response: Array of RitualInfo objects

### Vendor Endpoints
- `GET /vendors/recommend` - Get vendor recommendations
  - Query params: category, location, budget
  - Response: Array of Vendor objects
- `GET /vendors/:vendorId` - Get details for a specific vendor
  - Response: Vendor object

### Task Endpoints
- `GET /tasks` - Get all tasks for the current user
  - Response: Array of Task objects
- `POST /tasks` - Create a new task
  - Request: Task object (without id)
  - Response: Created Task object
- `PUT /tasks/:taskId` - Update a task
  - Request: Task object
  - Response: Updated Task object
- `DELETE /tasks/:taskId` - Delete a task
  - Response: 200 OK

## AI Architecture

The AI system uses AutoGen 0.4+ to orchestrate multiple specialized agents:

- **Planner Agent**: Coordinates other agents
- **Vendor Agent**: Handles vendor search and recommendations
- **Ritual Agent**: Provides information about Hindu wedding rituals
- **Booking Agent**: Manages vendor booking process
- **Task Manager Agent**: Handles wedding planning tasks

## Project Setup

### Frontend (React)

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Backend (Python FastAPI)

1. Clone the backend repository (separate from this frontend)
2. Set up a Python environment (Python 3.9+ recommended)
3. Install dependencies:
   ```
   pip install fastapi uvicorn sqlalchemy asyncpg pydantic pyautogen openai firebase-admin python-dotenv
   ```

4. Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   OPENAI_API_KEY=your_openai_api_key
   FIREBASE_CREDENTIALS=path/to/firebase-credentials.json
   ```

5. Run the FastAPI server:
   ```
   uvicorn main:app --reload --port 8000
   ```

### Database (Supabase)

1. Create a Supabase project
2. Run the SQL scripts in `schema.sql` to set up the database schema
3. Set up Row Level Security (RLS) policies
