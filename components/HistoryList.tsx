import React from 'react';
import { HistoryItem } from '../types';
import { Download, Play, Pause, Clock, Trash2 } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  currentlyPlayingId: string | null;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, currentlyPlayingId, onPlay, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50">
        <p>No hay audios generados aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-indigo-400" /> Historial
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 hover:border-indigo-500/50 transition-all ring-1 ring-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium text-slate-200 line-clamp-1 w-2/3" title={item.textSnippet}>
                {item.textSnippet}
              </div>
              <span className="text-xs text-slate-500">
                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3 bg-slate-900/50 p-2 rounded-md border border-slate-700/50">
                <span className="bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/50">{item.settings.accent}</span>
                <span className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-900/50">{item.settings.style}</span>
                <span>{item.settings.speed}x</span>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => onPlay(item.id)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                  currentlyPlayingId === item.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {currentlyPlayingId === item.id ? <Pause size={14} className="mr-1.5" /> : <Play size={14} className="mr-1.5" />}
                {currentlyPlayingId === item.id ? 'Pausar' : 'Reproducir'}
              </button>
              
              <div className="flex space-x-2">
                 <a 
                    href={item.audioUrl} 
                    download={`voice-gen-${item.id}.wav`}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-colors"
                    title="Descargar"
                 >
                    <Download size={18} />
                 </a>
                 <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                    title="Eliminar"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;