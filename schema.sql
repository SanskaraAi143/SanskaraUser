
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users Table (Linked to Firebase Auth UID)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Wedding Details (from Profile Page)
    wedding_date DATE,
    wedding_location TEXT,
    wedding_tradition TEXT,
    preferences JSONB
);
CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX idx_users_email ON users (email);

-- Vendors Table
CREATE TABLE vendors (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name VARCHAR(255) NOT NULL,
    vendor_category VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    website_url TEXT,
    address JSONB,
    pricing_range JSONB,
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    description TEXT,
    portfolio_image_urls TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendor_category ON vendors (vendor_category);
CREATE INDEX idx_vendor_city ON vendors USING gin ((address ->> 'city'));
CREATE INDEX idx_gin_vendor_name_trgm ON vendors USING gin (vendor_name gin_trgm_ops);

-- User Vendors Table
CREATE TABLE user_vendors (
    user_vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_category VARCHAR(100) NOT NULL,
    contact_info TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'contacted',
    booked_date DATE,
    notes TEXT,
    linked_vendor_id UUID REFERENCES vendors(vendor_id) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_vendors_user_id ON user_vendors (user_id);
CREATE INDEX idx_user_vendors_status ON user_vendors (user_id, status);

-- Chat Sessions & Messages
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    summary TEXT NULL
);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions (user_id);

CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_message_session_id_ts ON chat_messages (session_id, timestamp);

-- Tasks Table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    due_date DATE,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_task_user_id_status ON tasks (user_id, is_complete);
CREATE INDEX idx_task_user_id_due_date ON tasks (user_id, due_date);

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

CREATE TABLE mood_board_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mood_board_id UUID NOT NULL REFERENCES mood_boards(mood_board_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    note TEXT,
    category VARCHAR(100) DEFAULT 'Decorations',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mood_board_item_board_id ON mood_board_items (mood_board_id);
CREATE INDEX idx_mood_board_item_category ON mood_board_items (mood_board_id, category);

-- Budget Items Table
CREATE TABLE budget_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    vendor_name TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_budget_item_user_id ON budget_items (user_id);
CREATE INDEX idx_budget_item_category ON budget_items (user_id, category);

-- Guest List Table
CREATE TABLE guest_list (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    contact_info TEXT,
    relation TEXT,
    side VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Pending',
    dietary_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guest_list_user_id ON guest_list (user_id);
CREATE INDEX idx_guest_list_status ON guest_list (user_id, status);

-- Timeline Events Table
CREATE TABLE timeline_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timeline_events_user_id_datetime ON timeline_events (user_id, event_date_time);

-- Rituals Knowledge Base
CREATE TABLE rituals (
    ritual_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tradition VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    steps TEXT[],
    significance TEXT,
    duration VARCHAR(50),
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ritual_name_trgm ON rituals USING gin (name gin_trgm_ops);
CREATE INDEX idx_ritual_tradition ON rituals (tradition);
CREATE INDEX idx_ritual_category ON rituals (category);
