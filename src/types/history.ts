// src/types/history.ts

// The overall response from the history API
export interface HistoryResponse {
  events: HistoryEvent[];
  total_events: number;
  has_more: boolean;
}

// A single event from the history
export interface HistoryEvent {
  metadata: HistoryEventMetadata;
  content: ChatMessageContent | ArtifactUploadContent | SystemEventContent; // Union type for content
}

// Base for all event metadata
export interface HistoryEventMetadata {
  timestamp: string; // ISO date string (e.g., "2023-10-27T10:00:00Z")
  event_type: 'message' | 'artifact_upload' | 'system_event';
  wedding_id: string;
}

// Content for chat messages
export interface ChatMessageContent {
  message_id: string; // Unique ID for the message
  sender: string;     // e.g., "user", "assistant"
  content: string;    // The actual message text
  session_id: string;
}

// Content for artifact uploads
export interface ArtifactUploadContent {
  artifact_id: string;
  filename: string;
  file_url: string;
  // ... other artifact-specific details
}

// Content for system events
export interface SystemEventContent {
  event_name: string;
  details: Record<string, any>;
  // ... other system event details
}