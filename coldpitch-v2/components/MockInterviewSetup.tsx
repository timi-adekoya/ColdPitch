import React, { useState } from 'react';
import { MockInterviewSettings, InterviewRole, UserSettings, ALL_INTERVIEW_ROLES } from '../types';

interface MockInterviewSetupProps {
  onSubmit: (settings: Omit<MockInterviewSettings, 'interviewerName'>) => void;
  userSettings: UserSettings; // To display user info as context
}

const MockInterviewSetup: React.FC<MockInterviewSetupProps> = ({ onSubmit, userSettings }) => {
  const [role, setRole] = useState<InterviewRole>(ALL_INTERVIEW_ROLES[0]);
  const [company, setCompany] = useState<string>('');
  const [isInternship, setIsInternship] = useState<boolean>(false);
  const [companyError, setCompanyError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setCompanyError('Company name is required.');
      return;
    }
    setCompanyError('');
    onSubmit({ role, company: company.trim(), isInternship });
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-700";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-700 mb-6">
        Mock Interview Setup
      </h2>
      <p className="text-sm text-slate-600 mb-6 text-center">
        Configure the details for your mock interview session. 
        Your profile: <strong className="text-blue-600">{userSettings.fullName || 'User'}</strong>, a {userSettings.yearOfStudy || 'student'} in {userSettings.major || 'their major'}.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="role" className={labelClass}>Select Role:</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as InterviewRole)}
            className={inputClass}
          >
            {ALL_INTERVIEW_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>Company Name:</label>
          <input
            type="text"
            id="company"
            name="company"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              if (companyError && e.target.value.trim()) setCompanyError('');
            }}
            className={`${inputClass} ${companyError ? 'border-red-500' : ''}`}
            placeholder="e.g., Google, Microsoft, Local Startup"
          />
          {companyError && <p className="text-red-500 text-xs mt-1">{companyError}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="isInternship"
            name="isInternship"
            type="checkbox"
            checked={isInternship}
            onChange={(e) => setIsInternship(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isInternship" className="ml-2 block text-sm text-slate-700">
            This is an internship position
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Start Interview
          </button>
        </div>
      </form>
    </div>
  );
};

export default MockInterviewSetup;