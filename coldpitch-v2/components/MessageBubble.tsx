import React from 'react';
import { Message, SenderType, ReviewData } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { ReviewerIcon } from './icons/ReviewerIcon'; // New Icon
import LoadingSpinner from './LoadingSpinner';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === SenderType.USER;
  const isGemini = message.sender === SenderType.GEMINI;
  const isReviewer = message.sender === SenderType.REVIEWER;

  const formatTextToHtml = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italics
      .replace(/^- (.*$)/gm, '<li>$1</li>')         // Unordered list items starting with '- '
      .replace(/^  - (.*$)/gm, '<li style="margin-left: 20px;">$1</li>') // Nested list items
      .replace(/\n/g, '<br />');                     // Newlines
  };
  
  const renderReviewContent = (review: ReviewData) => {
    return (
      <div>
        <h4 className="font-semibold text-md mb-2 text-indigo-700">Conversation Review:</h4>
        <div className="mb-3">
          <strong className="block text-sm text-indigo-600">Overall Assessment:</strong>
          <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: formatTextToHtml(review.assessment) }} />
        </div>
        <div className="mb-3">
          <strong className="block text-sm text-indigo-600">Actionable Tips:</strong>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {review.tips.map((tip, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: formatTextToHtml(tip.replace(/^- /, '')) }} />
            ))}
          </ul>
        </div>
        <div>
          <strong className="block text-sm text-indigo-600">Rating:</strong>
          <p className="text-lg font-bold text-indigo-700">{review.rating}/10</p>
        </div>
      </div>
    );
  };


  return (
    <div className={`flex items-end space-x-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
          ${isGemini ? 'bg-slate-200 text-blue-600' : ''}
          ${isReviewer ? 'bg-indigo-100 text-indigo-600' : ''}
        `}>
          {isGemini && <BotIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          {isReviewer && <ReviewerIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 sm:p-4 rounded-xl shadow whitespace-pre-wrap break-words
          ${isUser ? 'bg-blue-600 text-white rounded-br-none'
            : isGemini ? 'bg-white text-slate-900 rounded-bl-none'
            : isReviewer ? 'bg-indigo-50 border border-indigo-200 text-slate-800 rounded-bl-none w-full md:w-auto lg:max-w-xl' // Reviewer bubble style
            : 'bg-slate-50 text-slate-800 rounded-bl-none' // Default fallback, should not happen
          } 
          ${message.isError ? 'bg-red-100 text-red-700 border border-red-300' : ''}`}
      >
        {message.isLoading && !message.review ? ( // Show thinking only if not a review being loaded
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="h-4 w-4" color={isUser ? "text-white" : isReviewer ? "text-indigo-600" : "text-blue-600"} />
            <span className={`text-sm italic ${isUser ? 'text-white' : isReviewer ? 'text-indigo-700' : 'text-slate-600'}`}>
              {isReviewer ? 'Generating review...' : 'Thinking...'}
            </span>
          </div>
        ) : message.review ? (
          renderReviewContent(message.review)
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatTextToHtml(message.text) }} />
        )}
      </div>
      {isUser && (
         <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;