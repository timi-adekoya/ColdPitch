import React from 'react';
import { AppMode } from '../types';

interface HomePageProps {
  onNavigate: (mode: AppMode) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl text-center max-w-2xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
          Welcome to the AI Practice Hub!
        </h1>
        <p className="text-slate-600 mb-10 text-lg">
          Hone your professional communication skills with AI-powered simulations.
          Choose an activity below to get started.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onNavigate(AppMode.NETWORKING_SIMULATOR)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            <div className="text-2xl mb-2">🤝</div>
            <h2 className="text-xl font-semibold">Networking Simulator</h2>
            <p className="text-sm text-blue-100 mt-1">Practice cold messages, emails & info interviews.</p>
          </button>
          <button
            onClick={() => onNavigate(AppMode.MOCK_INTERVIEW_SETUP)}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-6 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            <div className="text-2xl mb-2">🎙️</div>
            <h2 className="text-xl font-semibold">Mock Interview</h2>
            <p className="text-sm text-green-100 mt-1">Practice voice interviews for various roles.</p>
          </button>
        </div>
        <p className="mt-12 text-sm text-slate-500">
          Powered by Google Gemini.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
