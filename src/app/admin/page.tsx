'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '../components/admin/AuthGuard';
import EventForm, { EventFields } from '../components/admin/EventForm';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, getDocs, deleteDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeftOnRectangleIcon, HomeIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// INTERNAL TYPES

interface Speaker {
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  sessionTime: Date | null;
  sessionId?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface Session {
  title: string;
  description: string;
  time: Date | null;
}

interface Sessions {
  talk: Session;
  interview: Session;
}

interface Event {
  id: string;
  title: string;
  date: Date | null;
  sessions: Sessions;
  speakers: Speaker[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// This interface describes the Firestore document structure.
interface FirestoreEvent {
  title: string;
  date: { toDate(): Date } | null;
  sessions: {
    talk: {
      title: string;
      description: string;
      time: { toDate(): Date } | null;
    };
    interview: {
      title: string;
      description: string;
      time: { toDate(): Date } | null;
    };
  };
  speakers: {
    name: string;
    role: string;
    bio: string;
    photoUrl?: string;
    sessionTime: { toDate(): Date } | null;
    sessionId?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }[];
  createdBy?: string;
  createdAt?: { toDate(): Date };
  updatedAt?: { toDate(): Date };
}

// HELPER FUNCTIONS

// Converts an internal Event (with Date fields) into a Partial<EventFields> for the form (using string dates)
const convertEventToEventFields = (event: Event): Partial<EventFields> => ({
  id: event.id,
  title: event.title,
  date: event.date ? event.date.toISOString().slice(0, 16) : '',
  sessions: {
    talk: {
      title: event.sessions.talk.title,
      description: event.sessions.talk.description,
      time: event.sessions.talk.time ? event.sessions.talk.time.toISOString().slice(0, 16) : ''
    },
    interview: {
      title: event.sessions.interview.title,
      description: event.sessions.interview.description,
      time: event.sessions.interview.time ? event.sessions.interview.time.toISOString().slice(0, 16) : ''
    }
  },
  speakers: event.speakers.map(speaker => ({
    name: speaker.name,
    role: speaker.role,
    bio: speaker.bio,
    photoUrl: speaker.photoUrl || '',
    sessionTime: speaker.sessionTime ? speaker.sessionTime.toISOString().slice(0, 16) : '',
    socialLinks: speaker.socialLinks || {}
  }))
});

// Converts EventFields (with string dates) into an internal Event (with Date objects)
const convertEventFieldsToEvent = (data: EventFields, id: string, createdBy: string): Event => ({
  id,
  title: data.title,
  date: data.date ? new Date(data.date) : null,
  sessions: {
    talk: {
      title: data.sessions.talk.title,
      description: data.sessions.talk.description,
      time: data.sessions.talk.time ? new Date(data.sessions.talk.time) : null
    },
    interview: {
      title: data.sessions.interview.title,
      description: data.sessions.interview.description,
      time: data.sessions.interview.time ? new Date(data.sessions.interview.time) : null
    }
  },
  speakers: data.speakers.map(speaker => ({
    name: speaker.name,
    role: speaker.role,
    bio: speaker.bio,
    photoUrl: speaker.photoUrl,
    sessionTime: speaker.sessionTime ? new Date(speaker.sessionTime) : null,
    sessionId: speaker.sessionId,
    socialLinks: speaker.socialLinks
  })),
  createdBy,
  createdAt: new Date(),
  updatedAt: new Date()
});

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // Load events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreEvent;
          return {
            id: doc.id,
            title: data.title,
            date: data.date ? data.date.toDate() : null,
            sessions: {
              talk: {
                title: data.sessions.talk.title,
                description: data.sessions.talk.description,
                time: data.sessions.talk.time ? data.sessions.talk.time.toDate() : null
              },
              interview: {
                title: data.sessions.interview.title,
                description: data.sessions.interview.description,
                time: data.sessions.interview.time ? data.sessions.interview.time.toDate() : null
              }
            },
            speakers: data.speakers.map((speaker: FirestoreEvent["speakers"][number]) => ({
              name: speaker.name,
              role: speaker.role || '',
              bio: speaker.bio,
              photoUrl: speaker.photoUrl,
              sessionTime: speaker.sessionTime ? speaker.sessionTime.toDate() : null,
              sessionId: speaker.sessionId,
              socialLinks: speaker.socialLinks
            })),
            createdBy: data.createdBy,
            createdAt: data.createdAt ? data.createdAt.toDate() : undefined,
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined
          } as Event;
        });
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (eventData: EventFields) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const createTimestamp = (
        dateValue: Date | null | undefined | string | { toDate(): Date }
      ) => {
        if (!dateValue) return null;
        if (dateValue instanceof Date) {
          return Timestamp.fromDate(dateValue);
        }
        if (typeof dateValue === 'string') {
          const d = new Date(dateValue);
          if (isNaN(d.getTime())) {
            throw new Error(`Invalid date: ${dateValue}`);
          }
          return Timestamp.fromDate(d);
        }
        if (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function') {
          return dateValue;
        }
        throw new Error(`Unsupported date format: ${String(dateValue)}`);
      };

      const eventPayload = {
        title: eventData.title,
        date: createTimestamp(eventData.date),
        sessions: {
          talk: {
            title: eventData.sessions.talk.title,
            description: eventData.sessions.talk.description,
            time: createTimestamp(eventData.sessions.talk.time)
          },
          interview: {
            title: eventData.sessions.interview.title,
            description: eventData.sessions.interview.description,
            time: createTimestamp(eventData.sessions.interview.time)
          }
        },
        speakers: eventData.speakers.map(speaker => ({
          name: speaker.name,
          role: speaker.role,
          bio: speaker.bio,
          photoUrl: speaker.photoUrl || '',
          sessionTime: createTimestamp(speaker.sessionTime),
          sessionId: speaker.sessionId || '',
          socialLinks: speaker.socialLinks || {}
        })),
        updatedAt: Timestamp.now()
      };

      if (selectedEvent) {
        await updateDoc(doc(db, 'events', selectedEvent), eventPayload);
        setEvents(prev =>
          prev.map(event =>
            event.id === selectedEvent
              ? {
                  ...event,
                  title: eventData.title,
                  date: eventData.date ? new Date(eventData.date) : null,
                  sessions: {
                    talk: {
                      title: eventData.sessions.talk.title,
                      description: eventData.sessions.talk.description,
                      time: eventData.sessions.talk.time ? new Date(eventData.sessions.talk.time) : null
                    },
                    interview: {
                      title: eventData.sessions.interview.title,
                      description: eventData.sessions.interview.description,
                      time: eventData.sessions.interview.time ? new Date(eventData.sessions.interview.time) : null
                    }
                  },
                  speakers: eventData.speakers.map(speaker => ({
                    name: speaker.name,
                    role: speaker.role,
                    bio: speaker.bio,
                    photoUrl: speaker.photoUrl,
                    sessionTime: speaker.sessionTime ? new Date(speaker.sessionTime) : null,
                    sessionId: speaker.sessionId,
                    socialLinks: speaker.socialLinks
                  })),
                  updatedAt: new Date()
                }
              : event
          )
        );
        setSuccessMessage('Event updated successfully!');
      } else {
        const newDocRef = await addDoc(collection(db, 'events'), {
          ...eventPayload,
          createdBy: user.uid,
          createdAt: Timestamp.now()
        });
        const newEvent = convertEventFieldsToEvent(eventData, newDocRef.id, user.uid);
        setEvents(prev => [...prev, newEvent]);
        setSuccessMessage('Event created successfully!');
      }

      setSelectedEvent(null);
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Operation error:', error);
      setSuccessMessage(error instanceof Error ? error.message : 'Error processing request');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setSuccessMessage('Event deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Delete error:', error);
        setSuccessMessage('Error deleting event');
      }
    }
  };

  const handleHome = () => router.push('/');
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const selectedEventData: Partial<EventFields> | undefined =
    selectedEvent && events.find(e => e.id === selectedEvent)
      ? convertEventToEventFields(events.find(e => e.id === selectedEvent)!)
      : undefined;

  return (
    <AuthGuard adminOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-ieee-blue">IEEE Event Manager</h1>
            <div className="flex gap-4">
              <button onClick={handleHome} className="flex items-center gap-2 text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                <HomeIcon className="h-6 w-6" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className={`p-4 mb-6 rounded-lg ${successMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {successMessage}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-ieee-blue mb-4">Current Events</h2>
            <div className="grid gap-4">
              {events.map(event => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {event.date
                          ? event.date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Date not available'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event.id);
                          setEditMode(true);
                        }}
                        className="text-ieee-blue hover:text-ieee-blue-dark"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-ieee-blue mb-6">
              {editMode ? 'Edit Event' : 'Create New Event'}
            </h2>
            <EventForm
              onSubmit={handleSubmit}
              initialData={selectedEventData}
              editMode={editMode}
              onCancel={() => {
                setEditMode(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
