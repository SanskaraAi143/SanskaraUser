
# Sanskara AI API Documentation

This document outlines all the API endpoints required for the Sanskara AI application, based on the AutoGen architecture and frontend implementation.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All API endpoints require authentication using Firebase ID tokens. Include the token in the header of each request:

```
Authorization: Bearer <firebase_id_token>
```

The server will verify this token with Firebase Admin SDK, extract the `firebase_uid`, and map it to an internal user ID in the database.

## Error Handling

All endpoints follow a standard error response format:

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

## Endpoints

### Chat

#### Send Chat Message

- **URL**: `/chat`
- **Method**: `POST`
- **Description**: Sends a message to the AutoGen-powered AI system
- **Request Body**:
  ```json
  {
    "message": "string",
    "session_id": "string (optional)",
    "category": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "string",
        "sender_type": "user" | "assistant" | "system" | "tool",
        "sender_name": "string",
        "content": {
          "type": "text" | "vendor_card" | "task_suggestion" | "tool_call" | "tool_response",
          "text": "string (for text type)",
          "data": "object (for other types)"
        },
        "timestamp": "ISO datetime string"
      }
    ],
    "session_id": "string"
  }
  ```

### Rituals

#### Get Ritual Information

- **URL**: `/rituals/{ritualName}`
- **Method**: `GET`
- **Description**: Get detailed information about a specific ritual
- **URL Parameters**: 
  - `ritualName`: Name of the ritual to retrieve
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "tradition": "string",
    "description": "string",
    "steps": ["string"],
    "significance": "string",
    "duration": "string",
    "category": "string"
  }
  ```

#### Get Suggested Rituals

- **URL**: `/rituals/suggested`
- **Method**: `GET`
- **Description**: Get suggested rituals based on tradition
- **Query Parameters**:
  - `tradition`: Wedding tradition (e.g., "Hindu", "Sikh", "Bengali")
- **Response**: Array of ritual objects (same schema as Get Ritual Information)

#### Search Rituals

- **URL**: `/rituals/search`
- **Method**: `GET`
- **Description**: Search for rituals based on a query string
- **Query Parameters**:
  - `query`: Search term
- **Response**: Array of ritual objects (same schema as Get Ritual Information)

### Vendors

#### Get Vendor Recommendations

- **URL**: `/vendors/recommend`
- **Method**: `GET`
- **Description**: Get vendor recommendations based on criteria
- **Request Body**:
  ```json
  {
    "category": "string",
    "location": "string",
    "budget": "number (optional)"
  }
  ```
- **Response**: Array of vendor objects:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "contactEmail": "string",
      "phoneNumber": "string",
      "websiteUrl": "string",
      "address": {
        "fullAddress": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string"
      },
      "pricingRange": {
        "min": "number",
        "max": "number",
        "currency": "string",
        "unit": "string",
        "details": "string"
      },
      "rating": "number",
      "description": "string",
      "portfolioImageUrls": ["string"]
    }
  ]
  ```

#### Get Vendor Details

- **URL**: `/vendors/{vendorId}`
- **Method**: `GET`
- **Description**: Get detailed information about a specific vendor
- **URL Parameters**:
  - `vendorId`: ID of the vendor to retrieve
- **Response**: Vendor object (same schema as in Get Vendor Recommendations)

### User Vendors

#### Get User Vendors

- **URL**: `/user/vendors`
- **Method**: `GET`
- **Description**: Get all vendors tracked by the user
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "contactInfo": "string",
      "status": "contacted" | "booked" | "pending" | "confirmed",
      "bookedDate": "ISO date string (optional)",
      "notes": "string (optional)",
      "linkedVendor": "Vendor object (optional)"
    }
  ]
  ```

#### Add User Vendor

- **URL**: `/user/vendors`
- **Method**: `POST`
- **Description**: Add a vendor to the user's tracking list
- **Request Body**:
  ```json
  {
    "name": "string",
    "category": "string",
    "contactInfo": "string (optional)",
    "status": "contacted" | "booked" | "pending" | "confirmed",
    "bookedDate": "ISO date string (optional)",
    "notes": "string (optional)",
    "linkedVendorId": "string (optional)"
  }
  ```
- **Response**: Created user vendor object

#### Update User Vendor

- **URL**: `/user/vendors/{id}`
- **Method**: `PUT`
- **Description**: Update a vendor in the user's tracking list
- **URL Parameters**:
  - `id`: ID of the user vendor to update
- **Request Body**: Same as Add User Vendor (partial updates allowed)
- **Response**: Updated user vendor object

#### Delete User Vendor

- **URL**: `/user/vendors/{id}`
- **Method**: `DELETE`
- **Description**: Remove a vendor from the user's tracking list
- **URL Parameters**:
  - `id`: ID of the user vendor to delete
- **Response**: `{ "success": true }`

### Tasks

#### Get Tasks

- **URL**: `/tasks`
- **Method**: `GET`
- **Description**: Get all tasks for the user
- **Response**:
  ```json
  [
    {
      "id": "string",
      "description": "string",
      "isComplete": "boolean",
      "dueDate": "ISO date string (optional)",
      "category": "string (optional)",
      "created_at": "ISO datetime string",
      "updated_at": "ISO datetime string"
    }
  ]
  ```

#### Create Task

- **URL**: `/tasks`
- **Method**: `POST`
- **Description**: Create a new task
- **Request Body**:
  ```json
  {
    "description": "string",
    "isComplete": "boolean",
    "dueDate": "ISO date string (optional)",
    "category": "string (optional)"
  }
  ```
- **Response**: Created task object

#### Update Task

- **URL**: `/tasks/{id}`
- **Method**: `PUT`
- **Description**: Update an existing task
- **URL Parameters**:
  - `id`: ID of the task to update
- **Request Body**: Same as Create Task (partial updates allowed)
- **Response**: Updated task object

#### Delete Task

- **URL**: `/tasks/{id}`
- **Method**: `DELETE`
- **Description**: Delete a task
- **URL Parameters**:
  - `id`: ID of the task to delete
- **Response**: `{ "success": true }`

### Mood Board

#### Get Moodboard Images

- **URL**: `/moodboards/images`
- **Method**: `GET`
- **Description**: Get all mood board images, optionally filtered by category
- **Query Parameters**:
  - `category`: Category filter (optional)
- **Response**:
  ```json
  [
    {
      "id": "string",
      "url": "string",
      "caption": "string",
      "category": "string",
      "created_at": "ISO datetime string"
    }
  ]
  ```

#### Upload Moodboard Image

- **URL**: `/moodboards/images/upload`
- **Method**: `POST`
- **Description**: Upload a new image to the mood board
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Image file
  - `category`: Image category (e.g., "decorations", "bride", "groom")
  - `caption`: Image caption
- **Response**: Created moodboard image object

#### Delete Moodboard Image

- **URL**: `/moodboards/images/{id}`
- **Method**: `DELETE`
- **Description**: Delete an image from the mood board
- **URL Parameters**:
  - `id`: ID of the image to delete
- **Response**: `{ "success": true }`

### Budget

#### Get Budget Items

- **URL**: `/budget`
- **Method**: `GET`
- **Description**: Get all budget items for the user
- **Response**:
  ```json
  [
    {
      "id": "string",
      "itemName": "string",
      "category": "string",
      "amount": "number",
      "vendorName": "string (optional)",
      "status": "Pending" | "Paid",
      "created_at": "ISO datetime string",
      "updated_at": "ISO datetime string"
    }
  ]
  ```

#### Create Budget Item

- **URL**: `/budget`
- **Method**: `POST`
- **Description**: Create a new budget item
- **Request Body**:
  ```json
  {
    "itemName": "string",
    "category": "string",
    "amount": "number",
    "vendorName": "string (optional)",
    "status": "Pending" | "Paid"
  }
  ```
- **Response**: Created budget item object

#### Update Budget Item

- **URL**: `/budget/{id}`
- **Method**: `PUT`
- **Description**: Update an existing budget item
- **URL Parameters**:
  - `id`: ID of the budget item to update
- **Request Body**: Same as Create Budget Item (partial updates allowed)
- **Response**: Updated budget item object

#### Delete Budget Item

- **URL**: `/budget/{id}`
- **Method**: `DELETE`
- **Description**: Delete a budget item
- **URL Parameters**:
  - `id`: ID of the budget item to delete
- **Response**: `{ "success": true }`

### Guests

#### Get Guests

- **URL**: `/guests`
- **Method**: `GET`
- **Description**: Get all guests for the user's wedding
- **Response**:
  ```json
  [
    {
      "id": "string",
      "guestName": "string",
      "contactInfo": "string (optional)",
      "relation": "string (optional)",
      "side": "Groom" | "Bride" | "Both",
      "status": "Pending" | "Invited" | "Confirmed" | "Declined",
      "dietaryRequirements": "string (optional)",
      "created_at": "ISO datetime string",
      "updated_at": "ISO datetime string"
    }
  ]
  ```

#### Create Guest

- **URL**: `/guests`
- **Method**: `POST`
- **Description**: Add a new guest
- **Request Body**:
  ```json
  {
    "guestName": "string",
    "contactInfo": "string (optional)",
    "relation": "string (optional)",
    "side": "Groom" | "Bride" | "Both",
    "status": "Pending" | "Invited" | "Confirmed" | "Declined",
    "dietaryRequirements": "string (optional)"
  }
  ```
- **Response**: Created guest object

#### Update Guest

- **URL**: `/guests/{id}`
- **Method**: `PUT`
- **Description**: Update an existing guest
- **URL Parameters**:
  - `id`: ID of the guest to update
- **Request Body**: Same as Create Guest (partial updates allowed)
- **Response**: Updated guest object

#### Delete Guest

- **URL**: `/guests/{id}`
- **Method**: `DELETE`
- **Description**: Remove a guest
- **URL Parameters**:
  - `id`: ID of the guest to delete
- **Response**: `{ "success": true }`

### Timeline

#### Get Timeline Events

- **URL**: `/timeline`
- **Method**: `GET`
- **Description**: Get all timeline events for the user's wedding
- **Response**:
  ```json
  [
    {
      "id": "string",
      "eventName": "string",
      "eventDateTime": "ISO datetime string",
      "location": "string (optional)",
      "description": "string (optional)",
      "created_at": "ISO datetime string",
      "updated_at": "ISO datetime string"
    }
  ]
  ```

#### Create Timeline Event

- **URL**: `/timeline`
- **Method**: `POST`
- **Description**: Add a new timeline event
- **Request Body**:
  ```json
  {
    "eventName": "string",
    "eventDateTime": "ISO datetime string",
    "location": "string (optional)",
    "description": "string (optional)"
  }
  ```
- **Response**: Created timeline event object

#### Update Timeline Event

- **URL**: `/timeline/{id}`
- **Method**: `PUT`
- **Description**: Update an existing timeline event
- **URL Parameters**:
  - `id`: ID of the timeline event to update
- **Request Body**: Same as Create Timeline Event (partial updates allowed)
- **Response**: Updated timeline event object

#### Delete Timeline Event

- **URL**: `/timeline/{id}`
- **Method**: `DELETE`
- **Description**: Remove a timeline event
- **URL Parameters**:
  - `id`: ID of the timeline event to delete
- **Response**: `{ "success": true }`

## Handling Multiple Message Types in Chat

The chat API supports structured messages with different content types:

1. **Text**: Simple text messages
   ```json
   {
     "type": "text",
     "text": "Hello, how can I help you plan your wedding?"
   }
   ```

2. **Vendor Card**: Vendor information card to display in the chat
   ```json
   {
     "type": "vendor_card",
     "data": {
       "id": "string",
       "name": "string",
       "category": "string",
       "location": "string",
       "price": "string",
       "rating": "number",
       "imageUrl": "string (optional)"
     }
   }
   ```

3. **Task Suggestion**: Task suggestion that user can confirm/add
   ```json
   {
     "type": "task_suggestion",
     "data": {
       "description": "string",
       "dueDate": "ISO date string (optional)",
       "category": "string (optional)"
     }
   }
   ```

4. **Tool Call**: Record of a function call made by the AI (usually not shown to users)
   ```json
   {
     "type": "tool_call",
     "function_name": "string",
     "args": "object"
   }
   ```

5. **Tool Response**: Response from a tool call (usually not shown to users)
   ```json
   {
     "type": "tool_response",
     "function_name": "string",
     "result": "any"
   }
   ```

## Implementation Notes

1. All timestamps should be in ISO 8601 format.
2. The backend implementation uses AutoGen for AI orchestration, with multiple specialized agents processing user requests.
3. The chat system is designed to support structured message types beyond simple text, allowing for rich interaction.
4. File uploads (like mood board images) use multipart/form-data format.
5. All endpoints requiring user identity must verify the Firebase ID token and map it to the internal user ID.
