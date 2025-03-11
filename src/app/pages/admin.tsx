import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminPanel() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        sessions: { talk: '', interview: '' }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(getAuth(), email, password);
        } catch {
            setError('Invalid credentials');
        }
    };

    const handleUpdateEvent = async () => {
        try {
            await updateDoc(doc(db, 'events', 'current'), eventData);
            alert('Event updated successfully!');
        } catch {
            alert('Error updating event');
        }
    };

    if (!getAuth().currentUser) {
        return (
            <div className='max-w-md mx-auto mt-10'>
                <form onSubmit={handleLogin} className='space-y-4'>
                    <input
                        type='email'
                        placeholder='Admin email'
                        className='w-full p-2 border'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        className='w-full p-2 border'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className='text-red-500'>{error}</p>}
                    <button
                        type='submit'
                        className='w-full bg-ieee-blue text-white p-2 rounded hover:bg-blue-600'
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className='container mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Event Editor</h2>
            <div className='space-y-4'>
                <input
                    placeholder='Event Title'
                    className='w-full p-2 border'
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                />
                <textarea
                    placeholder="Talk Session Details"
                    className='w-full p-2 border'
                    value={eventData.sessions.talk}
                    onChange={(e) => setEventData({
                        ...eventData,
                        sessions: { ...eventData.sessions, talk: e.target.value }
                    })}
                ></textarea>
                {/* Add more input fields for other event data */}

                <button
                    onClick={handleUpdateEvent}
                    className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
