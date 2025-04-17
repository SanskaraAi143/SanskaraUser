
# Sanskara AI API Documentation

This document details the backend API endpoints for Sanskara AI's frontend-backend communication. All endpoints require authentication with a Supabase JWT token included in the Authorization header.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All API requests must include a Supabase JWT in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

The backend will verify this token with Supabase Auth and extract the user ID.

## API Endpoints

### Authentication

Authentication is handled via Supabase Authentication. The frontend uses the Supabase JavaScript client for:
- Email/password sign-up and sign-in
- OAuth authentication (Google)
- Password resets
- JWT token management

### Chat

#### Create Message / Get Response

- **URL**: `/chat`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "message": "string",
    "session_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "messages": [
      {
        "content": {
          "text": "string",
          "type": "text"
        },
        "sender_name": "string",
        "sender_type": "assistant|user|system|tool"
      }
    ],
    "session_id": "uuid"
  }
  ```

#### Get Chat Sessions

- **URL**: `/chat/sessions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "session_id": "uuid",
      "created_at": "timestamp",
      "last_updated_at": "timestamp",
      "summary": "string"
    }
  ]
  ```

#### Get Session Messages

- **URL**: `/chat/sessions/{session_id}/messages`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "message_id": "uuid",
      "sender_type": "string",
      "sender_name": "string",
      "content": "object",
      "timestamp": "timestamp"
    }
  ]
  ```

### User Profile

#### Get User Profile

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "user_id": "uuid",
    "email": "string",
    "display_name": "string",
    "wedding_date": "date",
    "wedding_location": "string",
    "wedding_tradition": "string",
    "preferences": "object"
  }
  ```

#### Update User Profile

- **URL**: `/users/me`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "display_name": "string",
    "wedding_date": "date",
    "wedding_location": "string",
    "wedding_tradition": "string",
    "preferences": "object"
  }
  ```
- **Response**: Updated user profile

### Tasks

#### Get Tasks

- **URL**: `/tasks`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `is_complete` (optional, boolean)
- **Response**:
  ```json
  [
    {
      "task_id": "uuid",
      "description": "string",
      "is_complete": "boolean",
      "due_date": "date",
      "category": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create Task

- **URL**: `/tasks`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "description": "string",
    "due_date": "date",
    "category": "string"
  }
  ```
- **Response**: Created task object

#### Get Task by ID

- **URL**: `/tasks/{task_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Task object

#### Update Task

- **URL**: `/tasks/{task_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "description": "string",
    "is_complete": "boolean",
    "due_date": "date",
    "category": "string"
  }
  ```
- **Response**: Updated task object

#### Delete Task

- **URL**: `/tasks/{task_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

### Budget Items

#### Get Budget Items

- **URL**: `/budget/items`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `category` (optional, string)
- **Response**:
  ```json
  [
    {
      "item_id": "uuid",
      "item_name": "string",
      "category": "string",
      "amount": "decimal",
      "vendor_name": "string",
      "status": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create Budget Item

- **URL**: `/budget/items`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "item_name": "string",
    "category": "string",
    "amount": "decimal",
    "vendor_name": "string",
    "status": "string"
  }
  ```
- **Response**: Created budget item object

#### Get Budget Item by ID

- **URL**: `/budget/items/{item_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Budget item object

#### Update Budget Item

- **URL**: `/budget/items/{item_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "item_name": "string",
    "category": "string",
    "amount": "decimal",
    "vendor_name": "string",
    "status": "string"
  }
  ```
- **Response**: Updated budget item object

#### Delete Budget Item

- **URL**: `/budget/items/{item_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

#### Get Budget Summary

- **URL**: `/budget/summary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "total": "decimal",
    "spent": "decimal",
    "remaining": "decimal",
    "categories": [
      {
        "category": "string",
        "amount": "decimal"
      }
    ]
  }
  ```

### Guest List

#### Get Guests

- **URL**: `/guests`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `status` (optional, string)
- **Response**:
  ```json
  [
    {
      "guest_id": "uuid",
      "guest_name": "string",
      "contact_info": "string",
      "relation": "string",
      "side": "string",
      "status": "string",
      "dietary_requirements": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create Guest

- **URL**: `/guests`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "guest_name": "string",
    "contact_info": "string",
    "relation": "string",
    "side": "string",
    "status": "string",
    "dietary_requirements": "string"
  }
  ```
- **Response**: Created guest object

#### Get Guest by ID

- **URL**: `/guests/{guest_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Guest object

#### Update Guest

- **URL**: `/guests/{guest_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "guest_name": "string",
    "contact_info": "string",
    "relation": "string",
    "side": "string",
    "status": "string",
    "dietary_requirements": "string"
  }
  ```
- **Response**: Updated guest object

#### Delete Guest

- **URL**: `/guests/{guest_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

#### Get Guest Summary

- **URL**: `/guests/summary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "total": "integer",
    "confirmed": "integer",
    "declined": "integer",
    "pending": "integer"
  }
  ```

### Timeline

#### Get Timeline Events

- **URL**: `/timeline/events`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "event_id": "uuid",
      "event_name": "string",
      "event_date_time": "timestamp",
      "location": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create Timeline Event

- **URL**: `/timeline/events`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "event_name": "string",
    "event_date_time": "timestamp",
    "location": "string",
    "description": "string"
  }
  ```
- **Response**: Created timeline event object

#### Get Timeline Event by ID

- **URL**: `/timeline/events/{event_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Timeline event object

#### Update Timeline Event

- **URL**: `/timeline/events/{event_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "event_name": "string",
    "event_date_time": "timestamp",
    "location": "string",
    "description": "string"
  }
  ```
- **Response**: Updated timeline event object

#### Delete Timeline Event

- **URL**: `/timeline/events/{event_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

### User Vendors

#### Get User Vendors

- **URL**: `/user-vendors`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `category` (optional, string), `status` (optional, string)
- **Response**:
  ```json
  [
    {
      "user_vendor_id": "uuid",
      "vendor_name": "string",
      "vendor_category": "string",
      "contact_info": "string",
      "status": "string",
      "booked_date": "date",
      "notes": "string",
      "linked_vendor_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create User Vendor

- **URL**: `/user-vendors`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "vendor_name": "string",
    "vendor_category": "string",
    "contact_info": "string",
    "status": "string",
    "booked_date": "date",
    "notes": "string",
    "linked_vendor_id": "uuid"
  }
  ```
- **Response**: Created user vendor object

#### Get User Vendor by ID

- **URL**: `/user-vendors/{user_vendor_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: User vendor object

#### Update User Vendor

- **URL**: `/user-vendors/{user_vendor_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "vendor_name": "string",
    "vendor_category": "string",
    "contact_info": "string",
    "status": "string",
    "booked_date": "date",
    "notes": "string",
    "linked_vendor_id": "uuid"
  }
  ```
- **Response**: Updated user vendor object

#### Delete User Vendor

- **URL**: `/user-vendors/{user_vendor_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

### Global Vendors

#### Search Global Vendors

- **URL**: `/vendors`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `category` (optional, string), `location_city` (optional, string), `name_query` (optional, string)
- **Response**:
  ```json
  [
    {
      "vendor_id": "uuid",
      "vendor_name": "string",
      "vendor_category": "string",
      "contact_email": "string",
      "phone_number": "string",
      "website_url": "string",
      "address": "object",
      "pricing_range": "object",
      "rating": "float",
      "description": "string",
      "portfolio_image_urls": "array",
      "is_active": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Get Global Vendor by ID

- **URL**: `/vendors/{vendor_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Vendor object

### Mood Boards

#### Get Mood Boards

- **URL**: `/moodboards`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "mood_board_id": "uuid",
      "name": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Create Mood Board

- **URL**: `/moodboards`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**: Created mood board object

#### Get Mood Board by ID

- **URL**: `/moodboards/{mood_board_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Mood board object

#### Update Mood Board

- **URL**: `/moodboards/{mood_board_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**: Updated mood board object

#### Get Mood Board Items

- **URL**: `/moodboards/{mood_board_id}/items`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `category` (optional, string)
- **Response**:
  ```json
  [
    {
      "item_id": "uuid",
      "image_url": "string",
      "note": "string",
      "category": "string",
      "created_at": "timestamp"
    }
  ]
  ```

#### Create Mood Board Item

- **URL**: `/moodboards/{mood_board_id}/items`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "image_url": "string",
    "note": "string",
    "category": "string"
  }
  ```
- **Response**: Created mood board item object

#### Delete Mood Board Item

- **URL**: `/moodboards/items/{item_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: 204 No Content

#### Get Upload URL

- **URL**: `/moodboards/items/upload-url`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "file_name": "string",
    "content_type": "string"
  }
  ```
- **Response**:
  ```json
  {
    "upload_url": "string",
    "path": "string"
  }
  ```

### Rituals

#### Search Rituals

- **URL**: `/rituals`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: `tradition` (optional, string), `category` (optional, string), `query` (optional, string)
- **Response**:
  ```json
  [
    {
      "ritual_id": "uuid",
      "name": "string",
      "tradition": "string",
      "description": "string",
      "steps": "array",
      "significance": "string",
      "duration": "string",
      "category": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### Get Ritual by ID

- **URL**: `/rituals/{ritual_id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Ritual object

## Database Schema Reference

For implementing backend API endpoints, refer to the database schema in the project's `schema.sql` file.
