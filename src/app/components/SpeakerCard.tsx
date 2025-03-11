import { useState } from 'react';
import Image from 'next/image';
import { Modal } from './Modal';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

interface SpeakerProps {
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

// Helper function to handle different timestamp formats
const formatSessionTime = (sessionTime: SpeakerProps['sessionTime']) => {
  if (!sessionTime) return null;
  
  let date: Date | null = null;
  
  if (sessionTime instanceof Timestamp) {
    date = sessionTime.toDate();
  } else if (typeof sessionTime === 'object' && 'seconds' in sessionTime) {
    date = new Date(sessionTime.seconds * 1000);
  } else if (typeof sessionTime === 'string') {
    date = new Date(sessionTime);
    if (isNaN(date.getTime())) return null;
  }
  
  return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
};

// Helper to check if the URL appears to be a direct image link
const isValidImageUrl = (url: string): boolean => {
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i.test(url);
}

export default function SpeakerCard({
  name,
  role,
  bio,
  photoUrl,
  sessionTime,
  socialLinks
}: SpeakerProps) {
  const [isBioOpen, setIsBioOpen] = useState(false);
  const formattedTime = formatSessionTime(sessionTime);

  const imageSrc = photoUrl && isValidImageUrl(photoUrl)
    ? photoUrl
    : '/default-speaker.jpg'; // Make sure this image exists in your public folder


  return (
    <>
      <div className="relative bg-gradient-to-br from-ieee-blue/5 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
        {/* Session Time Badge */}
        {formattedTime && (
          <div className="absolute -top-3 right-4 bg-ieee-blue text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
            {formattedTime}
          </div>
        )}

        <div className="flex gap-5 items-start">
          {/* Speaker Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-ieee-blue/20 group-hover:border-ieee-blue transition-colors">
            <Image
              src={imageSrc}
              alt={name}
              width={96}
              height={96}
              className="object-cover transform group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Speaker Details */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-xl font-bold text-ieee-blue">{name}</h3>
              <p className="text-gray-600 text-sm font-medium">{role}</p>
            </div>

            <p className="text-gray-700 line-clamp-2 text-sm leading-relaxed">
              {bio}
            </p>

            {/* Social Links */}
            {socialLinks && (
              <div className="flex gap-3 pt-2">
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                    className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                    <FaGithub className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.website && (
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                    className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                    <GlobeAltIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Read More Button */}
        <button 
          onClick={() => setIsBioOpen(true)}
          className="absolute bottom-4 right-4 text-ieee-blue hover:text-ieee-blue-dark text-sm font-medium flex items-center gap-1"
        >
          Read More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bio Modal */}
      <Modal isOpen={isBioOpen} onClose={() => setIsBioOpen(false)}>
        <div className="p-6 max-w-2xl">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-ieee-blue/20">
              <Image
                src={imageSrc}
                alt={name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-ieee-blue mb-2">{name}</h2>
              <p className="text-gray-600 font-medium mb-4">{role}</p>
              
              {formattedTime && (
                <p className="text-sm text-gray-500 mb-4">
                  Session: {formattedTime}
                </p>
              )}
              
              <p className="text-gray-700 leading-relaxed">{bio}</p>
              
              {/* Social Links in Modal */}
              {socialLinks && (
                <div className="flex gap-4 mt-6">
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                      <FaLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                      <FaTwitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                      className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                      <FaGithub className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="text-ieee-blue hover:text-ieee-blue-dark transition-colors">
                      <GlobeAltIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}