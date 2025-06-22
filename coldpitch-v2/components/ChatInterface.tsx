import React, { useState, useRef, useEffect } from 'react';
import { Message, ScenarioDetail, SenderType } from '../types';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { SendIcon } from './icons/SendIcon';
import { useSettings } from '../contexts/SettingsContext';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean; // True if sending message or review is loading
  currentScenario: ScenarioDetail;
  onRequestReview: () => void;
  isReviewComplete: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  currentScenario,
  onRequestReview,
  isReviewComplete
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings(); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && !isReviewComplete) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const placeholderText = isLoading 
    ? "AI is thinking..." 
    : isReviewComplete 
    ? "Review complete. Start a new simulation to try again."
    : currentScenario.placeholder(settings);

  const canRequestReview = messages.some(m => m.sender === SenderType.USER) && 
                           messages.some(m => m.sender === SenderType.GEMINI && !m.isLoading && !m.isError && !m.review) &&
                           !isReviewComplete && !isLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 flex items-center">
            <span className="text-2xl mr-3">{currentScenario.avatarEmoji}</span>
            {currentScenario.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{currentScenario.description}</p>
        </div>
        <button
          onClick={onRequestReview}
          disabled={!canRequestReview}
          className="ml-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
        >
          {isLoading && messages.some(m=>m.sender === SenderType.REVIEWER && m.isLoading) ? <LoadingSpinner size="h-5 w-5" /> : 'Review Chat'}
        </button>
      </div>
      <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto bg-white">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholderText}
            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-slate-900 placeholder-slate-400 bg-white resize-none"
            rows={2}
            disabled={isLoading || isReviewComplete}
            aria-label="Chat input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isReviewComplete) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim() || isReviewComplete}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 self-end"
            aria-label="Send message"
          >
            {isLoading && !messages.some(m=>m.sender === SenderType.REVIEWER && m.isLoading) ? <LoadingSpinner size="h-5 w-5" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;