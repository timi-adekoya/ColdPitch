import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';

interface SettingsPageProps {
  currentSettings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentSettings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(currentSettings);

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-700";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-700 mb-6 sm:mb-8">
        Personalize Your Simulation
      </h2>
      <p className="text-sm text-slate-600 mb-6 text-center">
        Fill in your details below. This information will be used to tailor the scenario placeholders and help you practice more effectively.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className={labelClass}>Full Name</label>
          <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="e.g., Jane Doe" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="universityName" className={labelClass}>University Name</label>
            <input type="text" name="universityName" id="universityName" value={formData.universityName} onChange={handleChange} className={inputClass} placeholder="e.g., State University" />
          </div>
          <div>
            <label htmlFor="major" className={labelClass}>Major / Area of Study</label>
            <input type="text" name="major" id="major" value={formData.major} onChange={handleChange} className={inputClass} placeholder="e.g., Computer Science" />
          </div>
        </div>

        <div>
          <label htmlFor="yearOfStudy" className={labelClass}>Year of Study</label>
          <input type="text" name="yearOfStudy" id="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className={inputClass} placeholder="e.g., 3rd Year Undergraduate, Master's Student" />
        </div>

        <div>
          <label htmlFor="keySkills" className={labelClass}>Key Skills (comma-separated)</label>
          <input type="text" name="keySkills" id="keySkills" value={formData.keySkills} onChange={handleChange} className={inputClass} placeholder="e.g., Python, React, Data Analysis, Public Speaking" />
        </div>

        <div>
          <label htmlFor="jobInterests" className={labelClass}>Job Interests</label>
          <textarea name="jobInterests" id="jobInterests" value={formData.jobInterests} onChange={handleChange} rows={2} className={inputClass} placeholder="e.g., Software Engineering Internships, Product Management roles at tech companies, UX Design positions" />
        </div>

        <div>
          <label htmlFor="researchInterests" className={labelClass}>Research Interests (if applicable)</label>
          <textarea name="researchInterests" id="researchInterests" value={formData.researchInterests} onChange={handleChange} rows={2} className={inputClass} placeholder="e.g., AI ethics, Machine Learning applications in healthcare, Climate change modeling" />
        </div>
        
        <div>
          <label htmlFor="dreamCompanies" className={labelClass}>Dream Companies/Organizations (comma-separated)</label>
          <input type="text" name="dreamCompanies" id="dreamCompanies" value={formData.dreamCompanies} onChange={handleChange} className={inputClass} placeholder="e.g., Google, NASA, Doctors Without Borders" />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
