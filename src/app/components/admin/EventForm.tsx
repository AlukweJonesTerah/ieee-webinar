'use client';

import { useState, useEffect } from 'react';
import { uploadImage } from '../../lib/storage';

export interface SessionField {
  title: string;
  description: string;
  time?: string;
}

export interface SpeakerFields {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  sessionTime: string;
  sessionId?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface EventFields {
  id?: string;
  title: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
  sessions: {
    talk: SessionField;  // ✅ Use 'SessionField' instead
    interview: SessionField; // ✅ Use 'SessionField' instead
  };
  speakers: SpeakerFields[]; // ✅ Use 'SpeakerFields' instead
}


interface EventFormProps {
  onSubmit: (data: EventFields) => Promise<void>;
  initialData?: Partial<EventFields>;
  editMode?: boolean;
  onCancel?: () => void;
}

export default function EventForm({ 
  onSubmit, 
  initialData, 
  editMode = false,
  onCancel 
}: EventFormProps) {
  const [eventData, setEventData] = useState<EventFields>({
    title: '',
    date: '',
    sessions: {
      talk: { title: '', description: '', time: '' },
      interview: { title: '', description: '', time: '' }
    },
    speakers: [] as SpeakerFields[]
  });

  // Initialize form
  useEffect(() => {
    if (initialData) {
      const parseFirestoreTime = (timestamp: unknown): string => {
        // Check if it's a Firestore Timestamp
        if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toISOString().slice(0, 16);
        }
        // Handle JS Date objects
        if (timestamp instanceof Date) {
          return timestamp.toISOString().slice(0, 16);
        }
        // If it's already a string with correct format, return it
        if (typeof timestamp === 'string' && timestamp.includes('T')) {
          return timestamp;
        }
        return '';
      };

      console.log("Setting initial data:", initialData); // Add this for debugging

      setEventData({
        title: initialData.title || '',
        date: parseFirestoreTime(initialData.date),
        sessions: {
          talk: {
            title: initialData.sessions?.talk?.title || '',
            description: initialData.sessions?.talk?.description || '',
            time: parseFirestoreTime(initialData.sessions?.talk?.time)
          },
          interview: {
            title: initialData.sessions?.interview?.title || '',
            description: initialData.sessions?.interview?.description || '',
            time: parseFirestoreTime(initialData.sessions?.interview?.time)
          }
        },
        speakers: (initialData.speakers || []).map((speaker: Partial<SpeakerFields>) => ({
          name: speaker.name || '',
          role: speaker.role || '',
          bio: speaker.bio || '',
          photoUrl: speaker.photoUrl || '',
          sessionTime: parseFirestoreTime(speaker.sessionTime),
          socialLinks: speaker.socialLinks || {}
        }))
      });
    }
  }, [initialData]);

  const addSpeaker = () => {
    setEventData(prev => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        {
          name: '',
          role: '',
          bio: '',
          photoUrl: '',
          sessionTime: '',
          socialLinks: {}
        }
      ]
    }));
  };

  const removeSpeaker = (index: number) => {
    setEventData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    // Basic validation
    if (!eventData.title.trim()) return false;
    if (!eventData.date) return false;
    
    // Sessions validation
    if (!eventData.sessions.talk.title.trim() || 
        !eventData.sessions.talk.time ||
        !eventData.sessions.talk.description.trim()) return false;
        
    if (!eventData.sessions.interview.title.trim() || 
        !eventData.sessions.interview.time ||
        !eventData.sessions.interview.description.trim()) return false;
    
    // Speakers validation (only if there are speakers)
    if (eventData.speakers.length > 0) {
      for (const speaker of eventData.speakers) {
        if (!speaker.name.trim() || !speaker.sessionTime) return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSubmit(eventData);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
    >
      {/* Event Basics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ieee-blue">Event Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title
          </label>
          <input
            value={eventData.title}
            onChange={e => setEventData({ ...eventData, title: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date
          </label>
          <input
            type="datetime-local"
            value={eventData.date}
            onChange={e => setEventData({ ...eventData, date: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>
      </div>

      {/* Talk Session */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ieee-blue">Talk Session</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            value={eventData.sessions.talk.title}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                talk: { ...eventData.sessions.talk, title: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <input
            type="datetime-local"
            value={eventData.sessions.talk.time}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                talk: { ...eventData.sessions.talk, time: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={eventData.sessions.talk.description}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                talk: { ...eventData.sessions.talk, description: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>
      </div>

      {/* Interview Session */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ieee-blue">Interview Session</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            value={eventData.sessions.interview.title}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                interview: { ...eventData.sessions.interview, title: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <input
            type="datetime-local"
            value={eventData.sessions.interview.time}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                interview: { ...eventData.sessions.interview, time: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={eventData.sessions.interview.description}
            onChange={e => setEventData({
              ...eventData,
              sessions: {
                ...eventData.sessions,
                interview: { ...eventData.sessions.interview, description: e.target.value }
              }
            })}
            className="w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-ieee-blue"
            required
          />
        </div>
      </div>

      {/* Speakers Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-ieee-blue">Speakers</h2>
          <button
            type="button"
            onClick={addSpeaker}
            className="bg-ieee-blue text-white px-4 py-2 rounded-md hover:bg-ieee-blue-dark"
          >
            Add Speaker
          </button>
        </div>

        {eventData.speakers.map((speaker, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Speaker #{index + 1}</h3>
              <button
                type="button"
                onClick={() => removeSpeaker(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speaker Name
                </label>
                <input
                  value={speaker.name}
                  onChange={e => {
                    const newSpeakers = [...eventData.speakers];
                    newSpeakers[index].name = e.target.value;
                    setEventData({ ...eventData, speakers: newSpeakers });
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Title
                </label>
                <input
                  value={speaker.role}
                  onChange={e => {
                    const newSpeakers = [...eventData.speakers];
                    newSpeakers[index].role = e.target.value;
                    setEventData({ ...eventData, speakers: newSpeakers });
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Time
                </label>
                <input
                  type="datetime-local"
                  value={speaker.sessionTime}
                  onChange={e => {
                    const newSpeakers = [...eventData.speakers];
                    newSpeakers[index].sessionTime = e.target.value;
                    setEventData({ ...eventData, speakers: newSpeakers });
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const fileUrl = await uploadImage(e.target.files[0]);
                      const updatedSpeakers = [...eventData.speakers];
                      updatedSpeakers[index].photoUrl = fileUrl;
                      setEventData({ ...eventData, speakers: updatedSpeakers });
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                />

                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={speaker.photoUrl}
                  onChange={(e) => {
                    const updatedSpeakers = [...eventData.speakers];
                    updatedSpeakers[index].photoUrl = e.target.value;
                    setEventData({ ...eventData, speakers: updatedSpeakers });
                  }}
                  className="w-full p-2 border rounded-md"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biography
                </label>
                <textarea
                  value={speaker.bio}
                  onChange={e => {
                    const newSpeakers = [...eventData.speakers];
                    newSpeakers[index].bio = e.target.value;
                    setEventData({ ...eventData, speakers: newSpeakers });
                  }}
                  className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-ieee-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links
                </label>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                  <input
                    value={speaker.socialLinks.linkedin || ''}
                    onChange={e => {
                      const newSpeakers = [...eventData.speakers];
                      newSpeakers[index].socialLinks = {
                        ...newSpeakers[index].socialLinks,
                        linkedin: e.target.value
                      };
                      setEventData({ ...eventData, speakers: newSpeakers });
                    }}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                  <input
                    value={speaker.socialLinks.twitter || ''}
                    onChange={e => {
                      const newSpeakers = [...eventData.speakers];
                      newSpeakers[index].socialLinks = {
                        ...newSpeakers[index].socialLinks,
                        twitter: e.target.value
                      };
                      setEventData({ ...eventData, speakers: newSpeakers });
                    }}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Website</label>
                  <input
                    value={speaker.socialLinks.website || ''}
                    onChange={e => {
                      const newSpeakers = [...eventData.speakers];
                      newSpeakers[index].socialLinks = {
                        ...newSpeakers[index].socialLinks,
                        website: e.target.value
                      };
                      setEventData({ ...eventData, speakers: newSpeakers });
                    }}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ieee-blue"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {editMode && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {editMode ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}