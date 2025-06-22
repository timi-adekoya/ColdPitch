import React from 'react';
import { InterviewReviewData, MockInterviewSettings } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface InterviewReviewPageProps {
  review: InterviewReviewData | null;
  isLoading: boolean;
  error: string | null;
  onReturnHome: () => void;
  interviewSettings: MockInterviewSettings | null;
}

const InterviewReviewPage: React.FC<InterviewReviewPageProps> = ({ 
    review, isLoading, error, onReturnHome, interviewSettings 
}) => {

  const cardBaseClass = "p-6 rounded-lg shadow-lg";
  const titleClass = "text-xl font-semibold mb-3";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <LoadingSpinner size="h-12 w-12" color="text-blue-600" />
        <p className="text-slate-700 text-xl mt-4">Generating your interview review...</p>
      </div>
    );
  }

  if (error && !review) { // Show error only if there's no review data to display
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Review Error</h2>
        <p className="text-slate-700 mb-6">{error}</p>
        <button
          onClick={onReturnHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!review) {
     // This case should ideally be covered by isLoading or error, but as a fallback:
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Review Not Available</h2>
        <p className="text-slate-600 mb-6">The interview review could not be generated or found.</p>
         <button
          onClick={onReturnHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  const renderList = (items: string[], itemTitle: string) => (
    <ul className="list-disc list-inside space-y-1 text-slate-700">
      {items.map((item, index) => (
        <li key={`${itemTitle}-${index}`}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div className="bg-slate-50 p-4 sm:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
        Interview Performance Review
      </h2>
      {interviewSettings && (
        <p className="text-center text-slate-600 mb-6 text-sm">
          For your interview as a {interviewSettings.role} at {interviewSettings.company} {interviewSettings.isInternship ? "(Internship)" : ""}.
        </p>
      )}

      {error && ( // Display error alongside review if review data exists but an error also occurred (e.g. partial data)
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Notice</p>
            <p>{error} Review data below might be incomplete.</p>
        </div>
      )}

      <div className="space-y-6">
        <div className={`${cardBaseClass} bg-white`}>
          <h3 className={`${titleClass} text-blue-700`}>Overall Assessment</h3>
          <p className="text-slate-700">{review.overallAssessment}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className={`${cardBaseClass} bg-green-50 border-green-200 border`}>
                <h3 className={`${titleClass} text-green-700`}>Strengths 💪</h3>
                {renderList(review.strengths, "strength")}
            </div>
            <div className={`${cardBaseClass} bg-amber-50 border-amber-200 border`}>
                <h3 className={`${titleClass} text-amber-700`}>Areas for Improvement 💡</h3>
                {renderList(review.areasForImprovement, "improvement")}
            </div>
        </div>
        
        <div className={`${cardBaseClass} bg-indigo-50 border-indigo-200 border`}>
          <h3 className={`${titleClass} text-indigo-700`}>Suggested Focus for Growth 🌱</h3>
          {renderList(review.suggestedFocus, "focus")}
        </div>

        <div className={`${cardBaseClass} bg-sky-50 border-sky-200 border text-center`}>
            <h3 className={`${titleClass} text-sky-700`}>Final Rating</h3>
            <p className="text-5xl font-bold text-sky-600">{review.finalRating}<span className="text-2xl text-slate-500">/10</span></p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onReturnHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default InterviewReviewPage;
