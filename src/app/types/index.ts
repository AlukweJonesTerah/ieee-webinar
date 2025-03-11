/**
 * Core types for IEEE Webinar Platform
 */

/**
 * Social media links for speakers/organizers
 */
export interface SocialLinks {
  /** LinkedIn profile URL */
  linkedin?: string;
  /** Twitter/X profile URL */
  twitter?: string;
  /** GitHub profile URL */
  github?: string;
  /** Personal website URL */
  website?: string;
}

/**
 * Session type with timing information
 */
export interface Session {
  /** Title of the session */
  title: string;
  /** Detailed description */
  description: string;
  /** ISO 8601 timestamp */
  time: string;
}

/**
 * Speaker information structure
 */
export interface Speaker {
  /** Full name of speaker */
  name: string;
  /** Role/position in IEEE */
  role: string;
  /** Biography (250 characters max) */
  bio: string;
  /** URL to profile photo */
  photoUrl: string;
  /** Session time (ISO 8601 format) */
  sessionTime?: string;
  /** Social media connections */
  socialLinks?: SocialLinks;
}

/**
 * Event structure with all required fields
 */
export interface Event {
  /** Unique Firestore ID */
  id?: string;
  /** Event title/name */
  title: string;
  /** ISO 8601 event date */
  date: string;
  /** Event sessions */
  sessions: {
    /** Technical talk session */
    talk: Session;
    /** Interview session */
    interview: Session;
  };
  /** List of speakers */
  speakers: Speaker[];
  /** Metadata */
  meta?: {
    /** Firebase user ID of creator */
    createdBy?: string;
    /** ISO 8601 creation timestamp */
    createdAt?: string;
    /** ISO 8601 update timestamp */
    updatedAt?: string;
  };
}

/**
 * API response format
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: string[];
  };
};

/**
 * Modal component props
 */
export interface ModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
}

/**
 * User authentication type
 */
export interface User {
  /** Firebase UID */
  uid: string;
  /** Email address */
  email?: string;
  /** Display name */
  displayName?: string;
  /** Profile photo URL */
  photoURL?: string;
}

/**
 * Form input types for event editing
 */
export type EventFormData = Pick<Event, 
  'title' | 'date' | 'sessions' | 'speakers'
>;

/**
 * Type guard for Event validation
 */
export function isEvent(data: unknown): data is Event {
  const candidate = data as Event;
  return (
    typeof candidate?.title === 'string' &&
    typeof candidate?.date === 'string' &&
    typeof candidate?.sessions?.talk === 'object' &&
    typeof candidate?.sessions?.interview === 'object' &&
    Array.isArray(candidate?.speakers)
  );
}