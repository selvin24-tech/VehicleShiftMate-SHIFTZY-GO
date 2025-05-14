import React from 'react';
import { useLocation } from 'wouter';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';

interface ChatButtonProps {
  userId: number;
  shiftRequestId: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  userId, 
  shiftRequestId, 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [_, setLocation] = useLocation();
  const { startConversation } = useChat();

  const handleStartChat = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    
    await startConversation(userId, shiftRequestId);
    setLocation('/chat');
  };

  return (
    <Button 
      onClick={handleStartChat} 
      variant={variant} 
      size={size}
      className={className}
    >
      <MessageCircle className="mr-2" size={16} />
      Chat
    </Button>
  );
};

export default ChatButton;