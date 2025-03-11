export interface Event {
    id?: string;
    title: string;
    date: string;
    sessions: {
        talk: Session;
        interview: Session;
    };
    speakers: Speaker[];
}

interface Session {
    title: string;
    description: string;
    time: string;
}

interface Speaker {
    name: string;
    bio: string;
    phototUrl: string;
}