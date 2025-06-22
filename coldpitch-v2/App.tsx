import React, { useState, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { 
  ScenarioDetail, Message, SenderType, NetworkingAppView, UserSettings, ReviewData,
  AppMode, MockInterviewSettings, TranscriptEntry, InterviewReviewData, InterviewRole
} from './types';
import { 
  SCENARIOS, DEFAULT_USER_SETTINGS, INTERVIEWER_FIRST_NAMES
} from './constants';

import HomePage from './components/HomePage'; 
import ScenarioSelector from './components/ScenarioSelector';
import ChatInterface from './components/ChatInterface';
import SettingsPage from './components/SettingsPage';
import MockInterviewSetup from './components/MockInterviewSetup'; 
import VoiceCallInterface from './components/VoiceCallInterface'; 
import InterviewReviewPage from './components/InterviewReviewPage'; 

import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { startChatSession, sendMessageStream, getConversationReview, getInterviewReview, startInterviewChatSession } from './services/geminiService';
import { SettingsIcon } from './components/icons/SettingsIcon';

const AppContent: React.FC = () => {
  // Global App Mode
  const [appMode, setAppMode] = useState<AppMode>(AppMode.HOME);

  // --- Networking Simulator State ---
  const [currentNetworkingView, setCurrentNetworkingView] = useState<NetworkingAppView>(NetworkingAppView.SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDetail | null>(null);
  const [networkingChat, setNetworkingChat] = useState<Chat | null>(null);
  const [networkingMessages, setNetworkingMessages] = useState<Message[]>([]);
  const [networkingReview, setNetworkingReview] = useState<ReviewData | null>(null);
  const [isNetworkingLoading, setIsNetworkingLoading] = useState<boolean>(false);
  const [isNetworkingReviewLoading, setIsNetworkingReviewLoading] = useState<boolean>(false);
  
  // --- Mock Interview State ---
  const [mockInterviewSettings, setMockInterviewSettings] = useState<MockInterviewSettings | null>(null);
  const [interviewChat, setInterviewChat] = useState<Chat | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState<TranscriptEntry[]>([]);
  const [interviewReview, setInterviewReview] = useState<InterviewReviewData | null>(null);
  const [isInterviewLoading, setIsInterviewLoading] = useState<boolean>(false); // For AI responses during interview
  const [isInterviewReviewLoading, setIsInterviewReviewLoading] = useState<boolean>(false);


  // --- Shared State ---
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const { settings, saveSettings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      setError("API Key is missing. Please ensure it's configured in process.env.API_KEY.");
    }
  }, []);

  // --- Networking Simulator Logic ---
  const handleSelectScenario = useCallback((scenario: ScenarioDetail) => {
    if (apiKeyMissing || settingsLoading) return;
    try {
      const systemInstructionString = scenario.systemInstruction(settings);
      const chatInstance = startChatSession(systemInstructionString);
      
      setSelectedScenario(scenario);
      setNetworkingChat(chatInstance);
      setNetworkingMessages([]);
      setNetworkingReview(null);
      setError(null);
      setCurrentNetworkingView(NetworkingAppView.CHAT);
      
      let introText = `You are now simulating a conversation with: ${scenario.name}.`;
      if (settings.fullName && settings.universityName) {
        introText += `\nHint: You can introduce yourself as ${settings.fullName} from ${settings.universityName}.`;
      } else if (settings.fullName) {
        introText += `\nHint: You can introduce yourself as ${settings.fullName}.`;
      }
      introText += `\nHow would you like to start?`;

      setNetworkingMessages([{
        id: `gemini-intro-${Date.now()}`,
        text: introText,
        sender: SenderType.GEMINI,
        timestamp: new Date(),
      }]);
    } catch (e) {
      console.error("Failed to initialize networking chat session:", e);
      setError("Failed to initialize networking chat session. Ensure API key is valid.");
      if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
    }
  }, [apiKeyMissing, settings, settingsLoading]);

  const handleSendNetworkingMessage = useCallback(async (text: string) => {
    if (!networkingChat || !selectedScenario || apiKeyMissing || isNetworkingLoading || isNetworkingReviewLoading || networkingReview) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text, sender: SenderType.USER, timestamp: new Date() };
    setNetworkingMessages(prev => [...prev, userMessage]);
    setIsNetworkingLoading(true);

    const botMessageId = `gemini-${Date.now()}`;
    setNetworkingMessages(prev => [...prev, { id: botMessageId, text: '', sender: SenderType.GEMINI, timestamp: new Date(), isLoading: true }]);

    try {
      const stream = sendMessageStream(networkingChat, text);
      let fullResponse = "";
      for await (const chunkText of stream) {
        fullResponse += chunkText;
        setNetworkingMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: fullResponse, isLoading: false } : msg));
      }
      setNetworkingMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, isLoading: false } : msg));
    } catch (e) {
      console.error("Error sending networking message:", e);
      setError("An error occurred while communicating with the AI. Please try again.");
      setNetworkingMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: "Error: Could not get response.", isLoading: false, isError: true } : msg));
      if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
    } finally {
      setIsNetworkingLoading(false);
    }
  }, [networkingChat, selectedScenario, apiKeyMissing, isNetworkingLoading, isNetworkingReviewLoading, networkingReview]);

  const handleRequestNetworkingReview = useCallback(async () => {
    if (!selectedScenario || networkingMessages.length === 0 || apiKeyMissing || isNetworkingLoading || isNetworkingReviewLoading || networkingReview) return;
    setIsNetworkingReviewLoading(true);
    setError(null);
    const reviewMessageId = `reviewer-${Date.now()}`;
    try {
      setNetworkingMessages(prev => [...prev, { id: reviewMessageId, text: "Generating networking performance review...", sender: SenderType.REVIEWER, timestamp: new Date(), isLoading: true }]);
      const reviewData = await getConversationReview(networkingMessages, selectedScenario, settings);
      if (reviewData) {
        setNetworkingReview(reviewData);
        setNetworkingMessages(prev => prev.map(msg => msg.id === reviewMessageId ? { ...msg, text: "Here's your performance review:", review: reviewData, isLoading: false } : msg));
      } else throw new Error("Failed to parse networking review data.");
    } catch (e) {
      console.error("Error getting networking conversation review:", e);
      setError("Failed to generate networking review. Please try again.");
      setNetworkingMessages(prev => prev.map(msg => msg.id === reviewMessageId ? { ...msg, text: "Error: Could not generate review.", isError: true, isLoading: false } : msg));
      if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
    } finally {
      setIsNetworkingReviewLoading(false);
    }
  }, [selectedScenario, networkingMessages, apiKeyMissing, settings, isNetworkingLoading, isNetworkingReviewLoading, networkingReview]);

  const handleResetNetworkingSimulation = () => {
    setSelectedScenario(null);
    setNetworkingChat(null);
    setNetworkingMessages([]);
    setNetworkingReview(null);
    setIsNetworkingLoading(false);
    setIsNetworkingReviewLoading(false);
    setError(null);
    setCurrentNetworkingView(NetworkingAppView.SCENARIOS);
  };
  
  // --- Mock Interview Logic ---
  const handleStartInterviewSetup = (interviewSetup: Omit<MockInterviewSettings, 'interviewerName'>) => {
    if (apiKeyMissing || settingsLoading) return;

    const randomInterviewerName = INTERVIEWER_FIRST_NAMES[Math.floor(Math.random() * INTERVIEWER_FIRST_NAMES.length)];
    const completeInterviewSettings: MockInterviewSettings = { 
        ...interviewSetup, 
        interviewerName: randomInterviewerName 
    };

    setMockInterviewSettings(completeInterviewSettings);
    setInterviewTranscript([]);
    setInterviewReview(null);
    setError(null);
    try {
        const chat = startInterviewChatSession(completeInterviewSettings, settings);
        setInterviewChat(chat);
        setAppMode(AppMode.MOCK_INTERVIEW_CALL);
    } catch (e) {
        console.error("Failed to initialize interview chat session:", e);
        setError("Failed to initialize interview. Ensure API key is valid.");
        if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
    }
  };

  const handleSendInterviewMessage = useCallback(async (text: string, senderType: SenderType = SenderType.USER) => {
    if (!interviewChat || !mockInterviewSettings || apiKeyMissing || (isInterviewLoading && senderType !== SenderType.SYSTEM) || interviewReview) return;

    // Add user/system message to transcript, but skip empty initial system message from UI
    if (!(senderType === SenderType.SYSTEM && text === "")) {
        const newEntry: TranscriptEntry = { id: `${senderType}-${Date.now()}`, text, sender: senderType, timestamp: new Date() };
        setInterviewTranscript(prev => [...prev, newEntry]);
    }
    
    // If it's a user message OR the special initial system signal to start the AI, call the AI
    if (senderType === SenderType.USER || (senderType === SenderType.SYSTEM && text === "")) {
        setIsInterviewLoading(true); 
        const aiEntryId = `gemini-interview-${Date.now()}`;
         
        // For the initial system signal, send a neutral starter message to AI. For user messages, use their text.
        const messageToAI = (senderType === SenderType.SYSTEM && text === "") ? "Hello." : text;
        
        try {
            const stream = sendMessageStream(interviewChat, messageToAI);
            let fullResponse = "";
            for await (const chunkText of stream) {
                fullResponse += chunkText;
            }
            if (fullResponse) {
                 const aiResponseEntry: TranscriptEntry = { id: aiEntryId, text: fullResponse, sender: SenderType.GEMINI, timestamp: new Date() };
                 setInterviewTranscript(prev => [...prev, aiResponseEntry]);
            } else {
                 const aiErrorEntry: TranscriptEntry = { id: aiEntryId, text: "AI did not provide a response.", sender: SenderType.SYSTEM, timestamp: new Date() };
                 setInterviewTranscript(prev => [...prev, aiErrorEntry]);
            }

        } catch (e) {
            console.error("Error sending interview message:", e);
            setError("An error occurred while communicating with the AI for the interview.");
            const aiErrorEntry: TranscriptEntry = { id: aiEntryId, text: "Error: Could not get AI response.", sender: SenderType.SYSTEM, timestamp: new Date() };
            setInterviewTranscript(prev => [...prev, aiErrorEntry]);
            if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
        } finally {
            setIsInterviewLoading(false);
        }
    }
  }, [interviewChat, mockInterviewSettings, apiKeyMissing, isInterviewLoading, interviewReview, settings]);


  const handleEndInterviewAndRequestReview = useCallback(async () => {
    if (!mockInterviewSettings || interviewTranscript.length === 0 || apiKeyMissing || isInterviewReviewLoading || interviewReview) return;
    
    const endMessage: TranscriptEntry = {
        id: `system-end-${Date.now()}`,
        text: "Interview ended by user.",
        sender: SenderType.SYSTEM,
        timestamp: new Date()
    };
    setInterviewTranscript(prev => [...prev, endMessage]);
    
    setIsInterviewReviewLoading(true);
    setError(null);
    try {
      // Ensure mockInterviewSettings is not null before calling getInterviewReview
      if (!mockInterviewSettings) {
          throw new Error("Mock interview settings are missing for review.");
      }
      const reviewData = await getInterviewReview(interviewTranscript, mockInterviewSettings, settings);
      if (reviewData) {
        setInterviewReview(reviewData);
        setAppMode(AppMode.MOCK_INTERVIEW_REVIEW);
      } else {
        throw new Error("Failed to parse interview review data.");
      }
    } catch (e) {
      console.error("Error getting interview review:", e);
      setError("Failed to generate interview review. Please try again.");
      setAppMode(AppMode.MOCK_INTERVIEW_REVIEW); 
      if (e instanceof Error && e.message.toLowerCase().includes("api key")) setApiKeyMissing(true);
    } finally {
      setIsInterviewReviewLoading(false);
    }
  }, [mockInterviewSettings, interviewTranscript, apiKeyMissing, settings, isInterviewReviewLoading, interviewReview]);


  // --- Navigation and Settings ---
  const navigateToHome = () => {
    setAppMode(AppMode.HOME);
    handleResetNetworkingSimulation();
    setMockInterviewSettings(null);
    setInterviewTranscript([]);
    setInterviewReview(null);
    setInterviewChat(null);
  };

  const handleOpenSettings = () => {
    if (appMode === AppMode.NETWORKING_SIMULATOR) {
        setCurrentNetworkingView(NetworkingAppView.SETTINGS);
    } else {
         setAppMode(AppMode.SETTINGS); 
    }
  };

  const handleCloseSettings = (newSettings: UserSettings) => {
    saveSettings(newSettings);
    if (currentNetworkingView === NetworkingAppView.SETTINGS && appMode === AppMode.NETWORKING_SIMULATOR) { 
        setCurrentNetworkingView(NetworkingAppView.SCENARIOS);
        if (selectedScenario) { 
            handleResetNetworkingSimulation();
        }
    } else { 
        setAppMode(AppMode.HOME); 
    }
  };

  // --- Render Logic ---
  if (settingsLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-100"><p className="text-slate-700 text-lg">Loading settings...</p></div>;
  }
  if (apiKeyMissing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-slate-700">API Key is not configured. Please set the `API_KEY` environment variable.</p>
          <p className="text-sm text-slate-500 mt-2">Refer to instructions if running locally.</p>
        </div>
      </div>
    );
  }

  const renderHeader = () => (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={navigateToHome} className="text-2xl font-semibold hover:text-blue-200 transition">Gemini Practice Hub</button>
        <div className="flex items-center space-x-4">
          {appMode === AppMode.NETWORKING_SIMULATOR && currentNetworkingView !== NetworkingAppView.SCENARIOS && (
            <button onClick={handleResetNetworkingSimulation} className="bg-white text-blue-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium">New Simulation</button>
          )}
           {appMode === AppMode.MOCK_INTERVIEW_CALL && (
             <button onClick={handleEndInterviewAndRequestReview} className="bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium">End Interview</button>
           )}
          {!(appMode === AppMode.NETWORKING_SIMULATOR && currentNetworkingView === NetworkingAppView.SETTINGS) && 
           !(appMode === AppMode.SETTINGS) && 
           !(appMode === AppMode.MOCK_INTERVIEW_CALL) && /* Hide settings during call */
             ( 
             <button onClick={handleOpenSettings} className="p-2 rounded-md hover:bg-blue-700 transition-colors" aria-label="Open Settings">
               <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
             </button>
          )}
        </div>
      </div>
    </header>
  );
  
  const renderFooter = () => (
    <footer className="bg-slate-200 text-slate-600 p-3 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} AI Practice Hub. Powered by Gemini.</p>
    </footer>
  );

  return (
    <div className="flex flex-col h-screen antialiased text-slate-800">
      {renderHeader()}
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {error && appMode !== AppMode.SETTINGS && ( 
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {appMode === AppMode.HOME && <HomePage onNavigate={setAppMode} />}
        
        {appMode === AppMode.NETWORKING_SIMULATOR && (
          <>
            {currentNetworkingView === NetworkingAppView.SCENARIOS && <ScenarioSelector scenarios={SCENARIOS} onSelectScenario={handleSelectScenario} />}
            {currentNetworkingView === NetworkingAppView.CHAT && selectedScenario && (
              <ChatInterface
                messages={networkingMessages}
                onSendMessage={handleSendNetworkingMessage}
                isLoading={isNetworkingLoading || isNetworkingReviewLoading}
                currentScenario={selectedScenario}
                onRequestReview={handleRequestNetworkingReview}
                isReviewComplete={!!networkingReview}
              />
            )}
            {currentNetworkingView === NetworkingAppView.SETTINGS && <SettingsPage currentSettings={settings} onSave={handleCloseSettings} />}
          </>
        )}

        {appMode === AppMode.MOCK_INTERVIEW_SETUP && (
          <MockInterviewSetup onSubmit={handleStartInterviewSetup} userSettings={settings} />
        )}
        {appMode === AppMode.MOCK_INTERVIEW_CALL && mockInterviewSettings && interviewChat && (
          <VoiceCallInterface
            interviewSettings={mockInterviewSettings}
            userSettings={settings}
            transcript={interviewTranscript}
            onSendMessage={handleSendInterviewMessage}
            onEndInterview={handleEndInterviewAndRequestReview}
            isLoadingAI={isInterviewLoading} 
            chatSession={interviewChat} 
          />
        )}
        {appMode === AppMode.MOCK_INTERVIEW_REVIEW && (
          <InterviewReviewPage
            review={interviewReview}
            isLoading={isInterviewReviewLoading}
            error={error} 
            onReturnHome={navigateToHome}
            interviewSettings={mockInterviewSettings} 
          />
        )}
         {appMode === AppMode.SETTINGS && ( 
            <SettingsPage currentSettings={settings} onSave={handleCloseSettings} />
        )}

      </main>
      {renderFooter()}
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <AppContent />
  </SettingsProvider>
);

export default App;