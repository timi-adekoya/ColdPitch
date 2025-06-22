export enum SenderType {
  USER = 'user',
  GEMINI = 'gemini',
  REVIEWER = 'reviewer', // For networking sim review
  SYSTEM = 'system',     // For system messages in interview transcript
}

export interface ReviewData { // For Networking Simulator
  assessment: string;
  tips: string[];
  rating: number;
}

export interface InterviewReviewData { // For Mock Interview
  overallAssessment: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestedFocus: string[];
  finalRating: number;
}

export interface Message { // Used for Networking Simulator chat
  id: string;
  text: string;
  sender: SenderType;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  review?: ReviewData; 
}

export interface TranscriptEntry { // Used for Mock Interview transcript
  id: string;
  text: string;
  sender: SenderType;
  timestamp: Date;
}

export enum ScenarioType {
  RECRUITER_COLD_MESSAGE = 'RECRUITER_COLD_MESSAGE',
  ALUMNI_INFO_INTERVIEW = 'ALUMNI_INFO_INTERVIEW',
  EMPLOYER_COLD_EMAIL = 'EMPLOYER_COLD_EMAIL',
  RESEARCHER_INQUIRY = 'RESEARCHER_INQUIRY',
}

export interface UserSettings {
  fullName: string;
  universityName: string;
  major: string;
  yearOfStudy: string;
  keySkills: string; 
  jobInterests: string; 
  researchInterests: string; 
  dreamCompanies: string; 
}

export interface ScenarioDetail { // For Networking Simulator
  id: ScenarioType;
  name: string;
  description: string;
  systemInstruction: (settings: UserSettings) => string; 
  placeholder: (settings: UserSettings | null) => string;
  avatarEmoji: string;
}

// Represents the main view of the application
export enum AppMode {
  HOME, 
  NETWORKING_SIMULATOR, 
  MOCK_INTERVIEW_SETUP, 
  MOCK_INTERVIEW_CALL,   
  MOCK_INTERVIEW_REVIEW,
  SETTINGS // Added for general settings page
}

// For Mock Interview
export enum InterviewRole {
  SOFTWARE_ENGINEER = "Software Engineer",
  DATA_ANALYST = "Data Analyst",
  PRODUCT_MANAGER = "Product Manager",
  UI_UX_DESIGNER = "UI/UX Designer",
  AI_ML_ENGINEER = "AI/ML Engineer",
  HR_SPECIALIST = "HR Specialist",
  MARKETING_COORDINATOR = "Marketing Coordinator",
  FINANCIAL_ANALYST = "Financial Analyst",
  MANAGEMENT_CONSULTANT = "Management Consultant",
  BUSINESS_ANALYST = "Business Analyst",
  // Add more roles as needed
}

export const ALL_INTERVIEW_ROLES: InterviewRole[] = Object.values(InterviewRole);

export interface MockInterviewSettings {
  role: InterviewRole;
  company: string;
  isInternship: boolean;
  interviewerName?: string; // Added for randomized interviewer name
}

// AppView was for networking sim, renaming to NetworkingAppView for clarity
// And using AppMode for the top-level application state.
export enum NetworkingAppView {
  SCENARIOS,
  CHAT,
  SETTINGS
}