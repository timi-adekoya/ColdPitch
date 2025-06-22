
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MockInterviewSettings, UserSettings, TranscriptEntry, SenderType } from '../types';
import { Chat } from '@google/genai'; 
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { MicOffIcon } from './icons/MicOffIcon';
import { EndCallIcon } from './icons/EndCallIcon';
import LoadingSpinner from './LoadingSpinner';

declare global {
  interface Window {
    SpeechRecognition: any; 
    webkitSpeechRecognition: any; 
  }
}

interface VoiceCallInterfaceProps {
  interviewSettings: MockInterviewSettings;
  userSettings: UserSettings;
  transcript: TranscriptEntry[]; 
  onSendMessage: (text: string, sender: SenderType) => Promise<void>; 
  onEndInterview: () => void;
  isLoadingAI: boolean; 
  chatSession: Chat; 
}

const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({
  interviewSettings,
  userSettings,
  transcript,
  onSendMessage,
  onEndInterview,
  isLoadingAI,
  chatSession
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [currentSpokenAIText, setCurrentSpokenAIText] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const lastTriggeredSpeakTextRef = useRef<string | null>(null);
  const speechAttemptIdRef = useRef<number>(0); // Unique ID for each speech attempt

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [transcript]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      setAvailableVoices(englishVoices);

      const preferredVoiceNames = [
        "Google US English", 
        "Microsoft David Online (Natural) - English (United States)", 
        "Microsoft Zira Online (Natural) - English (United States)", 
        "Alex", 
        "Samantha", 
      ];
      
      let foundVoice: SpeechSynthesisVoice | undefined = undefined;
      for (const name of preferredVoiceNames) {
        foundVoice = englishVoices.find(v => v.name === name);
        if (foundVoice) break;
      }
      setSelectedVoice(foundVoice || englishVoices.find(v => v.default) || englishVoices[0] || null);
    };

    loadVoices(); 
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      window.speechSynthesis.onvoiceschanged = null; 
      speechAttemptIdRef.current = Date.now(); // Invalidate any pending speech callbacks
      window.speechSynthesis?.cancel(); 
      setIsAISpeaking(false);
      setCurrentSpokenAIText(null);
      lastTriggeredSpeakTextRef.current = null;
    };
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Your browser does not support Speech Recognition. Please try Chrome or Edge.');
      return;
    }
    speechRecognitionRef.current = new SpeechRecognitionAPI();
    speechRecognitionRef.current.continuous = false; 
    speechRecognitionRef.current.interimResults = false;
    speechRecognitionRef.current.lang = 'en-US';

    speechRecognitionRef.current.onresult = (event: any) => {
      const spokenText = event.results[event.results.length - 1][0].transcript.trim();
      if (spokenText) {
        onSendMessage(spokenText, SenderType.USER);
      }
      setIsListening(false);
    };
    speechRecognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [onSendMessage]);

  const speakText = useCallback((text: string, attemptId: number) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        console.warn('Text-to-Speech not supported.');
        return;
    }
    if (!text.trim()) {
        // console.log(`speakText called with empty text for attemptId ${attemptId}`);
        if (attemptId === speechAttemptIdRef.current) { // Only update state if this is the current attempt
            setIsAISpeaking(false);
            setCurrentSpokenAIText(null);
            if (lastTriggeredSpeakTextRef.current === text || lastTriggeredSpeakTextRef.current === null) {
                lastTriggeredSpeakTextRef.current = null;
            }
        }
        return;
    }
    
    window.speechSynthesis.cancel(); 

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => {
        if (attemptId !== speechAttemptIdRef.current) return; // Stale event
        // console.log(`onstart for: "${text}" (Attempt: ${attemptId})`);
        setIsAISpeaking(true);
        setCurrentSpokenAIText(text);
    };
    utterance.onend = () => {
        if (attemptId !== speechAttemptIdRef.current) return; // Stale event
        // console.log(`onend for: "${text}" (Attempt: ${attemptId})`);
        setIsAISpeaking(false);
        setCurrentSpokenAIText(null);
        if (lastTriggeredSpeakTextRef.current === text) {
            lastTriggeredSpeakTextRef.current = null;
        }
    };
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => { 
        if (attemptId !== speechAttemptIdRef.current) return; // Stale event
        console.error("Speech synthesis error:", e.error, "for text:", `"${text}" (Attempt: ${attemptId})`);
        setIsAISpeaking(false);
        setCurrentSpokenAIText(null);
        if (lastTriggeredSpeakTextRef.current === text) {
            lastTriggeredSpeakTextRef.current = null;
        }
    };
    window.speechSynthesis.speak(utterance);
    // console.log(`Called speak() for: "${text}" (Attempt: ${attemptId})`);
  }, [selectedVoice]);

  useEffect(() => {
    const lastMessage = transcript[transcript.length - 1];
    if (lastMessage && lastMessage.sender === SenderType.GEMINI && lastMessage.text && !isLoadingAI) {
      const shouldInitiateNewSpeech = !isAISpeaking || (isAISpeaking && lastMessage.text !== currentSpokenAIText);

      if (shouldInitiateNewSpeech && lastTriggeredSpeakTextRef.current !== lastMessage.text) {
        lastTriggeredSpeakTextRef.current = lastMessage.text;
        
        const newAttemptId = Date.now();
        speechAttemptIdRef.current = newAttemptId;
        // console.log(`Speech effect: Triggering speakText for "${lastMessage.text}". AttemptID: ${newAttemptId}. Last triggered ref: "${lastTriggeredSpeakTextRef.current}". isAISpeaking: ${isAISpeaking}. currentSpokenAIText: "${currentSpokenAIText}"`);
        speakText(lastMessage.text, newAttemptId);
      }
    }
  }, [transcript, isLoadingAI, isAISpeaking, currentSpokenAIText, speakText]);


  const toggleListen = () => {
    if (isListening) { // If currently listening, stop listening.
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    } else { // If not listening, start listening. This means interrupting any AI speech.
      if (isAISpeaking) {
        // console.log("User interrupting AI speech to listen.");
        speechAttemptIdRef.current = Date.now(); // Invalidate current speech attempt
        window.speechSynthesis.cancel();
        setIsAISpeaking(false);
        setCurrentSpokenAIText(null);
        lastTriggeredSpeakTextRef.current = null; // Clear as we are starting fresh interaction
      }
      try {
        speechRecognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        // Ensure state is consistent if start fails
        setIsListening(false); 
      }
    }
  };
  
  useEffect(() => {
    if (chatSession && !isInitialized && !isLoadingAI && transcript.filter(m => m.sender === SenderType.GEMINI).length === 0) {
      const initializeAIFlow = async () => {
        //  console.log("Initializing AI flow by sending placeholder system message.");
         await onSendMessage("", SenderType.SYSTEM); 
         setIsInitialized(true); 
      };
      const timerId = setTimeout(initializeAIFlow, 200); 
      return () => clearTimeout(timerId); 
    }
  }, [chatSession, isInitialized, isLoadingAI, onSendMessage, transcript]);

  const interviewerDisplayName = interviewSettings.interviewerName || interviewSettings.company;
  const micButtonDisabled = !isListening && isLoadingAI && !isAISpeaking;


  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
          Mock Interview: {interviewSettings.role} at {interviewSettings.company}
          {interviewSettings.isInternship && " (Internship)"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Interviewer: {interviewerDisplayName} | Candidate: {userSettings.fullName || "You"}
        </p>
      </div>

      <div className="flex-grow p-4 sm:p-6 space-y-3 overflow-y-auto bg-slate-50">
        {transcript.map((entry) => {
          if (entry.sender === SenderType.SYSTEM && entry.text === "") { 
            return null;
          }
          return (
            <div key={entry.id} className={`flex ${entry.sender === SenderType.USER ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow ${
                  entry.sender === SenderType.USER 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : entry.sender === SenderType.GEMINI 
                    ? 'bg-slate-200 text-slate-800 rounded-bl-none'
                    : 'bg-amber-100 text-amber-800 text-xs italic rounded-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {entry.sender === SenderType.USER ? userSettings.fullName || 'You' : entry.sender === SenderType.GEMINI ? `${interviewerDisplayName} (Interviewer)` : 'System'}
                  {' - '}
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {isLoadingAI && transcript.length > 0 && transcript[transcript.length-1]?.sender === SenderType.USER && (
             <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-slate-200 text-slate-800 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <LoadingSpinner size="h-4 w-4" color="text-blue-600" />
                        <span className="text-sm italic text-slate-600">{interviewerDisplayName} is thinking...</span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-sm text-slate-500 w-1/3">
          {isListening && "Listening..."}
          {isAISpeaking && `${interviewerDisplayName} speaking...`}
          {isLoadingAI && !isAISpeaking && `${interviewerDisplayName} Processing...`}
          {!isListening && !isAISpeaking && !isLoadingAI && "Ready."}
        </div>
        
        <button
          onClick={toggleListen}
          disabled={micButtonDisabled}
          className={`p-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
              : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'}
            disabled:bg-slate-300 disabled:cursor-not-allowed`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <MicOffIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
        </button>

        <div className="w-1/3 flex justify-end">
            <button
            onClick={onEndInterview}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
            aria-label="End Interview"
            >
            <EndCallIcon className="w-5 h-5" />
            <span>End Interview</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallInterface;
