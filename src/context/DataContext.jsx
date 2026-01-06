import { createContext, useContext, useState, useEffect, useRef } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    // Initialize state from localStorage if available, else empty arrays
    // Initialize state from localStorage if available, else empty arrays
    const [jobs, setJobs] = useState(() => {
        try {
            const savedJobs = localStorage.getItem('oga_jobs');
            return savedJobs ? JSON.parse(savedJobs) : [];
        } catch (e) {
            console.error('Error parsing oga_jobs:', e);
            return [];
        }
    });

    const [labourers, setLabourers] = useState(() => {
        try {
            const savedLabourers = localStorage.getItem('oga_labourers');
            return savedLabourers ? JSON.parse(savedLabourers) : [];
        } catch (e) {
            console.error('Error parsing oga_labourers:', e);
            return [];
        }
    });

    const [applications, setApplications] = useState(() => {
        try {
            const savedApps = localStorage.getItem('oga_applications');
            return savedApps ? JSON.parse(savedApps) : [];
        } catch (e) {
            console.error('Error parsing oga_applications:', e);
            return [];
        }
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const savedNotifs = localStorage.getItem('oga_notifications');
            return savedNotifs ? JSON.parse(savedNotifs) : [];
        } catch (e) {
            console.error('Error parsing oga_notifications:', e);
            return [];
        }
    });

    const [globalChats, setGlobalChats] = useState(() => {
        try {
            const savedChats = localStorage.getItem('oga_shared_messages_v2');
            return savedChats ? JSON.parse(savedChats) : [];
        } catch (e) {
            console.error('Error parsing oga_shared_messages_v2:', e);
            return [];
        }
    });
    // Update localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('oga_jobs', JSON.stringify(jobs));
    }, [jobs]);

    useEffect(() => {
        localStorage.setItem('oga_labourers', JSON.stringify(labourers));
    }, [labourers]);

    useEffect(() => {
        localStorage.setItem('oga_applications', JSON.stringify(applications));
    }, [applications]);

    useEffect(() => {
        localStorage.setItem('oga_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('oga_shared_messages_v2', JSON.stringify(globalChats));
    }, [globalChats]);

    // Data Repair: Migrate legacy jobs to stable demo IDs
    const lastRepairedJobsRef = useRef(null);
    useEffect(() => {
        if (jobs.length === 0) return;
        
        // Check if we've already repaired this exact set of jobs
        const jobsKey = jobs.map(j => `${j.id}-${j.hirerId}`).join(',');
        if (lastRepairedJobsRef.current === jobsKey) return;
        
        const needsRepair = jobs.some(j => !j.hirerId || (j.hirerId.startsWith('demo-') && !j.hirerId.includes('-99')));
        if (!needsRepair) {
            lastRepairedJobsRef.current = jobsKey;
            return;
        }
        
        setJobs(prev => {
            const repaired = prev.map(job => {
                if (!job.hirerId && job.hirerName === 'Demo Hirer') return { ...job, hirerId: 'demo-hirer-99' };
                if (job.hirerId?.startsWith('demo-') && !job.hirerId.includes('-99')) return { ...job, hirerId: 'demo-hirer-99' };
                return job;
            });
            
            // Check if repair actually changed anything
            const hasChanges = prev.some((job, index) => {
                return job.hirerId !== repaired[index].hirerId;
            });
            
            if (hasChanges) {
                // Update ref with new jobs key after repair
                const repairedKey = repaired.map(j => `${j.id}-${j.hirerId}`).join(',');
                lastRepairedJobsRef.current = repairedKey;
                return repaired;
            }
            
            // No changes, mark as repaired
            lastRepairedJobsRef.current = jobsKey;
            return prev;
        });
    }, [jobs]);

    const addJob = (job, hirerId, hirerName) => {
        const newJob = {
            ...job,
            id: Date.now(),
            hirerId,
            hirerName,
            date: new Date().toLocaleDateString(), // Simple date format
            status: 'Active'
        };
        setJobs(prevJobs => [newJob, ...prevJobs]);
        return newJob;
    };

    const updateJob = (id, updatedData) => {
        setJobs(prevJobs => prevJobs.map(job =>
            job.id === id ? { ...job, ...updatedData } : job
        ));
    };

    const deleteJob = (id) => {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    };

    const addLabourer = (labourer) => {
        const newLabourer = {
            ...labourer,
            id: labourer.id || Date.now(),
            rating: labourer.rating || 0,
            reviewCount: labourer.reviewCount || 0,
            availabilityStatus: 'Available',
            availabilityNote: ''
        };
        setLabourers(prevLabourers => {
            const exists = prevLabourers.find(l => l.id === newLabourer.id);
            if (exists) return prevLabourers.map(l => l.id === newLabourer.id ? newLabourer : l);
            return [newLabourer, ...prevLabourers];
        });
        return newLabourer;
    };

    const applyForJob = (jobId, labourerId, labourerName, hirerId, jobTitle) => {
        const newApplication = {
            id: Date.now(),
            jobId,
            labourerId,
            labourerName,
            date: new Date().toLocaleDateString(),
            status: 'Pending'
        };
        setApplications(prev => [newApplication, ...prev]);

        // Add notification for hirer
        addNotification(hirerId, 'application', `New application from ${labourerName} for "${jobTitle}"`, { jobId, labourerId });

        return newApplication;
    };

    const updateApplicationStatus = (applicationId, newStatus) => {
        setApplications(prev => {
            const updated = prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            );

            // Add notification
            const app = updated.find(a => a.id === applicationId);
            if (app) {
                const hirerJob = jobs.find(j => j.id === app.jobId);

                if (newStatus === 'Completed') {
                    // Notify Hirer that job is completed
                    addNotification(hirerJob.hirerId, 'job_completed', `Labourer ${app.labourerName} has marked the job "${hirerJob.title}" as completed.`, { jobId: app.jobId, applicationId });
                } else {
                    // Notify Labourer about acceptance/rejection
                    addNotification(app.labourerId, 'status_update', `Your application for "${hirerJob?.title}" was ${newStatus.toLowerCase()}`, { applicationId, status: newStatus });
                }
            }

            return updated;
        });
    };

    const addNotification = (userId, type, message, data = {}) => {
        const newNotif = {
            id: Date.now(),
            userId,
            type,
            message,
            data,
            read: false,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setNotifications(prev => [newNotif, ...prev]);
        return newNotif;
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
    };

    const sendGlobalMessage = (senderId, recipientId, messageText, senderName, recipientName) => {
        const newMessage = {
            id: Date.now(),
            text: messageText,
            senderId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString()
        };

        setGlobalChats(prev => {
            // Find existing chat between these two participants
            const chatIndex = prev.findIndex(c =>
                c.participants.includes(senderId) && c.participants.includes(recipientId)
            );

            if (chatIndex >= 0) {
                const updatedChats = [...prev];
                const chat = { ...updatedChats[chatIndex] };
                chat.messages = [...chat.messages, newMessage];
                chat.lastMsg = messageText;
                chat.time = "Just now";
                // Increment unread for the recipient (but in this simple model, we just track global messages)
                updatedChats.splice(chatIndex, 1);
                return [chat, ...updatedChats];
            } else {
                const newChat = {
                    id: 'chat-' + Date.now(),
                    participants: [senderId, recipientId],
                    names: { [senderId]: senderName, [recipientId]: recipientName },
                    messages: [newMessage],
                    lastMsg: messageText,
                    time: "Just now"
                };
                return [newChat, ...prev];
            }
        });

        // Trigger notification
        addNotification(recipientId, 'message', `New message from ${senderName}`, { senderId, type: 'message' });
    };

    const updateLabourerAvailability = (labourerId, status, note) => {
        setLabourers(prev => prev.map(l =>
            l.id === labourerId ? { ...l, availabilityStatus: status, availabilityNote: note } : l
        ));
    };

    const updateLabourerProfile = (labourerId, updates) => {
        setLabourers(prev => {
            const exists = prev.find(l => l.id === labourerId);
            if (exists) {
                return prev.map(l => l.id === labourerId ? { ...l, ...updates } : l);
            }
            // If it doesn't exist, we might be updating the current user's initial professional profile
            return [...prev, { id: labourerId, ...updates }];
        });
    };

    return (
        <DataContext.Provider value={{
            jobs, labourers, applications, notifications, globalChats,
            addJob, updateJob, deleteJob, addLabourer,
            applyForJob, updateApplicationStatus, addNotification, markNotificationAsRead,
            updateLabourerAvailability, updateLabourerProfile, sendGlobalMessage
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
