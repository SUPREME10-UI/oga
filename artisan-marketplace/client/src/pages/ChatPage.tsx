import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Hammer,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocket(userId: number): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });
    socket.emit("authenticate", userId);
  }
  return socket;
}

export default function ChatPage() {
  const { conversationId: paramConvoId } = useParams<{ conversationId?: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [activeConvoId, setActiveConvoId] = useState<number | null>(
    paramConvoId ? Number(paramConvoId) : null
  );
  const [messageInput, setMessageInput] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState<
    Array<{ conversationId: number; content: string; senderId: number; createdAt: Date; messageType: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = trpc.chat.myConversations.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });
  const { data: messages, refetch: refetchMessages } = trpc.chat.messages.useQuery(
    { conversationId: activeConvoId ?? 0 },
    { enabled: !!activeConvoId }
  );

  const utils = trpc.useUtils();
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      setMessageInput("");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const markRead = trpc.chat.markRead.useMutation();

  // Socket.IO setup
  useEffect(() => {
    if (!user?.id) return;
    const sock = getSocket(user.id);

    sock.on("new_message", (msg: any) => {
      if (msg.conversationId === activeConvoId) {
        setRealtimeMessages((prev) => [...prev, { ...msg, createdAt: new Date(msg.createdAt) }]);
      }
    });

    return () => {
      sock.off("new_message");
    };
  }, [user?.id, activeConvoId]);

  // Join conversation room
  useEffect(() => {
    if (!activeConvoId || !user?.id) return;
    const sock = getSocket(user.id);
    sock.emit("join_conversation", activeConvoId);
    markRead.mutate({ conversationId: activeConvoId });
    setRealtimeMessages([]);

    return () => {
      sock.emit("leave_conversation", activeConvoId);
    };
  }, [activeConvoId, user?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeConvoId) return;
    sendMessage.mutate({
      conversationId: activeConvoId,
      content: messageInput.trim(),
    });
  };

  const allMessages = [
    ...(messages ?? []),
    ...realtimeMessages.filter(
      (rm) => !(messages ?? []).some((m) => m.content === rm.content && m.senderId === rm.senderId)
    ),
  ];

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <MessageCircle className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Messages</h2>
        <p className="text-muted-foreground mb-6">Sign in to view your messages</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Conversation list */}
      <div
        className={`${
          activeConvoId ? "hidden md:flex" : "flex"
        } w-full md:w-80 flex-col border-r border-border bg-white`}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(conversations ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Book an artisan to start chatting</p>
            </div>
          ) : (
            (conversations ?? []).map((convo) => (
              <div
                key={convo.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                  activeConvoId === convo.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
                onClick={() => {
                  setActiveConvoId(convo.id);
                  navigate(`/chat/${convo.id}`);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hammer className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Conversation #{convo.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(convo.lastMessageAt ?? convo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConvoId ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-border bg-white flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                setActiveConvoId(null);
                navigate("/chat");
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Hammer className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Conversation #{activeConvoId}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            {allMessages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {allMessages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-white text-foreground border border-border rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMe && <CheckCheck className="w-3 h-3 inline ml-1" />}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-white">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!messageInput.trim() || sendMessage.isPending}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Choose from your conversations on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
