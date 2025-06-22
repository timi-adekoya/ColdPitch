
import React from 'react';
import { ScenarioDetail } from '../types';

interface ScenarioSelectorProps {
  scenarios: ScenarioDetail[];
  onSelectScenario: (scenario: ScenarioDetail) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, onSelectScenario }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-slate-700 mb-8">Choose a Networking Scenario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-4">{scenario.avatarEmoji}</span>
              <h3 className="text-xl font-semibold text-left">{scenario.name}</h3>
            </div>
            <p className="text-sm text-blue-100 text-left">{scenario.description}</p>
          </button>
        ))}
      </div>
       <p className="mt-8 text-center text-sm text-slate-500">
        Select a scenario to start practicing your networking skills with an AI powered by Gemini.
      </p>
    </div>
  );
};

export default ScenarioSelector;
