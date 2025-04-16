
# Sanskara AI - Hindu Wedding Planning Assistant

A comprehensive wedding planning platform with AI assistance tailored for Hindu weddings.

## Architecture Overview

This project follows a three-tier architecture:

1. **Frontend**: React application with Vite, shadcn/ui, and TailwindCSS
2. **Backend**: Python FastAPI application with AutoGen for AI orchestration
3. **Database**: Supabase (PostgreSQL) for data storage

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
   VITE_API_BASE_URL=your_api_url
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
   uvicorn main:app --reload
   ```

### Database (Supabase)

1. Create a Supabase project
2. Run the SQL scripts in `schema.sql` to set up the database schema
3. Set up Row Level Security (RLS) policies

## Backend Implementation

### Core Components

1. **Authentication Middleware**: Verifies Firebase ID tokens, gets/creates internal user_id from users table
2. **AutoGen Agents**: Set up specialized agents with specific tools and capabilities
3. **API Endpoints**: Connect frontend to backend via RESTful APIs
4. **Database Operations**: Handle CRUD operations for various resources (users, vendors, rituals, etc.)

### API Endpoints

The following API endpoints should be implemented in the Python FastAPI backend:

```
/api/chat - Handle AI conversations via AutoGen
/api/rituals - Get information about Hindu wedding rituals
/api/rituals/suggested - Get suggested rituals based on tradition
/api/rituals/search - Search for rituals
/api/vendors/recommend - Get vendor recommendations
/api/vendors/{vendor_id} - Get details for a specific vendor
/api/tasks - Manage wedding planning tasks
/api/user/vendors - Manage user-tracked vendors
```

## Features

- Chat with AI for wedding planning assistance
- Explore and learn about Hindu wedding rituals
- Find and manage vendors
- Create and track wedding tasks
- Build mood boards
- Manage guest list
- Track budget
- Create wedding timeline
