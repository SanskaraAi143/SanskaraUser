# Sanskara AI Weddings Planner - Design Document

## 1. Project Overview
The Sanskara AI Weddings Planner is a next-generation, AI-powered wedding planning platform. It integrates with Supabase for real-time data, provides a user-friendly dashboard, and leverages AI to optimize tasks, vendor management, and personalized suggestions. The platform is designed to assist users in planning Hindu weddings by offering features like ritual suggestions, vendor recommendations, budget tracking, and guest management.

---

## 2. System Architecture

### High-Level Architecture
```mermaid
graph TD;
  A[User Interface (React)] --> B[API Layer]
  B --> C[Supabase Backend]
  B --> D[AI Services]
  D --> E[Recommendation Engine]
  D --> F[Analytics & Insights]
  C --> G[Database]
```

### Components
- **Frontend:** React + TypeScript, TailwindCSS, Framer Motion
- **Backend:** Supabase (Postgres, Auth, Storage)
- **AI Layer:** Custom APIs for recommendations, NLP, and automation

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
   - Ritual and vendor recommendations based on user preferences.

5. **Error Handling:**
   - UI remains responsive even if a data fetch fails.

### Technologies Used
- **React:** For building the user interface.
- **TailwindCSS:** For styling.
- **Framer Motion:** For animations.
- **React Router:** For navigation.

---

## 4. Backend Design

### Integration with Supabase
- **Authentication:**
  - Supabase Auth for user sign-up and login.

- **Database:**
  - Direct access via Supabase client with row-level security.

- **Storage:**
  - Supabase Storage for uploading and managing images (e.g., mood boards).

- **Real-time:**
  - Subscriptions for real-time updates on tasks, vendors, and guest lists.

### Example API Usage
```ts
import { supabase } from './supabaseClient';

// Fetch user profile
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};
```

---

## 5. Database Design

### Supabase Tables
1. **Users Table:**
   - Links Supabase Auth to application profile.
   - Stores user details like wedding date, location, and preferences.

2. **Vendors Table:**
   - Stores vendor details like name, category, contact info, and pricing.

3. **Tasks Table:**
   - Tracks user tasks with statuses and deadlines.

4. **Budget Items Table:**
   - Tracks user expenses and budget categories.

5. **Guest List Table:**
   - Manages guest details, dietary requirements, and RSVP statuses.

6. **Timeline Events Table:**
   - Tracks wedding events with dates, locations, and descriptions.

---

## 6. AI Features

### Key AI Capabilities
1. **Ritual Suggestions:**
   - AI recommends rituals based on tradition and preferences.

2. **Vendor Matching:**
   - Smart matching of vendors to user needs.

3. **Task Prioritization:**
   - AI suggests which tasks to focus on next.

4. **Timeline Optimization:**
   - Automated scheduling based on dependencies and deadlines.

5. **Budget Insights:**
   - AI highlights overspending and suggests optimizations.

---

## 7. Security & Privacy

- User authentication via Supabase Auth.
- Data access is scoped to authenticated users.
- No sensitive information is exposed in logs or UI.
- Follow best practices for environment variable management.

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
