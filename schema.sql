-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gin; -- Added IF NOT EXISTS
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table (Links Supabase Auth to Application Profile)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Internal App User ID
    supabase_auth_uid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth User ID
    email VARCHAR(255) UNIQUE NOT NULL,                 -- Synced from Supabase Auth
    display_name VARCHAR(255),                          -- User Profile Name
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Wedding Details
    wedding_date DATE,
    wedding_location TEXT,
    wedding_tradition TEXT,
    preferences JSONB -- { "budget_min": 5000, "budget_max": 10000, ... }
    -- Removed trailing comma here
);

CREATE INDEX idx_users_supabase_auth_uid ON users (supabase_auth_uid);
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Vendors Table
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(100) NOT NULL, -- 'Venue', 'Photographer', etc.
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    website_url TEXT,
    address JSONB, -- {"full_address": "", "city": "", ...}
    pricing_range JSONB, -- {"min": 5000, "max": 15000, ...}
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    description TEXT,
    portfolio_image_urls TEXT[], -- URLs to Supabase Storage
    is_active BOOLEAN DEFAULT true,
    supabase_auth_uid UUID UNIQUE NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- Supabase Auth ID of primary vendor owner/admin
    is_verified BOOLEAN DEFAULT false, -- For platform admins to verify vendors
    commission_rate DECIMAL(5,2) DEFAULT 0.05, -- Platform's commission rate for this vendor
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_category ON vendors (vendor_category);
CREATE INDEX idx_vendor_city ON vendors USING gin ((address ->> 'city'));
CREATE INDEX idx_gin_vendor_name_trgm ON vendors USING gin (vendor_name gin_trgm_ops);
CREATE TRIGGER set_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ENUM type for user_shortlisted_vendors status
CREATE TYPE user_vendor_status_type AS ENUM ('contacted', 'booked', 'confirmed', 'pending', 'liked', 'disliked');

-- User Vendors shortlisted Table (User's selected/tracked vendors)
-- Note: vendor_name, vendor_category, contact_info are kept for cases where a user wants to track a vendor
-- not listed on the platform, or to snapshot details at the time of shortlisting.
-- If linked_vendor_id is NOT NULL, these fields could be considered redundant if always sourced from the 'vendors' table.
CREATE TABLE user_shortlisted_vendors (
    user_vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_category TEXT NOT NULL,
    contact_info TEXT,
    status user_vendor_status_type NOT NULL DEFAULT 'pending',
    booked_date DATE,
    notes TEXT,
    linked_vendor_id UUID REFERENCES vendors(vendor_id) NULL,
    estimated_cost DECIMAL(12,2) NULL, -- If the user gets a quote.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_vendors_user_id ON user_shortlisted_vendors (user_id);
CREATE INDEX idx_user_vendors_vendor_name ON user_shortlisted_vendors USING gin (vendor_name gin_trgm_ops);
CREATE INDEX idx_user_vendors_vendor_category ON user_shortlisted_vendors (vendor_category);
CREATE TRIGGER set_user_shortlisted_vendors_updated_at
BEFORE UPDATE ON user_shortlisted_vendors
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Should be updated by a trigger when a new message is added
    summary TEXT NULL
);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions (user_id);
-- Trigger for last_updated_at on chat_sessions (will be updated by chat_messages trigger)

-- ENUM type for chat_messages sender_type
CREATE TYPE chat_sender_type AS ENUM ('user', 'assistant', 'system', 'tool');

-- Chat Messages Table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_type chat_sender_type NOT NULL,
    sender_name VARCHAR(100) NOT NULL, -- Specific agent or user name
    content JSONB NOT NULL, -- Structured content: {"type": "text", "text": "..."} or {"type": "vendor_card", "data": {...}}
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_message_session_id_ts ON chat_messages (session_id, timestamp);

-- Trigger to update chat_sessions.last_updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_chat_session_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET last_updated_at = CURRENT_TIMESTAMP
  WHERE session_id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_chat_message_insert
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE PROCEDURE update_chat_session_last_updated();


-- ENUM types for tasks
CREATE TYPE task_priority_type AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status_type AS ENUM ('No Status', 'To Do', 'Doing', 'Done');

-- Tasks Table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority task_priority_type DEFAULT 'medium',
    category VARCHAR(100),
    status task_status_type NOT NULL DEFAULT 'No Status',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_task_user_id_status ON tasks (user_id, is_complete);
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Mood Boards Table
CREATE TABLE mood_boards (
    mood_board_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Wedding Mood Board',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_user_id ON mood_boards (user_id);
CREATE TRIGGER set_mood_boards_updated_at
BEFORE UPDATE ON mood_boards
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ENUM type for mood_board_items category
CREATE TYPE mood_board_item_category_type AS ENUM ('Decorations', 'Bride', 'Groom', 'Venue', 'Flowers', 'Cake', 'Invitations', 'Other');

-- Mood Board Items Table
CREATE TABLE mood_board_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mood_board_id UUID NOT NULL REFERENCES mood_boards(mood_board_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- URL to Supabase Storage
    note TEXT,
    category mood_board_item_category_type DEFAULT 'Other',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_item_board_id ON mood_board_items (mood_board_id);
-- No updated_at for mood_board_items as they are typically immutable or replaced.

-- ENUM types for budget_items
CREATE TYPE budget_category_type AS ENUM ('Venue', 'Catering', 'Photography', 'Videography', 'Decorations', 'Attire', 'Entertainment', 'Invitations', 'Transportation', 'Gifts', 'Miscellaneous');
CREATE TYPE budget_status_type AS ENUM ('Pending', 'Paid', 'Partial Payment');

-- Budget Items Table
CREATE TABLE budget_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- "Venue Deposit"
    category budget_category_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    vendor_name TEXT, -- Consider FK to user_shortlisted_vendors.user_vendor_id if always linked
    status budget_status_type DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_budget_item_user_id ON budget_items (user_id);
CREATE TRIGGER set_budget_items_updated_at
BEFORE UPDATE ON budget_items
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ENUM types for guest_list
CREATE TYPE guest_side_type AS ENUM ('Groom', 'Bride', 'Both');
CREATE TYPE guest_status_type AS ENUM ('Pending', 'Invited', 'Confirmed', 'Declined', 'Attended', 'Not Attended');

-- Guest List Table
CREATE TABLE guest_list (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    contact_info TEXT, -- Email or Phone
    relation TEXT, -- "Brother", "Friend"
    side guest_side_type,
    status guest_status_type DEFAULT 'Pending',
    dietary_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guest_list_user_id ON guest_list (user_id);
CREATE TRIGGER set_guest_list_updated_at
BEFORE UPDATE ON guest_list
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Timeline Events Table
CREATE TABLE timeline_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_name TEXT NOT NULL, -- "Mehndi Ceremony"
    event_date_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timeline_events_user_id_datetime ON timeline_events (user_id, event_date_time);
CREATE TRIGGER set_timeline_events_updated_at
BEFORE UPDATE ON timeline_events
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- For syncing auth.users with public.users table
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.users (supabase_auth_uid, email, display_name)
        VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.users
        SET
            email = NEW.email,
            display_name = NEW.raw_user_meta_data->>'name', -- Assuming name is in raw_user_meta_data
            updated_at = CURRENT_TIMESTAMP
        WHERE supabase_auth_uid = NEW.id;
        RETURN NEW;
    -- ELSIF (TG_OP = 'DELETE') THEN -- Optional: Handle user deletion if needed
    --     DELETE FROM public.users WHERE supabase_auth_uid = OLD.id;
    --     RETURN OLD;
    END IF;
    RETURN NULL; -- Should not happen
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger first to avoid conflicts if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users; -- Optional

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_sync();

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE PROCEDURE public.handle_auth_user_sync();

-- Optional: Trigger for user deletion
-- CREATE TRIGGER on_auth_user_deleted
-- AFTER DELETE ON auth.users
-- FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_sync();
