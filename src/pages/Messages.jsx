import React from 'react';
import './Messages.css';

function Messages() {
    const conversations = [
        { id: 1, name: "Samuel Osei", lastMsg: "I'll be there by 10 AM.", time: "2:30 PM", unread: 2 },
        { id: 2, name: "Isaac Boateng", lastMsg: "The materials are ready.", time: "Yesterday", unread: 0 }
    ];

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Messages</h1>
                    <p>Connect and coordinate with your professional partners</p>
                </div>
            </header>

            <div className="messages-layout">
                <div className="chat-list-sidebar">
                    {conversations.map(chat => (
                        <div key={chat.id} className={`chat-item ${chat.unread > 0 ? 'unread' : ''}`}>
                            <div className="chat-avatar">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="chat-preview">
                                <div className="chat-header">
                                    <strong>{chat.name}</strong>
                                    <span>{chat.time}</span>
                                </div>
                                <div className="chat-footer">
                                    <p>{chat.lastMsg}</p>
                                    {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chat-window-placeholder">
                    <div className="placeholder-content">
                        <i className="fas fa-comments"></i>
                        <h3>Select a conversation</h3>
                        <p>Pick a chat from the left to start messaging</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Messages;
