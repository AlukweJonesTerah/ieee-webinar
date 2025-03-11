"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import SpeakerCard from '../app/components/SpeakerCard';
import { format } from 'date-fns';

// Define types
interface Speaker {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  sessionTime?: string | Timestamp | { seconds: number, nanoseconds: number };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

interface Session {
  title: string;
  description: string;
  time: string | Timestamp | { seconds: number, nanoseconds: number };
}

interface Sessions {
  talk: Session;
  interview: Session;
}

interface EventMeta {
  createdAt: string;
  [key: string]: unknown; // Changed from any to unknown
}

interface Event {
  id: string;
  title: string;
  date: string | Timestamp | { seconds: number, nanoseconds: number };
  sessions: Sessions;
  speakers: Speaker[];
  meta?: EventMeta;
}

type DateInput = Timestamp | { seconds: number; nanoseconds: number } | string | number | null | undefined;

const convertToDate = (date: DateInput) => {
  if (!date) return null;

  if (date instanceof Timestamp) {
    return date.toDate();
  }

  if (typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }

  if (typeof date === 'string' || typeof date === 'number') {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
};

export default function HomePage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        // Query to get the latest event based on the date
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          orderBy('date', 'desc'), // Fetch the newest event first
          limit(1) // Only get one event
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const eventData = docData.data() as Omit<Event, 'id'>;
          
          // Process the event data
          setEvent({
            ...eventData,
            id: docData.id,
            date: eventData.date,
            sessions: {
              talk: {
                ...eventData.sessions.talk,
                time: eventData.sessions.talk.time
              },
              interview: {
                ...eventData.sessions.interview,
                time: eventData.sessions.interview.time
              }
            },
            speakers: eventData.speakers.map(speaker => ({
              ...speaker,
              sessionTime: speaker.sessionTime
            })),
            meta: {
              ...eventData.meta,
              createdAt: eventData.meta?.createdAt || new Date().toISOString()
            }
          });
        } else {
          setError('No upcoming events found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEvent();
  }, []);

  const eventDate = convertToDate(event?.date);
  const talkTime = convertToDate(event?.sessions?.talk?.time);
  const interviewTime = convertToDate(event?.sessions?.interview?.time);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-ieee-blue"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-ieee-blue mb-4">IEEE Webinar</h1>
          <p className="text-gray-600 text-xl">{error || 'Please check back later for upcoming events'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-ieee-blue/5 to-white">
        <section className="bg-ieee-blue text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            <div className="text-xl mb-8">
              {eventDate ? format(eventDate, 'EEEE, MMMM do yyyy @ h:mm a') : 'Date not available'}
            </div>
            <a 
              href="#register" 
              className="inline-block bg-white text-ieee-blue px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all"
            >
              Register Now
            </a>
          </div>
        </section>

        <section className="py-16 max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-ieee-blue mb-4">
                {event.sessions.talk.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {event.sessions.talk.description}
              </p>
              <div className="text-ieee-blue font-medium">
                {talkTime ? format(talkTime, 'h:mm a') : 'Time not available'}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-ieee-blue mb-4">
                {event.sessions.interview.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {event.sessions.interview.description}
              </p>
              <div className="text-ieee-blue font-medium">
                {interviewTime ? format(interviewTime, 'h:mm a') : 'Time not available'}
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ieee-blue mb-8">
              Featured Speakers
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {event.speakers && event.speakers.map((speaker, index) => (
                <SpeakerCard
                  key={`${speaker.name}-${index}`}
                  {...speaker}
                />
              ))}
            </div>
          </div>

          <section id="register" className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-ieee-blue mb-4">
              Reserve Your Spot
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join industry leaders and community members for this exclusive webinar. 
              Registration is free for IEEE members!
            </p>
            <div className="space-y-4 max-w-xs mx-auto">
              <a
                href=" https://docs.google.com/forms/d/e/1FAIpQLSfoR6OH0J3_hP4tWf1Dc8anDO_YF4wQTjx8EY-KCNL7jb-uYw/viewform "
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-ieee-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-ieee-blue-dark transition-colors"
              >
                Register Now
              </a>
              <p className="text-sm text-gray-500">
                IEEE Members: Use your member ID for priority access
              </p>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}