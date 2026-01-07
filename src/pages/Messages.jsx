import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Messages.css';

function Messages() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        addNotification,
        notifications,
        markNotificationAsRead,
        globalChats,
        sendGlobalMessage
    } = useData();
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');

    // Active chat object based on globalChats synchronization
    const selectedChat = globalChats.find(c => c.id === selectedChatId);

    // Get the partner's name for a chat
    const getPartnerName = (chat) => {
        const partnerId = chat.participants.find(id => id !== user?.id);
        return chat.names[partnerId] || "Unknown User";
    };

    // Filtered chats where user is a participant
    const myChats = globalChats.filter(chat => chat.participants.includes(user?.id));
    // Clear message notifications on load
    useEffect(() => {
        if (user?.id && notifications.length > 0) {
            const myMessageNotifs = notifications.filter(n => n.userId === user.id && n.type === 'message' && !n.read);
            myMessageNotifs.forEach(n => markNotificationAsRead(n.id));
        }
    }, [user?.id, notifications, markNotificationAsRead]);

    // Handle incoming navigation state (e.g. from Explore or Applicants page)
    useEffect(() => {
        if (location.state?.chatWith) {
            const contact = location.state.chatWith;
            const existingChat = globalChats.find(c =>
                c.participants.includes(user?.id) && c.participants.includes(contact.id)
            );

            if (existingChat) {
                setSelectedChatId(existingChat.id);
            }
            // Clear state so it doesn't re-trigger
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname, globalChats, user?.id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedChat) return;

        const recipientId = selectedChat.participants.find(id => id !== user.id);
        const recipientName = selectedChat.names[recipientId];

        sendGlobalMessage(user.id, recipientId, messageInput, user.name, recipientName);
        setMessageInput('');
    };

    return (
        <div className="dashboard-page-container messages-page-wrapper">
            <header className="page-header">
                <div className="header-left">
                    <h1>Messaging Hub</h1>
                    <p>Direct communication with your {user?.type === 'hirer' ? 'labourers' : 'hirers'}</p>
                </div>
                <div className="header-status-indicator">
                    <span className="online-dot"></span>
                    <span>System Online</span>
                </div>
            </header>

            <div className="messages-layout-box">
                <div className="chat-sidebar-container">
                    <div className="sidebar-search">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search conversations..." />
                    </div>
                    <div className="chat-items-list">
                        {myChats.length > 0 ? myChats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-item-link ${selectedChatId === chat.id ? 'is-active' : ''}`}
                                onClick={() => setSelectedChatId(chat.id)}
                            >
                                <div className="user-avatar-circle">
                                    {getPartnerName(chat).charAt(0)}
                                </div>
                                <div className="chat-meta-content">
                                    <div className="chat-meta-top">
                                        <h4 className="contact-name">{getPartnerName(chat)}</h4>
                                        <span className="chat-timestamp">{chat.time}</span>
                                    </div>
                                    <div className="chat-meta-bottom">
                                        <p className="latest-excerpt">{chat.lastMsg}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-sidebar-state">
                                <i className="fas fa-user-friends"></i>
                                <p>No conversations found.</p>
                                <span>Start a chat from the Explore page.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="chat-main-window">
                    {selectedChat ? (
                        <div className="active-chat-container">
                            <div className="active-chat-header">
                                <div className="header-user-info">
                                    <div className="user-avatar-circle small">
                                        {getPartnerName(selectedChat).charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{getPartnerName(selectedChat)}</h3>
                                        <span className="user-status-text">Active Now</span>
                                    </div>
                                </div>
                                <div className="header-chat-actions">
                                    <button className="btn-chat-action"><i className="fas fa-phone-alt"></i></button>
                                    <button className="btn-chat-action"><i className="fas fa-info-circle"></i></button>
                                </div>
                            </div>

                            <div className="chat-body-scroller">
                                {selectedChat.messages.length > 0 ? selectedChat.messages
                                    .filter(msg => msg.text !== "Conversation started...")
                                    .map(msg => (
                                        <div key={msg.id} className={`message-bundle ${msg.senderId === user?.id ? 'is-mine' : 'is-theirs'}`}>
                                            <div className="message-content-box">
                                                <p>{msg.text}</p>
                                                <span className="msg-time-stamp">{msg.time}</span>
                                            </div>
                                        </div>
                                    )) : (
                                    <div className="empty-chat-pulse">
                                        <div className="pulse-icon small">
                                            <i className="fas fa-paper-plane"></i>
                                        </div>
                                        <p>Send a message to start the conversation with <strong>{getPartnerName(selectedChat)}</strong>.</p>
                                    </div>
                                )}
                            </div>

                            <form className="chat-composer" onSubmit={handleSendMessage}>
                                <button type="button" className="btn-attachment"><i className="fas fa-plus"></i></button>
                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />
                                <button type="submit" className="btn-msg-submit" disabled={!messageInput.trim()}>
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="select-chat-hero">
                            <div className="hero-content-stack">
                                <div className="pulse-icon">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <h2>Your Conversation Hub</h2>
                                <p>Select a partner from the sidebar to coordinate your next job or discuss details.</p>
                                <div className="hero-tips">
                                    <div className="tip-item">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Secure peer-to-peer messaging</span>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Real-time status updates</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;
