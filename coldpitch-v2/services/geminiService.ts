import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { 
    GEMINI_MODEL_NAME, 
    REVIEWER_SYSTEM_INSTRUCTION_TEMPLATE, 
    MOCK_INTERVIEWER_SYSTEM_INSTRUCTION_TEMPLATE,
    MOCK_INTERVIEW_REVIEW_SYSTEM_INSTRUCTION_TEMPLATE
} from '../constants';
import { 
    Message, ScenarioDetail, UserSettings, ReviewData, 
    MockInterviewSettings, TranscriptEntry, InterviewReviewData 
} from '../types';

let ai: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API Key not found in process.env at getAIInstance.");
      throw new Error("API Key not found. Please set process.env.API_KEY.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// For Networking Simulator
export const startChatSession = (systemInstructionString: string): Chat => {
  const generativeAI = getAIInstance();
  return generativeAI.chats.create({
    model: GEMINI_MODEL_NAME,
    config: { systemInstruction: systemInstructionString },
    history: [] 
  });
};

// For Mock Interview
export const startInterviewChatSession = (interviewSettings: MockInterviewSettings, userSettings: UserSettings): Chat => {
  const generativeAI = getAIInstance();
  const systemInstructionString = MOCK_INTERVIEWER_SYSTEM_INSTRUCTION_TEMPLATE(interviewSettings, userSettings);
  return generativeAI.chats.create({
    model: GEMINI_MODEL_NAME,
    config: { systemInstruction: systemInstructionString },
    history: [] // Start with no history, AI will initiate
  });
};


export async function* sendMessageStream(
  chat: Chat,
  messageText: string
): AsyncGenerator<string, void, undefined> {
  try {
    const stream = await chat.sendMessageStream({ message: messageText });
    for await (const chunk of stream) { // chunk is GenerateContentResponse
      // According to guidelines, chunk.text directly provides the string.
      const textContent = chunk.text; // Access the text property
      if (typeof textContent === 'string') { // Ensure it's a string before yielding
        yield textContent;
      }
    }
  } catch (error) {
    console.error('Error in sendMessageStream:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while sending message to Gemini API.");
  }
}

// For Networking Simulator Review
export const getConversationReview = async (
  chatHistory: Message[],
  scenario: ScenarioDetail,
  userSettings: UserSettings
): Promise<ReviewData | null> => {
  const generativeAI = getAIInstance();
  const prompt = REVIEWER_SYSTEM_INSTRUCTION_TEMPLATE(chatHistory, scenario, userSettings);

  try {
    const response: GenerateContentResponse = await generativeAI.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    
    const parsedData = JSON.parse(jsonStr) as ReviewData;
    if (parsedData && typeof parsedData.assessment === 'string' && Array.isArray(parsedData.tips) && typeof parsedData.rating === 'number') {
      return parsedData;
    } else {
      console.error("Parsed networking review data does not match expected structure:", parsedData);
      return null;
    }
  } catch (error) {
    console.error('Error getting networking conversation review from Gemini API:', error);
    if (error instanceof Error && error.message.toLowerCase().includes("api key")) throw error;
    return null;
  }
};

// For Mock Interview Review
export const getInterviewReview = async (
  transcript: TranscriptEntry[],
  interviewSettings: MockInterviewSettings,
  userSettings: UserSettings
): Promise<InterviewReviewData | null> => {
    const generativeAI = getAIInstance();
    const prompt = MOCK_INTERVIEW_REVIEW_SYSTEM_INSTRUCTION_TEMPLATE(transcript, interviewSettings, userSettings);

    try {
        const response: GenerateContentResponse = await generativeAI.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) jsonStr = match[2].trim();

        const parsedData = JSON.parse(jsonStr) as InterviewReviewData;
        if (
            parsedData &&
            typeof parsedData.overallAssessment === 'string' &&
            Array.isArray(parsedData.strengths) &&
            Array.isArray(parsedData.areasForImprovement) &&
            Array.isArray(parsedData.suggestedFocus) &&
            typeof parsedData.finalRating === 'number'
        ) {
            return parsedData;
        } else {
            console.error("Parsed interview review data does not match expected structure:", parsedData);
            return null;
        }
    } catch (error) {
        console.error('Error getting interview review from Gemini API:', error);
        if (error instanceof Error && error.message.toLowerCase().includes("api key")) throw error;
        return null;
    }
};