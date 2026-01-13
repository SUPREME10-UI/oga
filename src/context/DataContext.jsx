import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';


const DataContext = createContext();

export function DataProvider({ children }) {
    const [jobs, setJobs] = useState([]);
    const [labourers, setLabourers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [globalChats, setGlobalChats] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState(() => {
        try {
            const saved = localStorage.getItem('oga_blocked_users');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error parsing oga_blocked_users:', e);
            return [];
        }
    });

    // Initialize Firestore Listeners
    useEffect(() => {
        const qJobs = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const unsubJobs = onSnapshot(qJobs, (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qLabs = query(collection(db, 'users'), where('type', '==', 'labourer'));
        const unsubLabs = onSnapshot(qLabs, (snapshot) => {
            setLabourers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qApps = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qNotifs = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qChats = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
        const unsubChats = onSnapshot(qChats, (snapshot) => {
            setGlobalChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubJobs();
            unsubLabs();
            unsubApps();
            unsubNotifs();
            unsubChats();
        };
    }, []);

    // Simplified Data Management (No demo repair)

    const addJob = async (jobData, hirerId, hirerName) => {
        try {
            const newJob = {
                ...jobData,
                hirerId,
                hirerName,
                status: 'Active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                date: new Date().toLocaleDateString()
            };
            const docRef = await addDoc(collection(db, 'jobs'), newJob);
            return { id: docRef.id, ...newJob };
        } catch (error) {
            console.error("Error adding job:", error);
            throw error;
        }
    };

    const updateJob = async (id, updatedData) => {
        try {
            const jobRef = doc(db, 'jobs', id);
            await updateDoc(jobRef, { ...updatedData, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    };

    const deleteJob = async (id) => {
        try {
            await deleteDoc(doc(db, 'jobs', id));
        } catch (error) {
            console.error("Error deleting job:", error);
            throw error;
        }
    };

    const addLabourer = async (labourer) => {
        // Labourers are now synced directly from the users collection
        return labourer;
    };

    const applyForJob = async (jobId, labourerId, labourerName, hirerId, jobTitle) => {
        try {
            const newApp = {
                jobId,
                labourerId,
                labourerName,
                hirerId,
                jobTitle,
                status: 'Pending',
                createdAt: serverTimestamp(),
                date: new Date().toLocaleDateString()
            };
            const appRef = await addDoc(collection(db, 'applications'), newApp);
            await addNotification(hirerId, 'application', `New application from ${labourerName} for "${jobTitle}"`, { jobId, labourerId, applicationId: appRef.id });
            return { id: appRef.id, ...newApp };
        } catch (error) {
            console.error("Error applying for job:", error);
            throw error;
        }
    };

    const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
            const appRef = doc(db, 'applications', applicationId);
            await updateDoc(appRef, { status: newStatus, updatedAt: serverTimestamp() });

            const app = applications.find(a => a.id === applicationId);
            if (app) {
                if (newStatus === 'Completed') {
                    await addNotification(app.hirerId, 'job_completed', `Labourer ${app.labourerName} has marked the job "${app.jobTitle}" as completed.`, { jobId: app.jobId, applicationId });
                } else {
                    await addNotification(app.labourerId, 'status_update', `Your application for "${app.jobTitle}" was ${newStatus.toLowerCase()}`, { applicationId, status: newStatus });
                }
            }
        } catch (error) {
            console.error("Error updating application status:", error);
        }
    };

    const addNotification = async (userId, type, message, data = {}) => {
        try {
            const newNotif = {
                userId,
                type,
                message,
                data,
                read: false,
                createdAt: serverTimestamp(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const docRef = await addDoc(collection(db, 'notifications'), newNotif);
            return { id: docRef.id, ...newNotif };
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const sendGlobalMessage = async (senderId, recipientId, messageText = '', senderName = '', recipientName = '', messageType = 'text', attachment = null) => {
        try {
            const newMessage = {
                text: messageText,
                senderId,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString(),
                createdAt: serverTimestamp(),
                type: messageType,
                attachment: attachment || null,
                readBy: [senderId]
            };

            const chat = globalChats.find(c => c.participants.includes(senderId) && c.participants.includes(recipientId));

            if (chat) {
                const chatRef = doc(db, 'chats', chat.id);
                const updatedMessages = [...chat.messages, newMessage];
                await updateDoc(chatRef, {
                    messages: updatedMessages,
                    lastMsg: messageType === 'text' ? messageText : (messageType === 'image' ? 'Image' : 'Attachment'),
                    updatedAt: serverTimestamp(),
                    time: "Just now"
                });
            } else {
                const newChat = {
                    participants: [senderId, recipientId],
                    names: { [senderId]: senderName, [recipientId]: recipientName },
                    messages: [newMessage],
                    lastMsg: messageType === 'text' ? messageText : (messageType === 'image' ? 'Image' : 'Attachment'),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    time: "Just now"
                };
                await addDoc(collection(db, 'chats'), newChat);
            }

            await addNotification(recipientId, 'message', `New message from ${senderName}`, { senderId, type: 'message' });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const markChatAsRead = async (chatId, userId) => {
        try {
            const chat = globalChats.find(c => c.id === chatId);
            if (!chat) return;

            const updatedMessages = chat.messages.map(m => {
                const readBy = m.readBy || [];
                if (!readBy.includes(userId)) return { ...m, readBy: [...readBy, userId] };
                return m;
            });

            await updateDoc(doc(db, 'chats', chatId), { messages: updatedMessages });
        } catch (error) {
            console.error("Error marking chat as read:", error);
        }
    };

    const clearChatMessages = async (chatId) => {
        try {
            await updateDoc(doc(db, 'chats', chatId), { messages: [], lastMsg: '', updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await deleteDoc(doc(db, 'chats', chatId));
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const toggleMuteChat = async (chatId) => {
        try {
            const chat = globalChats.find(c => c.id === chatId);
            if (chat) {
                await updateDoc(doc(db, 'chats', chatId), { muted: !chat.muted });
            }
        } catch (error) {
            console.error("Error muting chat:", error);
        }
    };

    const updateLabourerAvailability = async (labourerId, status, note) => {
        try {
            await updateDoc(doc(db, 'users', labourerId), {
                availabilityStatus: status,
                availabilityNote: note,
                statusUpdateTime: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating availability:", error);
        }
    };

    const updateLabourerProfile = async (labourerId, updates) => {
        try {
            await updateDoc(doc(db, 'users', labourerId), { ...updates, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error("Error updating labourer profile:", error);
        }
    };

    const addReview = async (labourerId, reviewData) => {
        try {
            // 1. Add review to subcollection
            await addDoc(collection(db, 'users', labourerId, 'reviews'), {
                ...reviewData,
                createdAt: serverTimestamp(),
                date: new Date().toLocaleDateString()
            });

            // 2. Update stats on main user doc
            const labourerRef = doc(db, 'users', labourerId);
            const labourerDoc = await getDoc(labourerRef);

            if (labourerDoc.exists()) {
                const data = labourerDoc.data();
                const currentRating = data.rating || 0;
                const currentCount = data.reviewCount || 0;

                // Calculate new average
                const newCount = currentCount + 1;
                const totalScore = (currentRating * currentCount) + reviewData.rating;
                const newRating = Number((totalScore / newCount).toFixed(1));

                await updateDoc(labourerRef, {
                    rating: newRating,
                    reviewCount: newCount,
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    };

    const blockUser = (userId) => {
        setBlockedUsers(prev => {
            if (prev.includes(userId)) return prev;
            return [...prev, userId];
        });
    };

    // Persistence for blockedUsers (since it's not yet in Firestore)
    useEffect(() => {
        localStorage.setItem('oga_blocked_users', JSON.stringify(blockedUsers));
    }, [blockedUsers]);

    return (
        <DataContext.Provider value={{
            jobs, labourers, applications, notifications, globalChats, blockedUsers,
            addJob, updateJob, deleteJob, addLabourer,
            applyForJob, updateApplicationStatus, addNotification, markNotificationAsRead,
            updateLabourerAvailability, updateLabourerProfile, sendGlobalMessage, markChatAsRead,
            clearChatMessages, deleteChat, toggleMuteChat, blockUser, addReview
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within a DataProvider');
    return ctx;
}