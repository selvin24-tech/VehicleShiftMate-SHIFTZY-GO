import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import { useChat } from '@/contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { USER_PROFILE } from '@/lib/constants';

// Convert the USER_PROFILE.id to a number to avoid type issues
const USER_ID = Number(USER_PROFILE.id);

const Chat = () => {
  const [message, setMessage] = useState('');
  const { conversations, currentConversation, messages, sendMessage, selectConversation } = useChat();
  const [_, setLocation] = useLocation();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title={currentConversation?.otherUser?.name || "Chat"} showBackButton={true} />
      
      {!currentConversation ? (
        // Conversation list view
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <h2 className="text-lg font-semibold p-2">Recent Conversations</h2>
          
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a conversation with a vehicle owner or traveler</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                className="bg-white shadow p-3 rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-slate-50"
                onClick={() => selectConversation(conversation)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.otherUser?.avatarUrl} alt={conversation.otherUser?.name} />
                  <AvatarFallback>{conversation.otherUser?.name.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{conversation.otherUser?.name}</h3>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage && formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage ? conversation.lastMessage.message : 'No messages yet'}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        // Chat view
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Start a conversation</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderId === USER_ID;
                return (
                  <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isSelf ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isSelf ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="border-t p-2">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} size="icon" disabled={!message.trim()}>
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;