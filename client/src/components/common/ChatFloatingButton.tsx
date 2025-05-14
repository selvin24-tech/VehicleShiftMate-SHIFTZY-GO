import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { conversations, refreshConversations } = useChat();
  
  // Create a bouncing animation effect every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get all unread messages
  const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  
  const handleChatClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      // If we have conversations, show the preview popup
      if (conversations.length > 0) {
        setIsOpen(true);
      } else {
        // If no conversations, just go directly to chat page
        navigate("/chat");
      }
    }
  };
  
  const handleGoToChat = () => {
    setIsOpen(false);
    navigate("/chat");
  };
  
  const renderChatPreview = () => {
    if (!isOpen) return null;
    
    return (
      <div className="absolute bottom-20 right-0 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 animate-in slide-in-from-bottom-5 duration-150 z-50">
        <div className="p-3 border-b border-neutral-200">
          <h3 className="font-bold text-sm flex items-center">
            Your Conversations
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </h3>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {conversations.slice(0, 3).map((conversation) => (
                <div key={conversation.id} className="p-3 hover:bg-neutral-50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversation.otherUser?.avatarUrl} />
                      <AvatarFallback>{conversation.otherUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conversation.otherUser?.name}</p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-neutral-500 truncate">
                          {conversation.lastMessage.message}
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-500 text-sm">
              No active conversations
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-neutral-200">
          <button 
            onClick={handleGoToChat}
            className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md"
          >
            View All Messages
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <button 
        onClick={handleChatClick}
        className={cn(
          "fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-primary-500 text-white",
          "flex items-center justify-center shadow-lg hover:bg-primary-600",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          isBouncing ? "animate-bounce" : "",
          "transition-all duration-300 ease-in-out border-2 border-primary-300"
        )}
        aria-label="Chat Button"
      >
        <i className="fas fa-comment-dots text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {renderChatPreview()}
    </>
  );
}