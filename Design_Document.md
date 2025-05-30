# Sanskara AI Weddings Planner - Design Document

## 1. Project Overview
The Sanskara AI Weddings Planner is a next-generation, AI-powered wedding planning platform. It integrates with Supabase for real-time data, provides a user-friendly dashboard, and leverages AI to optimize tasks, vendor management, and personalized suggestions. The platform is designed to assist users in planning Hindu weddings by offering features like ritual suggestions, vendor recommendations, budget tracking, and guest management.

---

## 2. System Architecture

### High-Level Architecture
```mermaid
graph TD;
  A[User Interface (React)] --> B[API Layer (Node.js/Express with Supabase Client)];
  B --> C[Supabase Backend (Postgres, Auth, Storage)];
  B --> D[AI Services (Python/FastAPI)];
  C --> G[Database (Postgres)];
  D -- Fetches data from/Updates data in --> C;
  D -- Provides insights/suggestions to --> B;
  A -- Receives real-time updates via --> C;
```

**Data Flow & AI Interaction:**
- The **User Interface** makes requests to the **API Layer**.
- The **API Layer** acts as an intermediary. It directly uses the Supabase client for most database operations (CRUD on users, vendors, tasks, etc.) and authentication.
- For AI-specific features (e.g., ritual suggestions, vendor matching), the **API Layer** calls dedicated **AI Services**.
- **AI Services** may fetch necessary data from Supabase (via the API Layer or a restricted Supabase client) to generate recommendations or insights. These are then returned to the API Layer, which formats them for the UI.
- Real-time updates (e.g., task status changes, new guest RSVPs) are handled by the UI subscribing directly to Supabase's real-time capabilities.

### Components
- **Frontend:** React + TypeScript, TailwindCSS, Framer Motion
- **Backend (API Layer):** Node.js/Express (or similar) utilizing the Supabase client library for interactions with Supabase. This layer also communicates with AI services.
- **Database & Auth:** Supabase (Postgres, Auth, Storage)
- **AI Layer:** Custom AI models and logic exposed via APIs (e.g., Python/FastAPI) for recommendations, NLP, and automation.

---

## 3. Frontend Design

### Key Features
1. **Dashboard:**
   - Displays wedding stats, confirmed guests, budget, tasks, and timeline.
   - Real-time updates using Supabase subscriptions.

2. **Tasks Management:**
   - Add, edit, and track tasks with statuses: To Do, Doing, Done.

3. **Vendor Management:**
   - Search and manage vendors based on user preferences.
   - Real-time updates after actions.

4. **AI Suggestions:**
   - Ritual and vendor recommendations based on user preferences, fetched via the API Layer.

5. **Error Handling:**
   - UI remains responsive even if a data fetch fails.
   - **Strategies:**
     - **Error Boundaries:** React Error Boundaries are used at key points in the component tree to catch rendering errors and display fallback UI.
     - **Loading/Error States:** Individual components and data-fetching hooks manage their own loading and error states (e.g., displaying spinners, skeletons, or specific error messages).
     - **Toast Notifications:** User-facing error messages for API call failures (e.g., "Failed to save task") are shown using a toast notification system.
     - **Retry Mechanisms:** For critical data fetches, simple retry logic (e.g., up to 3 attempts with exponential backoff) may be implemented in custom hooks or service calls.

### Technologies Used
- **React:** For building the user interface.
- **TailwindCSS:** For styling.
- **Framer Motion:** For animations.
- **React Router:** For navigation.

---

## 4. Backend Design

### API Layer
The API Layer is a backend service (e.g., built with Node.js/Express) that serves as the primary interface for the frontend. It handles:
- Business logic that shouldn't reside in the client.
- Aggregating data from Supabase and AI services.
- Providing a secure interface to Supabase, abstracting direct client-side Supabase calls for certain complex or sensitive operations.
- Communicating with the AI Layer for specialized tasks.

### Integration with Supabase
- **Authentication:**
  - Supabase Auth for user sign-up and login, typically managed via the Supabase client library within the API Layer or directly by the client for session management.
- **Database:**
  - The API Layer uses the Supabase client library for most database interactions.
  - Row-Level Security (RLS) is heavily utilized in Supabase to ensure data isolation and security.
  - **Key RLS Policies Examples:**
    - `users` table: Users can only select/update their own profile (`auth.uid() = supabase_auth_uid`).
    - `tasks`, `budget_items`, `guest_list`, `timeline_events`, `mood_boards`: Users can only perform CRUD operations on records where the `user_id` column matches their internal application `user_id` (which is linked to `auth.uid()`).
    - `vendors` table: Publicly readable, but write operations might be restricted to admins or specific vendor owner roles.
- **Storage:**
  - Supabase Storage for uploading and managing images (e.g., mood boards), typically via direct client-side uploads using Supabase client library after obtaining necessary permissions/tokens from the API layer.
- **Real-time:**
  - Frontend subscribes directly to Supabase's real-time features for updates on tasks, vendors, and guest lists.

### Example API Usage (Conceptual - API Layer)
```ts
// In the API Layer (e.g., Express route)
// This is a conceptual example. Actual implementation depends on the framework.

// Example: Get user profile (API Layer endpoint)
// app.get('/api/user/profile', async (req, res) => {
//   const userId = req.user.id; // Assuming req.user is populated by auth middleware
//   try {
//     // Supabase client is initialized and available in the API layer
//     const { data, error } = await supabase
//       .from('users')
//       .select('user_id, email, display_name, wedding_date, wedding_location, wedding_tradition, preferences')
//       .eq('user_id', userId) // Query by internal user_id
//       .single();
//
//     if (error) {
//       console.error('Error fetching user profile:', error);
//       return res.status(500).json({ message: 'Error fetching profile', details: error.message });
//     }
//     if (!data) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }
//     return res.json(data);
//   } catch (e) {
//     console.error('Unexpected error:', e);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });
```

---

## 5. Database Design

### Supabase Tables
1. **Users Table:**
   - `user_id` (UUID, PK): Internal application user ID.
   - `supabase_auth_uid` (UUID, FK to `auth.users.id`, UNIQUE, NOT NULL): Links to Supabase Auth.
   - `email` (VARCHAR(255), UNIQUE, NOT NULL): Synced from Supabase Auth.
   - `display_name` (VARCHAR(255)): User's preferred name.
   - `wedding_date` (DATE): Planned wedding date.
   - `wedding_location` (TEXT): General location/city.
   - `wedding_tradition` (TEXT): E.g., "Gujarati", "Punjabi", "South Indian".
   - `preferences` (JSONB): Stores various user settings like budget range, AI preferences.
   - `created_at` (TIMESTAMPTZ): Timestamp of creation.
   - `updated_at` (TIMESTAMPTZ): Timestamp of last update.

2. **Vendors Table:** (Publicly discoverable vendor listings)
   - `vendor_id` (UUID, PK): Unique identifier for the vendor.
   - `vendor_name` (VARCHAR(255), NOT NULL): Name of the vendor.
   - `vendor_category` (VARCHAR(100), NOT NULL): E.g., 'Venue', 'Photographer', 'Catering'.
   - `contact_email` (VARCHAR(255)): Vendor's contact email.
   - `phone_number` (VARCHAR(50)): Vendor's phone number.
   - `address` (JSONB): Detailed address (street, city, state, zip, country).
   - `rating` (FLOAT): Average user rating (e.g., 1-5).
   - `description` (TEXT): Detailed description of services.
   - `portfolio_image_urls` (TEXT[]): Array of URLs to images in Supabase Storage.
   - `is_verified` (BOOLEAN, DEFAULT false): If verified by platform admins.
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

3. **User Shortlisted Vendors Table:** (Vendors a user is tracking/has booked)
    - `user_vendor_id` (UUID, PK)
    - `user_id` (UUID, FK to `users.user_id`, NOT NULL)
    - `vendor_name` (TEXT, NOT NULL): Could be a custom entry or name of linked vendor.
    - `vendor_category` (TEXT, NOT NULL)
    - `contact_info` (TEXT)
    - `status` (VARCHAR(50), NOT NULL, DEFAULT 'pending'): E.g., 'pending', 'contacted', 'booked', 'rejected'.
    - `linked_vendor_id` (UUID, FK to `vendors.vendor_id`, NULL): If linked to a platform vendor.
    - `estimated_cost` (DECIMAL(12,2), NULL)
    - `notes` (TEXT)
    - `created_at` (TIMESTAMPTZ)
    - `updated_at` (TIMESTAMPTZ)

4. **Tasks Table:**
   - `task_id` (UUID, PK)
   - `user_id` (UUID, FK to `users.user_id`, NOT NULL)
   - `title` (VARCHAR(255), NOT NULL)
   - `description` (TEXT)
   - `is_complete` (BOOLEAN, DEFAULT FALSE)
   - `due_date` (DATE)
   - `priority` (VARCHAR(10), DEFAULT 'medium'): 'low', 'medium', 'high'.
   - `status` (VARCHAR(20), NOT NULL DEFAULT 'No Status'): 'No Status', 'To Do', 'Doing', 'Done'.
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

5. **Budget Items Table:**
   - `item_id` (UUID, PK)
   - `user_id` (UUID, FK to `users.user_id`, NOT NULL)
   - `item_name` (TEXT, NOT NULL)
   - `category` (VARCHAR(100), NOT NULL)
   - `amount` (DECIMAL(12, 2), NOT NULL)
   - `status` (VARCHAR(50), DEFAULT 'Pending'): 'Pending', 'Paid'.
   - `user_vendor_id` (UUID, FK to `user_shortlisted_vendors.user_vendor_id`, NULL): Optional link to a shortlisted vendor.
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

6. **Guest List Table:**
   - `guest_id` (UUID, PK)
   - `user_id` (UUID, FK to `users.user_id`, NOT NULL)
   - `guest_name` (TEXT, NOT NULL)
   - `contact_info` (TEXT)
   - `relation` (TEXT)
   - `side` (VARCHAR(50)): 'Groom', 'Bride', 'Both'.
   - `status` (VARCHAR(50), DEFAULT 'Pending'): 'Pending', 'Invited', 'Confirmed', 'Declined'.
   - `dietary_requirements` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

7. **Timeline Events Table:**
   - `event_id` (UUID, PK)
   - `user_id` (UUID, FK to `users.user_id`, NOT NULL)
   - `event_name` (TEXT, NOT NULL)
   - `event_date_time` (TIMESTAMPTZ, NOT NULL)
   - `location` (TEXT)
   - `description` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

(Other tables like `mood_boards`, `mood_board_items`, `chat_sessions`, `chat_messages` as per `schema.sql` with relevant columns and FKs.)

---

## 6. AI Features

### Key AI Capabilities
1. **Ritual Suggestions:**
   - **Data Sources:** Knowledge base of Hindu rituals, user's specified tradition (from `users.wedding_tradition`), wedding date.
   - **Integration:** API Layer calls AI service with user context. AI returns list of relevant rituals.
   - **Error Handling:** If AI service fails, API Layer returns an empty list or a pre-defined fallback. Irrelevant suggestions are minimized by context but user can ignore/dismiss.
2. **Vendor Matching:**
   - **Data Sources:** `vendors` table, user preferences (budget, location from `users` table), user-specified vendor category.
   - **Integration:** API Layer calls AI service. AI service might query Supabase (filtered by category, location proximity) and then apply matching logic.
   - **Error Handling:** If AI service fails or no matches, API returns empty list or "no vendors found" message.
3. **Task Prioritization:**
   - **Data Sources:** User's `tasks` table, `wedding_date`.
   - **Integration:** AI service analyzes tasks based on due dates, dependencies (if defined), and typical wedding planning phases.
   - **Error Handling:** If AI fails, tasks are shown in default order (e.g., by due date).
4. **Timeline Optimization:** (Future Scope)
   - **Data Sources:** `timeline_events`, standard ritual durations, user constraints.
   - **Integration:** AI suggests optimal event scheduling.
   - **Error Handling:** Fallback to manual timeline creation.
5. **Budget Insights:**
   - **Data Sources:** `budget_items`, `users.preferences.budget_max`, typical costs for categories/location.
   - **Integration:** AI service analyzes spending patterns against budget and category averages.
   - **Error Handling:** If AI fails, basic budget sum-ups are shown.

---

## 7. Security & Privacy

- User authentication via Supabase Auth (JWT-based).
- **Data Isolation:** Row-Level Security (RLS) policies on Supabase tables ensure users can only access their own wedding-related data (tasks, guests, budget, etc.). Public data like general vendor listings are accessible.
- **Data Encryption:**
    - **In Transit:** All communication between client, API Layer, and Supabase uses HTTPS/TLS.
    - **At Rest:** Supabase encrypts data at rest by default. Sensitive user preferences in JSONB could be further encrypted application-side if deemed necessary (currently not implemented).
- **Input Validation:**
    - **Client-Side:** Basic validation for user inputs (e.g., email format, required fields).
    - **API Layer:** Rigorous validation of all incoming data from the client before processing or passing to Supabase/AI services. This includes type checks, length checks, and sanitization against XSS/SQLi (though Supabase client helps prevent SQLi).
- **API Rate Limiting:** The API Layer should implement rate limiting (e.g., using a middleware like `express-rate-limit`) to prevent abuse of AI services or Supabase queries.
- **Environment Variables:** All sensitive keys (Supabase URL/keys, API keys for AI services) are managed via environment variables and are not hardcoded. `.env` files are not committed to version control.
- **Error Handling:** Errors do not expose sensitive stack traces or database details to the client. Generic error messages are shown, and detailed errors are logged server-side.

---

## 8. Future Implementations

| Feature                    | Description                                 |
|---------------------------|---------------------------------------------|
| Mobile App                | Native iOS/Android app for planning on-the-go|
| Advanced Analytics        | Deeper insights into budget, guests, and tasks|
| Multi-language Support    | UI and AI suggestions in multiple languages  |
| AI Chatbot                | 24/7 planning assistant                     |
| Third-Party Integrations  | Payments, calendars, and more               |
| Offline Mode              | Plan without internet, sync when online      |

---

> **Designed with ❤️ by the Sanskara AI Team**
