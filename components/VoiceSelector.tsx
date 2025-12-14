import React from 'react';
import { AVAILABLE_VOICES } from '../services/geminiService';
import { VoiceOption, Gender } from '../types';
import { Mic, User } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelect: (id: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoiceId, onSelect }) => {
  const women = AVAILABLE_VOICES.filter(v => v.gender === Gender.Female as any);
  const men = AVAILABLE_VOICES.filter(v => v.gender === Gender.Male as any);

  const renderButton = (voice: VoiceOption) => {
    const isSelected = voice.id === selectedVoiceId;
    return (
      <button
        key={voice.id}
        onClick={() => onSelect(voice.id)}
        className={`flex items-center px-3 py-2 rounded-md border transition-all w-full group text-left ${
          isSelected
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
            : 'bg-slate-700/30 text-slate-300 border-slate-600 hover:border-indigo-500/50 hover:bg-slate-700/80'
        }`}
      >
        <div className={`p-1.5 rounded-full mr-3 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400 group-hover:text-indigo-300'}`}>
          <User size={14} />
        </div>
        <div>
          <div className="font-semibold text-xs leading-tight">{voice.name}</div>
          <div className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
             {voice.baseToneDescription.split(' ')[0]} {voice.baseToneDescription.split(' ')[1]}...
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-xl border border-slate-700 ring-1 ring-white/5 h-full">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
        <Mic className="w-4 h-4 mr-2 text-indigo-400" /> Voces Disponibles
      </h3>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        <div>
           <div className="text-[10px] font-bold text-slate-500 mb-2 px-1 uppercase tracking-widest">Femeninas</div>
           <div className="space-y-1.5">
            {women.map(renderButton)}
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-700/50">
          <div className="text-[10px] font-bold text-slate-500 mb-2 px-1 uppercase tracking-widest mt-2">Masculinas</div>
          <div className="space-y-1.5">
            {men.map(renderButton)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;