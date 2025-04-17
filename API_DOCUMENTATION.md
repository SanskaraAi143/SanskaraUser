
# Sanskara AI: API Documentation

This document outlines the API endpoints and implementation details required for the Sanskara AI wedding planning platform.

## Authentication

All API endpoints should require authentication using a JWT token obtained from Supabase.

### Authentication Flow

1. Users authenticate through Supabase (email/password or OAuth)
2. Frontend obtains Supabase JWT token
3. Token is included in API requests as Authorization header

```typescript
// Example of adding auth token to requests
const makeAuthenticatedRequest = async (endpoint, method = 'GET', data = null) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
  
  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  };
  
  return fetch(`${API_BASE_URL}${endpoint}`, options).then(res => res.json());
};
```

## API Endpoints

### User Profile

**GET /api/users/me**
- Returns the authenticated user's profile
- Response: User profile object

**PUT /api/users/me**
- Updates user profile information
- Request Body: Updated user fields
- Response: Updated user profile

### Tasks

**GET /api/tasks**
- Returns all tasks for the authenticated user
- Query Params: `is_complete` (optional, filter by completion status)
- Response: Array of task objects

**POST /api/tasks**
- Creates a new task
- Request Body: Task details (description, due_date, category)
- Response: Created task object

**PUT /api/tasks/:task_id**
- Updates an existing task
- Request Body: Updated task fields
- Response: Updated task object

**DELETE /api/tasks/:task_id**
- Deletes a task
- Response: Success message

### Budget Items

**GET /api/budget/items**
- Returns all budget items for the authenticated user
- Query Params: `category` (optional)
- Response: Array of budget item objects

**POST /api/budget/items**
- Creates a new budget item
- Request Body: Budget item details (item_name, category, amount, vendor_name, status)
- Response: Created budget item object

**PUT /api/budget/items/:item_id**
- Updates an existing budget item
- Request Body: Updated budget item fields
- Response: Updated budget item object

**DELETE /api/budget/items/:item_id**
- Deletes a budget item
- Response: Success message

**GET /api/budget/summary**
- Returns budget summary statistics
- Response: Budget summary object (total, spent, remaining, category breakdown)

### Guest List

**GET /api/guests**
- Returns all guests for the authenticated user
- Query Params: `status` (optional)
- Response: Array of guest objects

**POST /api/guests**
- Creates a new guest entry
- Request Body: Guest details (guest_name, contact_info, relation, side, status, dietary_requirements)
- Response: Created guest object

**PUT /api/guests/:guest_id**
- Updates an existing guest
- Request Body: Updated guest fields
- Response: Updated guest object

**DELETE /api/guests/:guest_id**
- Deletes a guest
- Response: Success message

**GET /api/guests/summary**
- Returns guest list summary statistics
- Response: Guest summary object (total, confirmed, declined, pending counts)

### Timeline

**GET /api/timeline/events**
- Returns all timeline events for the authenticated user
- Response: Array of event objects

**POST /api/timeline/events**
- Creates a new timeline event
- Request Body: Event details (event_name, event_date_time, location, description)
- Response: Created event object

**PUT /api/timeline/events/:event_id**
- Updates an existing event
- Request Body: Updated event fields
- Response: Updated event object

**DELETE /api/timeline/events/:event_id**
- Deletes an event
- Response: Success message

### User Vendors

**GET /api/user-vendors**
- Returns all user-tracked vendors
- Query Params: `category` (optional), `status` (optional)
- Response: Array of user vendor objects

**POST /api/user-vendors**
- Creates a new user vendor entry
- Request Body: Vendor details (vendor_name, vendor_category, contact_info, status, notes, linked_vendor_id)
- Response: Created user vendor object

**PUT /api/user-vendors/:user_vendor_id**
- Updates an existing user vendor
- Request Body: Updated user vendor fields
- Response: Updated user vendor object

**DELETE /api/user-vendors/:user_vendor_id**
- Deletes a user vendor
- Response: Success message

### Global Vendors

**GET /api/vendors**
- Returns vendors from the global directory
- Query Params: `category` (optional), `location_city` (optional), `name_query` (optional)
- Response: Array of vendor objects

**GET /api/vendors/:vendor_id**
- Returns details for a specific vendor
- Response: Vendor object

### Mood Boards

**GET /api/moodboards**
- Returns all mood boards for the authenticated user
- Response: Array of mood board objects

**POST /api/moodboards**
- Creates a new mood board
- Request Body: Mood board details (name, description)
- Response: Created mood board object

**GET /api/moodboards/:mood_board_id**
- Returns details for a specific mood board
- Response: Mood board object

**PUT /api/moodboards/:mood_board_id**
- Updates an existing mood board
- Request Body: Updated mood board fields
- Response: Updated mood board object

**GET /api/moodboards/:mood_board_id/items**
- Returns all items in a specific mood board
- Response: Array of mood board item objects

**POST /api/moodboards/:mood_board_id/items**
- Adds a new item to a mood board
- Request Body: Item details (image_url, note, category)
- Response: Created mood board item object

**DELETE /api/moodboards/items/:item_id**
- Deletes a mood board item
- Response: Success message

**POST /api/moodboards/items/upload-url**
- Gets a presigned URL for direct upload to storage
- Request Body: Upload details (file_name, content_type)
- Response: Presigned URL object

### Chat

**POST /api/chat**
- Sends a message to the AI assistant
- Request Body: Message text and optional session ID
- Response: AI response messages and session ID

**GET /api/chat/sessions**
- Returns all chat sessions for the authenticated user
- Response: Array of chat session objects

**GET /api/chat/sessions/:session_id/messages**
- Returns all messages in a specific chat session
- Response: Array of chat message objects

## Type Definitions

Here are the TypeScript interfaces for the main data models:

```typescript
// User Profile
interface User {
  id: string;
  email: string;
  display_name?: string;
  wedding_date?: Date;
  wedding_location?: string;
  wedding_tradition?: string;
  preferences?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Task
interface Task {
  id: string;
  user_id: string;
  description: string;
  is_complete: boolean;
  due_date?: Date;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

// Budget Item
interface BudgetItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  amount: number;
  vendor_name?: string;
  status: 'Pending' | 'Paid';
  created_at: Date;
  updated_at: Date;
}

// Guest
interface Guest {
  id: string;
  user_id: string;
  guest_name: string;
  contact_info?: string;
  relation?: string;
  side?: 'Groom' | 'Bride' | 'Both';
  status: 'Pending' | 'Invited' | 'Confirmed' | 'Declined';
  dietary_requirements?: string;
  created_at: Date;
  updated_at: Date;
}

// Timeline Event
interface TimelineEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_date_time: Date;
  location?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// User Vendor
interface UserVendor {
  id: string;
  user_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_info?: string;
  status: 'contacted' | 'booked' | 'confirmed' | 'pending';
  booked_date?: Date;
  notes?: string;
  linked_vendor_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Vendor
interface Vendor {
  id: string;
  vendor_name: string;
  vendor_category: string;
  contact_email?: string;
  phone_number?: string;
  website_url?: string;
  address?: Record<string, any>;
  pricing_range?: Record<string, any>;
  rating?: number;
  description?: string;
  portfolio_image_urls?: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Mood Board
interface MoodBoard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Mood Board Item
interface MoodBoardItem {
  id: string;
  mood_board_id: string;
  image_url: string;
  note?: string;
  category?: string;
  created_at: Date;
}

// Chat Message
interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'assistant' | 'system' | 'tool';
  sender_name: string;
  content: Record<string, any>;
  timestamp: Date;
}

// Chat Session
interface ChatSession {
  id: string;
  user_id: string;
  created_at: Date;
  last_updated_at: Date;
  summary?: string;
}
```

## Implementation Notes

### Backend Authentication with Supabase

To verify Supabase JWT tokens on the backend:

```python
# Python/FastAPI example with supabase-py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

app = FastAPI()
security = HTTPBearer()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Verify the JWT token
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/api/users/me")
async def get_user_profile(user = Depends(get_current_user)):
    # Access user.id to get the Supabase user ID
    # Query your database to get the full user profile
    return {"message": "User profile data"}
```

### Frontend API Integration

Example of a React hook to fetch tasks:

```typescript
// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/config';
import { API_BASE_URL } from '@/services/api';

export const useTasks = (isComplete?: boolean) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No active session');
        }
        
        const url = new URL(`${API_BASE_URL}/api/tasks`);
        if (isComplete !== undefined) {
          url.searchParams.append('is_complete', isComplete.toString());
        }
        
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [isComplete]);

  return { tasks, isLoading, error };
};
```

## Required Environment Variables

For the application to function properly, the following environment variables should be set:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (client-side)
- `VITE_API_BASE_URL`: Base URL for your backend API

On the backend, additional variables needed:

- `SUPABASE_URL`: Same as frontend
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (keep secret, server-side only)
- `JWT_SECRET`: The JWT secret from Supabase
