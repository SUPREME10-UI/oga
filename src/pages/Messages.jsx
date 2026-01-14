import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ConfirmModal from '../components/common/ConfirmModal';
import DashboardSidebar from '../components/layout/DashboardSidebar';
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
        sendGlobalMessage,
        markChatAsRead,
        clearChatMessages,
        deleteChat,
        toggleMuteChat,
        blockUser
    } = useData();

    const [selectedChatId, setSelectedChatId] = useState(null);
    const [tempChat, setTempChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [moreOpen, setMoreOpen] = useState(false);

    // Confirmation modal state
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const moreRef = useRef(null);

    const selectedChat = globalChats.find(c => c.id === selectedChatId) || tempChat;

    const getPartnerId = (chat) => {
        if (!chat || !chat.participants) return null;
        return chat.participants.find(id => id !== user?.id);
    };

    const getPartnerName = (chat) => {
        if (!chat || !chat.names) return "Unknown User";
        const partnerId = getPartnerId(chat);
        return (partnerId && chat.names[partnerId]) || "Unknown User";
    };

    const myChats = globalChats.filter(chat => chat && chat.participants && chat.participants.includes(user?.id));

    // Debug logging
    useEffect(() => {
        if (myChats.length > 0) {
            console.log('My Chats loaded:', myChats);
            console.log('GlobalChats:', globalChats);
        }
    }, [myChats, globalChats]);

    const filteredChats = myChats.filter(chat => {
        const name = getPartnerName(chat).toLowerCase();
        const last = (chat.lastMsg || '').toLowerCase();
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return name.includes(q) || last.includes(q);
    });

    // Close "more" menu when clicking outside
    useEffect(() => {
        function onDocClick(e) {
            if (!moreRef.current) return;
            if (!moreRef.current.contains(e.target)) setMoreOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // Clear message notifications on load
    useEffect(() => {
        if (user?.id && notifications.length > 0) {
            const myMessageNotifs = notifications.filter(n => n.userId === user.id && n.type === 'message' && !n.read);
            myMessageNotifs.forEach(n => markNotificationAsRead(n.id));
        }
    }, [user?.id, notifications, markNotificationAsRead]);

    // Handle incoming navigation state (open chat from other pages)
    useEffect(() => {
        if (location.state?.chatWith) {
            const contact = location.state.chatWith;
            const existingChat = globalChats.find(c =>
                c.participants.includes(user?.id) && c.participants.includes(contact.id)
            );

            if (existingChat) {
                setSelectedChatId(existingChat.id);
                setTempChat(null);
            } else {
                // Create temporary chat structure
                const newTempChat = {
                    id: 'temp_chat_new',
                    participants: [user?.id, contact.id],
                    names: {
                        [user?.id]: user?.name || 'Me',
                        [contact.id]: contact.name || 'User'
                    },
                    messages: [{
                        id: 'system_init',
                        text: "Conversation started...",
                        senderId: 'system',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        system: true
                    }],
                    lastMsg: '',
                    muted: false
                };
                setTempChat(newTempChat);
                setSelectedChatId('temp_chat_new');
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname, globalChats, user?.id]);

    // Mark messages as read when selecting chat
    useEffect(() => {
        if (selectedChatId && user?.id) markChatAsRead(selectedChatId, user.id);
    }, [selectedChatId, user?.id, markChatAsRead]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (!chatBodyRef.current) return;
        const t = setTimeout(() => {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }, 60);
        return () => clearTimeout(t);
    }, [selectedChat?.messages?.length, selectedChatId, attachmentPreview]);

    const handleSendMessage = (e, opts = {}) => {
        if (e) e.preventDefault();
        if ((!messageInput.trim() && !opts.attachment) || !selectedChat) return;

        const recipientId = selectedChat.participants.find(id => id !== user.id);
        const recipientName = selectedChat.names[recipientId];

        if (opts.attachment) {
            sendGlobalMessage(user.id, recipientId, '', user.name, recipientName, opts.attachment.type || 'image', opts.attachment.data);
            setAttachmentPreview(null);
        } else {
            sendGlobalMessage(user.id, recipientId, messageInput.trim(), user.name, recipientName, 'text', null);
            setMessageInput('');
        }
    };

    const handleComposerKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setMoreOpen(false);
    };

    const handleAttachmentClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const readFileAsDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ mime: file.type, data: reader.result });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const file = f;
        if (!file.type.startsWith('image/')) {
            const recipientId = selectedChat ? selectedChat.participants.find(id => id !== user.id) : null;
            if (recipientId) addNotification(recipientId, 'message', `${user.name} tried to send an unsupported file.`);
            return;
        }
        const fileData = await readFileAsDataUrl(file);
        setAttachmentPreview(fileData.data);
        handleSendMessage(null, { attachment: { type: 'image', data: fileData } });
        e.target.value = '';
    };

    const getUnreadCount = (chat) => {
        if (!chat.messages) return 0;
        return chat.messages.filter(m => m.senderId !== user.id && (!m.readBy || !m.readBy.includes(user.id))).length;
    };

    const renderMessageContent = (msg) => {
        if (msg.type === 'image' && msg.attachment && msg.attachment.data) {
            return <img src={msg.attachment.data} alt="attachment" className="chat-image-attachment" />;
        }
        return <p>{msg.text}</p>;
    };

    // Menu actions opening modals
    const onViewProfile = () => {
        if (!selectedChat) return;
        const partnerId = getPartnerId(selectedChat);
        setMoreOpen(false);
        navigate(`/profile/${partnerId}`, { state: { userId: partnerId } });
    };

    const onToggleMute = () => {
        if (!selectedChat) return;
        toggleMuteChat(selectedChat.id);
        setMoreOpen(false);
    };

    // open modals instead of immediate confirm()
    const onClearChat = () => {
        if (!selectedChat) return;
        setShowClearConfirm(true);
    };

    const onDeleteChat = () => {
        if (!selectedChat) return;
        setShowDeleteConfirm(true);
    };

    const onBlockUser = () => {
        if (!selectedChat) return;
        setShowBlockConfirm(true);
    };

    // Confirm handlers
    const confirmClearChat = () => {
        if (!selectedChat) return;
        clearChatMessages(selectedChat.id);
        setShowClearConfirm(false);
        setMoreOpen(false);
    };
    const cancelClearChat = () => setShowClearConfirm(false);

    const confirmDeleteChat = () => {
        if (!selectedChat) return;
        deleteChat(selectedChat.id);
        setSelectedChatId(null);
        setShowDeleteConfirm(false);
        setMoreOpen(false);
    };
    const cancelDeleteChat = () => setShowDeleteConfirm(false);

    const confirmBlockUser = () => {
        if (!selectedChat) return;
        const partnerId = getPartnerId(selectedChat);
        blockUser(partnerId);
        deleteChat(selectedChat.id);
        setSelectedChatId(null);
        setShowBlockConfirm(false);
        setMoreOpen(false);
    };
    const cancelBlockUser = () => setShowBlockConfirm(false);

    const muteLabel = selectedChat && selectedChat.muted ? 'Unmute notifications' : 'Mute notifications';

    const handleBack = () => {
        if (selectedChatId) {
            setSelectedChatId(null);
            setTempChat(null);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />
            <div className="hirer-dashboard-main">
                <div className="dashboard-page-container messages-page-wrapper">
            <header className="page-header messages-header">
                <div className="header-left">
                </div>

                <div className="header-center">
                    {selectedChat ? (
                        <div className="chat-header-main" onClick={() => { }}>
                            <div className="partner-avatar" aria-hidden="true">
                                {getPartnerName(selectedChat).charAt(0)}
                            </div>
                            <div className="partner-meta">
                                <div className="partner-name">{getPartnerName(selectedChat)}</div>
                                <div className="partner-status">
                                    <span className="online-dot small"></span>
                                    <span className="status-text">Active Now</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="header-title">
                            <h1>Messaging Hub</h1>
                            <p className="header-sub">Direct messages with your {user?.type === 'hirer' ? 'labourers' : 'hirers'}</p>
                        </div>
                    )}
                </div>

                <div className="header-right">
                </div>
            </header>

            <div className={`messages-layout-box ${selectedChatId ? 'has-selection' : ''}`}>
                <div className="chat-sidebar-container">
                    <div className="sidebar-search">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="chat-items-list">
                        {filteredChats.length > 0 ? filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-item-link ${selectedChatId === chat.id ? 'is-active' : ''}`}
                                onClick={() => handleSelectChat(chat.id)}
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
                                        {getUnreadCount(chat) > 0 && <span className="unread-pill">{getUnreadCount(chat)}</span>}
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
                                    </div>    </div>

                                <div className="header-actions" ref={moreRef}>
                                    <button className="btn-chat-action" title="More" onClick={() => setMoreOpen(s => !s)}>
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    {moreOpen && (
                                        <div className="more-menu" role="menu" aria-label="Chat options">
                                            <button className="more-menu-item" onClick={onViewProfile} role="menuitem">View profile</button>
                                            <button className="more-menu-item" onClick={onToggleMute} role="menuitem">{muteLabel}</button>
                                            <button className="more-menu-item" onClick={onClearChat} role="menuitem">Clear chat</button>
                                            <button className="more-menu-item" onClick={onDeleteChat} role="menuitem">Delete chat</button>
                                            <button className="more-menu-item dangerous" onClick={onBlockUser} role="menuitem">Block user</button>
                                        </div>
                                    )}
                                </div></div>

                            <div className="chat-body-scroller" ref={chatBodyRef}>
                                {selectedChat?.messages && selectedChat.messages.length > 0 ? selectedChat.messages
                                    .filter(msg => !(msg.text && msg.text.trim() === "Conversation started..."))
                                    .map(msg => {
                                        const isMine = msg.senderId === user?.id;
                                        const partnerId = getPartnerId(selectedChat);
                                        const isReadByPartner = msg.readBy && msg.readBy.includes(partnerId);
                                        return (
                                            <div key={msg.id} className={`message-bundle ${isMine ? 'is-mine' : 'is-theirs'}`}>
                                                <div className="message-content-box">
                                                    {renderMessageContent(msg)}
                                                    <span className="msg-time-stamp">{msg.time}</span>
                                                    {isMine && (
                                                        <span className="read-receipt" title={isReadByPartner ? 'Read' : 'Delivered'}>
                                                            <i className={isReadByPartner ? "fas fa-check-double" : "fas fa-check"}></i>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                    <div className="empty-chat-pulse">
                                        <div className="pulse-icon small">
                                            <i className="fas fa-paper-plane"></i>
                                        </div>
                                        <p>Send a message to start the conversation with <strong>{getPartnerName(selectedChat)}</strong>.</p>
                                    </div>
                                )}
                            </div>

                            <form className="chat-composer" onSubmit={handleSendMessage}>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                                <button type="button" className="btn-attachment" onClick={handleAttachmentClick} title="Attach">
                                    <i className="fas fa-paperclip"></i>
                                </button>

                                <textarea
                                    placeholder="Write a message..."
                                    value={messageInput}
                                    onChange={(e) => {
                                        setMessageInput(e.target.value);
                                        setIsTyping(true);
                                        setTimeout(() => setIsTyping(false), 1200);
                                    }}
                                    onKeyDown={handleComposerKeyDown}
                                    rows={1}
                                />

                                <button type="submit" className="btn-msg-submit" disabled={!messageInput.trim() && !attachmentPreview}>
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

            {/* Confirmation modals */}
            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={cancelClearChat}
                onConfirm={confirmClearChat}
                title="Clear chat"
                message="Are you sure you want to clear all messages in this conversation? This cannot be undone."
                confirmText="Clear"
                cancelText="Cancel"
                type="danger"
            />

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={cancelDeleteChat}
                onConfirm={confirmDeleteChat}
                title="Delete conversation"
                message="Delete this conversation? This will remove the chat entirely."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            <ConfirmModal
                isOpen={showBlockConfirm}
                onClose={cancelBlockUser}
                onConfirm={confirmBlockUser}
                title="Block user"
                message={`Block ${selectedChat ? getPartnerName(selectedChat) : 'this user'}? They will no longer be able to message you.`}
                confirmText="Block"
                cancelText="Cancel"
                type="danger"
            />
                </div>
            </div>
        </div>
    );
}

export default Messages;
