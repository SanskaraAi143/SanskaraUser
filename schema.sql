-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users Table (Links Supabase Auth to Application Profile)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Internal App User ID
    supabase_auth_uid UUID UNIQUE NOT NULL,             -- Supabase Auth User ID
    email VARCHAR(255) UNIQUE NOT NULL,                 -- Synced from Supabase Auth
    display_name VARCHAR(255),                          -- User Profile Name
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Wedding Details
    wedding_date DATE,
    wedding_location TEXT,
    wedding_tradition TEXT,
    preferences JSONB, -- { "budget_min": 5000, "budget_max": 10000, ... },
);

CREATE INDEX idx_users_supabase_auth_uid ON users (supabase_auth_uid);

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
    supabase_auth_uid UUID UNIQUE NULL REFERENCES auth.users(id), -- Supabase Auth ID of primary vendor owner/admin
    is_verified BOOLEAN DEFAULT false, -- For platform admins to verify vendors
    commission_rate DECIMAL(5,2) DEFAULT 0.05, -- Platform's commission rate for this vendor
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_category ON vendors (vendor_category);
CREATE INDEX idx_vendor_city ON vendors USING gin ((address ->> 'city'));
CREATE INDEX idx_gin_vendor_name_trgm ON vendors USING gin (vendor_name gin_trgm_ops);

-- -- User Vendors shortlisted Table (User's selected/tracked vendors)
CREATE TABLE user_shortlisted_vendors (
    user_vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_category TEXT NOT NULL,
    contact_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'contacted', -- 'contacted', 'booked', 'confirmed', 'pending', 'liked' , 'disliked'
    booked_date DATE,
    notes TEXT,
    linked_vendor_id UUID REFERENCES vendors(vendor_id) NULL,
    estimated_cost DECIMAL(12,2) NULL, -- If the user gets a quote.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
); -- Closing parenthesis added here

CREATE INDEX idx_user_vendors_user_id ON user_shortlisted_vendors (user_id);
CREATE INDEX idx_user_vendors_vendor_name ON user_shortlisted_vendors USING gin (vendor_name gin_trgm_ops);
CREATE INDEX idx_user_vendors_vendor_category ON user_shortlisted_vendors (vendor_category);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    summary TEXT NULL
);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions (user_id);

-- Chat Messages Table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system', 'tool'
    sender_name VARCHAR(100) NOT NULL, -- Specific agent or user name
    content JSONB NOT NULL, -- Structured content: {"type": "text", "text": "..."} or {"type": "vendor_card", "data": {...}}
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_message_session_id_ts ON chat_messages (session_id, timestamp);

-- Tasks Table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'No Status', -- 'No Status', 'To Do', 'Doing', 'Done'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_task_user_id_status ON tasks (user_id, is_complete);

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

-- Mood Board Items Table
CREATE TABLE mood_board_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mood_board_id UUID NOT NULL REFERENCES mood_boards(mood_board_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- URL to Supabase Storage
    note TEXT,
    category VARCHAR(100) DEFAULT 'Decorations', -- 'Decorations', 'Bride', 'Groom'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_item_board_id ON mood_board_items (mood_board_id);

-- Budget Items Table
CREATE TABLE budget_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- "Venue Deposit"
    category VARCHAR(100) NOT NULL, -- 'Venue', 'Catering', etc.
    amount DECIMAL(12, 2) NOT NULL,
    vendor_name TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_budget_item_user_id ON budget_items (user_id);

-- Guest List Table
CREATE TABLE guest_list (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    contact_info TEXT, -- Email or Phone
    relation TEXT, -- "Brother", "Friend"
    side VARCHAR(50), -- 'Groom', 'Bride', 'Both'
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Invited', 'Confirmed', 'Declined'
    dietary_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guest_list_user_id ON guest_list (user_id);

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


-- For creating trigger when a new user is logged add user to users table
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (supabase_auth_uid, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

