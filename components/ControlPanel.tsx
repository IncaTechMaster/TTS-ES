import React from 'react';
import { Accent, Style } from '../types';
import { Settings2, Globe, Sparkles, Gauge, Activity, RotateCcw, FileAudio } from 'lucide-react';

interface ControlPanelProps {
  accent: Accent;
  style: Style;
  speed: number;
  pitch: number;
  setAccent: (val: Accent) => void;
  setStyle: (val: Style) => void;
  setSpeed: (val: number) => void;
  setPitch: (val: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  accent, style, speed, pitch,
  setAccent, setStyle, setSpeed, setPitch
}) => {

  // Convert internal speed (0.5 - 2.0) to UI scale (-10 to 10)
  // 0.5 = -10
  // 1.0 = 0
  // 2.0 = 10
  const getUiSpeed = (val: number) => {
    if (val === 1.0) return 0;
    if (val < 1.0) return Math.round((val - 1) * 20); // (0.5 - 1) * 20 = -10
    return Math.round((val - 1) * 10); // (2.0 - 1) * 10 = 10
  };

  const setInternalSpeed = (uiVal: number) => {
    if (uiVal === 0) setSpeed(1.0);
    else if (uiVal < 0) setSpeed(1 + (uiVal / 20)); // 1 + (-10/20) = 0.5
    else setSpeed(1 + (uiVal / 10)); // 1 + (10/10) = 2.0
  };

  const uiSpeed = getUiSpeed(speed);

  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-xl border border-slate-700 space-y-6 ring-1 ring-white/5">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center border-b border-slate-700 pb-2">
        <Settings2 className="w-4 h-4 mr-2 text-indigo-400" /> Panel de Control
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Accent */}
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center">
            <Globe className="w-3 h-3 mr-1.5 text-indigo-400" /> ACENTO
            </label>
            <div className="relative">
            <select
                value={accent}
                onChange={(e) => setAccent(e.target.value as Accent)}
                className="w-full py-2 pl-3 text-sm border border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white shadow-sm appearance-none cursor-pointer pr-8"
            >
                {Object.values(Accent).map((val) => (
                <option key={val} value={val} className="text-white bg-slate-800">{val}</option>
                ))}
            </select>
            </div>
        </div>

        {/* Style */}
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex items-center">
            <Sparkles className="w-3 h-3 mr-1.5 text-yellow-400" /> ESTILO
            </label>
            <div className="relative">
            <select
                value={style}
                onChange={(e) => setStyle(e.target.value as Style)}
                className="w-full py-2 pl-3 text-sm border border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-white shadow-sm appearance-none cursor-pointer pr-8"
            >
                {Object.values(Style).map((val) => (
                <option key={val} value={val} className="text-white bg-slate-800">{val}</option>
                ))}
            </select>
            </div>
        </div>
      </div>

      <div className="space-y-5 pt-2">
        {/* Speed Slider - Mimicking SAPI 5 / Balabolka */}
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-400 flex items-center">
                    <Gauge className="w-3 h-3 mr-1.5 text-green-400" /> VELOCIDAD
                </label>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-indigo-300 w-8 text-right">{uiSpeed > 0 ? `+${uiSpeed}` : uiSpeed}</span>
                    <button 
                        onClick={() => setSpeed(1.0)} 
                        className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white transition-colors"
                        title="Restablecer velocidad"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
            </div>
            
            <div className="relative h-6 flex items-center">
                <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={uiSpeed}
                    onChange={(e) => setInternalSpeed(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10"
                />
                {/* Tick marks */}
                <div className="absolute w-full flex justify-between px-1 text-[8px] text-slate-600 -bottom-4 font-mono">
                    <span>-10</span>
                    <span>0</span>
                    <span>10</span>
                </div>
            </div>
        </div>

        {/* Pitch Slider */}
        <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-400 flex items-center">
                    <Activity className="w-3 h-3 mr-1.5 text-red-400" /> TONO
                </label>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-indigo-300 w-8 text-right">{pitch > 0 ? `+${pitch}` : pitch}</span>
                    <button 
                        onClick={() => setPitch(0)} 
                        className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white transition-colors"
                        title="Restablecer tono"
                    >
                        <RotateCcw size={12} />
                    </button>
                </div>
            </div>
            <div className="relative h-6 flex items-center">
                <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={pitch}
                    onChange={(e) => setPitch(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10"
                />
                <div className="absolute w-full flex justify-between px-1 text-[8px] text-slate-600 -bottom-4 font-mono">
                    <span>-10</span>
                    <span>0</span>
                    <span>10</span>
                </div>
            </div>
        </div>

        {/* Format Selector (Visual Only) */}
        <div className="pt-4 border-t border-slate-700">
             <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center">
                <FileAudio className="w-3 h-3 mr-1.5 text-blue-400" /> FORMATO DE SALIDA
            </label>
            <select className="w-full py-1.5 pl-3 text-xs border border-slate-600 rounded bg-slate-900 text-slate-300 shadow-sm focus:outline-none focus:border-indigo-500">
                <option value="wav">WAV (Alta Calidad)</option>
                <option value="mp3">MP3 (Comprimido - Simulado)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
                * La generación nativa es WAV. Para MP3 utilice un convertidor externo si es crítico.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;