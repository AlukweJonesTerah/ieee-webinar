// import { NextApiRequest, NextApiResponse } from 'next';
// import { adminDb } from '../../lib/firebase-admin';
// import { Event } from '../../types/events';
// import { verifyIdToken } from '../../lib/firebase-auth';

// // Initialize Firebase Admin SDK (needs proper setup)
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   // Set CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

//   // Handle preflight request
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   try {
//     // Authentication middleware
//     const token = req.headers.authorization?.split('Bearer ')[1];
//     const user = token ? await verifyIdToken(token) : null;

//     switch (req.method) {
//       case 'GET':
//         return handleGetEvents(req, res);
//       case 'POST':
//       case 'PUT':
//       case 'DELETE':
//         if (!user) return res.status(401).json({ error: 'Unauthorized' });
//         return handleModifyEvents(req, res, user.uid, req.method);
//       default:
//         res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//         return res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
//   } catch (error) {
//     console.error('API Error:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// async function handleGetEvents(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const { eventId } = req.query;
    
//     if (eventId) {
//       // Get single event
//       const doc = await adminDb.collection('events').doc(eventId as string).get();
//       if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
      
//       return res.status(200).json({
//         id: doc.id,
//         ...doc.data()
//       });
//     }

//     // Get all events
//     const snapshot = await adminDb.collection('events').get();
//     const events = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));

//     return res.status(200).json(events);
//   } catch (error) {
//     throw new Error('Failed to fetch events');
//   }
// }

// async function handleModifyEvents(
//   req: NextApiRequest,
//   res: NextApiResponse,
//   userId: string,
//   method: string
// ) {
//   try {
//     const { id } = req.query;
//     const eventData: Partial<Event> = req.body;

//     // Validation
//     if (method !== 'DELETE' && !validateEventData(eventData)) {
//       return res.status(400).json({ error: 'Invalid event data' });
//     }

//     const eventsRef = adminDb.collection('events');

//     switch (method) {
//       case 'POST':
//         const newDoc = await eventsRef.add({
//           ...eventData,
//           createdBy: userId,
//           createdAt: new Date().toISOString()
//         });
//         return res.status(201).json({ id: newDoc.id });

//       case 'PUT':
//         if (!id) return res.status(400).json({ error: 'Missing event ID' });
//         await eventsRef.doc(id as string).update({
//           ...eventData,
//           updatedAt: new Date().toISOString()
//         });
//         return res.status(200).json({ success: true });

//       case 'DELETE':
//         if (!id) return res.status(400).json({ error: 'Missing event ID' });
//         await eventsRef.doc(id as string).delete();
//         return res.status(200).json({ success: true });

//       default:
//         return res.status(405).end();
//     }
//   } catch (error) {
//     throw new Error(`Failed to ${method} event`);
//   }
// }

// function validateEventData(data: Partial<Event>): boolean {
//   const requiredFields = ['title', 'date', 'sessions', 'speakers'];
//   return requiredFields.every(field => data[field as keyof Event] !== undefined);
// }