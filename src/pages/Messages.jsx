import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ConfirmModal from '../components/common/ConfirmModal';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Paperclip, 
  Image as ImageIcon,
  User,
  ShieldAlert,
  Trash2,
  XCircle,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  Check,
  MessageSquare,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

let globalToastCounter = 0;

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

    // Toast notifications for quick UI feedback
    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'success') => {
        const id = `toast_${globalToastCounter++}`;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };

    // Confirmation modal state
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);

    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const moreRef = useRef(null);
    const composerRef = useRef(null);

    const selectedChat = globalChats.find(c => c.id === selectedChatId) || tempChat;

    const getPartnerId = (chat) => {
        if (!chat || !chat.participants) return null;
        const parts = chat.participants.map(String);
        const myId = String(user?.id || user?.uid);
        if (parts.length === 1 && parts[0] === myId) return myId;
        return parts.find(id => id !== myId) || myId;
    };

    const getPartnerName = (chat) => {
        if (!chat || !chat.names) return "Unknown User";
        const partnerId = getPartnerId(chat);
        const myId = String(user?.id || user?.uid);
        if (partnerId === myId) return 'You';
        return (partnerId && chat.names[partnerId]) || "Unknown User";
    };

    const myChats = globalChats.filter(chat => {
        if (!chat || !chat.participants) return false;
        const myId = String(user?.id || user?.uid);
        return chat.participants.map(String).includes(myId);
    });

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
        const myId = user?.id || user?.uid;
        if (myId && notifications.length > 0) {
            const myMessageNotifs = notifications.filter(n => n.userId === myId && n.type === 'message' && !n.read);
            myMessageNotifs.forEach(n => markNotificationAsRead(n.id));
        }
    }, [user?.id, user?.uid, notifications, markNotificationAsRead]);

    // Handle incoming navigation state (open chat from other pages)
    useEffect(() => {
        if (location.state?.chatWith) {
            const contact = location.state.chatWith;
            const currentUserId = String(user?.id || user?.uid);
            const contactId = String(contact.id);

            const existingChat = globalChats.find(c =>
                c.participants.map(String).includes(currentUserId) && 
                c.participants.map(String).includes(contactId)
            );

            if (existingChat) {
                setSelectedChatId(existingChat.id);
                setTempChat(null);
                setTimeout(() => composerRef.current?.focus(), 80);
            } else {
                const newTempChat = {
                    id: 'temp_chat_new',
                    participants: [currentUserId, contactId],
                    names: {
                        [currentUserId]: user?.name || 'Me',
                        [contactId]: contact.name || 'User'
                    },
                    messages: [],
                    lastMsg: '',
                    muted: false
                };
                setTempChat(newTempChat);
                setSelectedChatId('temp_chat_new');
                setTimeout(() => composerRef.current?.focus(), 80);
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname, globalChats, user?.id, user?.uid, user?.name]);

    // Mark messages as read when selecting chat
    useEffect(() => {
        const myId = user?.id || user?.uid;
        if (selectedChatId && myId && !String(selectedChatId).startsWith('temp')) {
            markChatAsRead(selectedChatId, myId);
        }
    }, [selectedChatId, user?.id, user?.uid, markChatAsRead]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (!chatBodyRef.current) return;
        const viewport = chatBodyRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 60);
        }
    }, [selectedChat?.messages?.length, selectedChatId, attachmentPreview]);

    const handleSendMessage = async (e, opts = {}) => {
        if (e) e.preventDefault();
        const myId = user?.id || user?.uid;
        if ((!messageInput.trim() && !opts.attachment) || !selectedChat || !myId) return;

        const recipientId = getPartnerId(selectedChat);
        const recipientName = selectedChat.names && selectedChat.names[recipientId] ? selectedChat.names[recipientId] : 'User';

        try {
            let chatId = null;
            if (opts.attachment) {
                chatId = await sendGlobalMessage(myId, recipientId, '', user.name, recipientName, opts.attachment.type || 'image', opts.attachment.data);
                setAttachmentPreview(null);
            } else {
                chatId = await sendGlobalMessage(myId, recipientId, messageInput.trim(), user.name, recipientName, 'text', null);
                setMessageInput('');
            }

            if (chatId && selectedChatId === 'temp_chat_new') {
                setSelectedChatId(chatId);
                setTempChat(null);
            }
        } catch (err) {
            console.error('Send message failed', err);
            showToast('Failed to send message', 'error');
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
        setTimeout(() => composerRef.current?.focus(), 50);
    };

    const handleAttachmentClick = () => fileInputRef.current?.click();

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
        if (!f.type.startsWith('image/')) {
            showToast('Only images are supported for now', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setAttachmentPreview(reader.result);
            handleSendMessage(null, { attachment: { type: 'image', data: reader.result } });
        };
        reader.readAsDataURL(f);
        e.target.value = '';
    };

    const getUnreadCount = (chat) => {
        const myId = String(user?.id || user?.uid);
        if (!chat.messages) return 0;
        return chat.messages.filter(m => m.senderId !== myId && (!m.readBy || !m.readBy.map(String).includes(myId))).length;
    };

    const renderMessageContent = (msg) => {
        if (msg.type === 'image' && msg.attachment) {
            return (
                <div className="rounded-xl overflow-hidden mt-1 max-w-[280px] shadow-sm border border-white/20">
                    <img src={msg.attachment} alt="attachment" className="w-full h-full object-cover block" />
                </div>
            );
        }
        return <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>;
    };

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

    const onClearChat = () => setShowClearConfirm(true);
    const onDeleteChat = () => setShowDeleteConfirm(true);
    const onBlockUser = () => setShowBlockConfirm(true);

    // Confirm handlers
    const confirmClearChat = () => {
        if (!selectedChat) return;
        clearChatMessages(selectedChat.id);
        setShowClearConfirm(false);
        setMoreOpen(false);
    };
    // const cancelClearChat = () => setShowClearConfirm(false); // Removed as per new ConfirmModal usage

    const confirmDeleteChat = () => {
        if (!selectedChat) return;
        deleteChat(selectedChat.id);
        setSelectedChatId(null);
        setShowDeleteConfirm(false);
        setMoreOpen(false);
    };
    // const cancelDeleteChat = () => setShowDeleteConfirm(false); // Removed as per new ConfirmModal usage

    const confirmBlockUser = () => {
        if (!selectedChat) return;
        const partnerId = getPartnerId(selectedChat);
        blockUser(partnerId);
        deleteChat(selectedChat.id);
        setSelectedChatId(null);
        setShowBlockConfirm(false);
        setMoreOpen(false);
    };
    // const cancelBlockUser = () => setShowBlockConfirm(false); // Removed as per new ConfirmModal usage

    const muteLabel = selectedChat?.muted ? 'Unmute Notifications' : 'Mute Notifications';

    const handleBack = () => {
        if (selectedChatId) {
            setSelectedChatId(null);
            setTempChat(null);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 relative animate-in fade-in duration-500">
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-right-8",
                        t.type === 'error' ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                    )}>
                        {t.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Chat List Sidebar */}
            <aside className={cn(
                "w-full md:w-80 lg:w-96 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 relative z-20",
                selectedChatId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif">Conversations</h2>
                        <Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-600 border-none font-bold">
                            {myChats.length} Active
                        </Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Find a person or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-1">
                        {filteredChats.length > 0 ? filteredChats.map(chat => {
                            const isSelected = selectedChatId === chat.id;
                            const unread = getUnreadCount(chat);
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group relative",
                                        isSelected ? "bg-slate-900 text-white shadow-xl" : "hover:bg-slate-50 text-slate-900"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border-2",
                                        isSelected ? "border-white/20 bg-slate-800" : "border-slate-100 bg-slate-100"
                                    )}>
                                        {chat.partnerPhoto ? (
                                            <img src={chat.partnerPhoto} className="w-full h-full object-cover" alt="" />
                                        ) : getPartnerName(chat).charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold truncate text-[15px]">{getPartnerName(chat)}</h4>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                isSelected ? "text-slate-400" : "text-slate-400"
                                            )}>
                                                {chat.time || 'NEW'}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm truncate leading-relaxed",
                                            isSelected ? "text-slate-300" : "text-slate-500",
                                            unread > 0 && !isSelected && "font-bold text-slate-900"
                                        )}>
                                            {chat.lastMsg || "Started a conversation"}
                                        </p>
                                    </div>
                                    {unread > 0 && !isSelected && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                                            <span className="text-[10px] text-white font-bold">{unread}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        }) : (
                            <div className="py-20 px-6 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                                    <MessageSquare className="w-10 h-10 text-slate-300" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Quiet for now</p>
                                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-1">Start a conversation from the Explore page</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Chat Interface */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 bg-white relative",
                !selectedChatId ? "hidden md:flex items-center justify-center" : "flex"
            )}>
                {selectedChat ? (
                    <>
                        <header className="h-20 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10" onClick={() => setSelectedChatId(null)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-50 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shadow-sm">
                                    {getPartnerName(selectedChat).charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{getPartnerName(selectedChat)}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        On-Site
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full" onClick={onViewProfile}>
                                    <User className="w-5 h-5" />
                                </Button>
                                <div className="relative" ref={moreRef}>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full" onClick={() => setMoreOpen(!moreOpen)}>
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                    {moreOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 p-1">
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-3 transition-colors rounded-xl" onClick={onToggleMute}>
                                                <VolumeX className="w-4 h-4" /> {muteLabel}
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 flex items-center gap-3 transition-colors rounded-xl" onClick={onClearChat}>
                                                <XCircle className="w-4 h-4" /> Clear History
                                            </button>
                                            <div className="h-px bg-white/10 my-1 mx-2" />
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors rounded-xl" onClick={onDeleteChat}>
                                                <Trash2 className="w-4 h-4" /> Delete Chat
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors rounded-xl" onClick={onBlockUser}>
                                                <ShieldAlert className="w-4 h-4" /> Block Person
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>

                        <ScrollArea className="flex-1 bg-slate-50/50" ref={chatBodyRef}>
                            <div className="p-6 md:p-8 flex flex-col gap-4">
                                <div className="text-center py-10">
                                    <Badge variant="outline" className="rounded-full bg-white border-slate-100 text-[10px] font-bold uppercase tracking-tighter px-4 py-1.5 shadow-sm text-slate-400">
                                        End-to-end encrypted chat
                                    </Badge>
                                </div>

                                {selectedChat.messages?.map((msg, idx, arr) => {
                                    const myId = String(user?.id || user?.uid);
                                    const isMine = String(msg.senderId) === myId;
                                    const partnerId = getPartnerId(selectedChat);
                                    const isRead = msg.readBy && msg.readBy.map(String).includes(String(partnerId));
                                    const isSequential = idx > 0 && arr[idx-1].senderId === msg.senderId;

                                    return (
                                        <div key={msg.id || idx} className={cn(
                                            "flex flex-col max-w-[85%] md:max-w-[70%]",
                                            isMine ? "self-end items-end" : "self-start items-start",
                                            isSequential ? "mt-1" : "mt-4"
                                        )}>
                                            <div className={cn(
                                                "px-5 py-3.5 shadow-sm relative group transition-all",
                                                isMine 
                                                    ? "bg-slate-900 text-white rounded-3xl rounded-tr-lg" 
                                                    : "bg-white border border-slate-100 text-slate-900 rounded-3xl rounded-tl-lg"
                                            )}>
                                                {renderMessageContent(msg)}
                                            </div>
                                            {!isSequential && (
                                                <div className={cn(
                                                    "flex items-center gap-2 mt-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400",
                                                    isMine ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    <span>{msg.time}</span>
                                                    {isMine && (
                                                        <span className={isRead ? "text-primary" : "text-slate-300"}>
                                                            {isRead ? <CheckCircle2 className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <footer className="p-6 bg-white border-t border-slate-100">
                            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleAttachmentClick}
                                    className="rounded-2xl h-12 w-12 bg-slate-50 text-slate-400 hover:text-primary shrink-0"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>

                                <div className="flex-1 relative flex flex-col group transition-all">
                                    {attachmentPreview && (
                                        <div className="absolute bottom-full mb-4 left-0 w-32 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white animate-in zoom-in group">
                                            <img src={attachmentPreview} className="w-full h-full object-cover" alt="" />
                                            <button 
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setAttachmentPreview(null)}
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <textarea
                                        placeholder="Communicate with clarity..."
                                        ref={composerRef}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        rows={1}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-6 text-sm resize-none focus:ring-1 focus:ring-primary/10 overflow-hidden min-h-[48px] max-h-[120px]"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={!messageInput.trim() && !attachmentPreview}
                                    className="h-12 px-6 rounded-2xl shadow-xl shadow-primary/20 shrink-0 font-bold"
                                >
                                    <Send className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Send</span>
                                </Button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mb-8 rotate-3">
                            <Send className="w-12 h-12 text-primary opacity-20 -mr-2 mt-1" />
                        </div>
                        <h2 className="text-3xl font-bold font-serif text-slate-900 mb-3">Gateway Messaging</h2>
                        <p className="text-slate-500 max-w-xs leading-relaxed text-sm">
                            Connect with skilled artisans and house owners in real-time. Select a thread to begin.
                        </p>
                    </div>
                )}
            </main>

            {/* Confirm Modals */}
            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={confirmClearChat}
                title="Wipe Conversation?"
                message="This will permanently delete all messages in this thread. This action is irreversible."
                confirmText="Yes, Wipe it"
                type="danger"
            />
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteChat}
                title="Discard Thread?"
                message="The entire conversation history will be removed from your dashboard."
                confirmText="Discard"
                type="danger"
            />
            <ConfirmModal
                isOpen={showBlockConfirm}
                onClose={() => setShowBlockConfirm(false)}
                onConfirm={confirmBlockUser}
                title="Restrict Access?"
                message="This user will no longer be able to message you or view your active listings."
                confirmText="Restrict User"
                type="danger"
            />
        </div>
    );
}

export default Messages;
