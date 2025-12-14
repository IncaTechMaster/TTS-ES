import React, { useState, useRef, useEffect } from 'react';
import { Accent, Style, HistoryItem, GenerationSettings } from './types';
import { AVAILABLE_VOICES, generateAudio } from './services/geminiService';
import VoiceSelector from './components/VoiceSelector';
import ControlPanel from './components/ControlPanel';
import HistoryList from './components/HistoryList';
import { MessageSquare, Wand2, AlertCircle, Volume2, Info, FolderOpen, Save, Eraser, FileText } from 'lucide-react';

export default function App() {
  // State
  const [text, setText] = useState<string>('');
  const [voiceId, setVoiceId] = useState<string>(AVAILABLE_VOICES[0].id);
  // Default accent changed to Peru as requested
  const [accent, setAccent] = useState<Accent>(Accent.Peru);
  const [style, setStyle] = useState<Style>(Style.Natural);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Audio Playback
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      history.forEach(item => URL.revokeObjectURL(item.audioUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const insertTag = (tag: string) => {
    setText(prev => prev + ` ${tag} `);
  };

  // --- File Handling Logic ---
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
        setError('Por favor, selecciona un archivo de texto (.txt)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
        setError(null);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleClearText = () => {
    if(confirm("¿Estás seguro de borrar todo el texto?")) {
        setText('');
    }
  };

  const handleSaveAudio = () => {
      // Mimic "Save Audio" action - effectively finding the last generated item and clicking download
      if (history.length > 0) {
          const lastItem = history[0];
          const a = document.createElement('a');
          a.href = lastItem.audioUrl;
          a.download = `voice-gen-${lastItem.id}.wav`;
          a.click();
      } else {
          setError("No hay audio generado para guardar.");
      }
  };
  // ---------------------------

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Por favor, introduce algún texto para generar audio.");
      return;
    }
    
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 15000) {
        setError("El texto excede el límite recomendado de 15,000 palabras.");
        return;
    }

    setIsGenerating(true);
    setError(null);

    const settings: GenerationSettings = {
      text,
      voiceId,
      accent,
      style,
      speed,
      pitch
    };

    try {
      const wavBlob = await generateAudio(settings);
      const audioUrl = URL.createObjectURL(wavBlob);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        textSnippet: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        settings,
        audioUrl
      };

      setHistory(prev => [newItem, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generando el audio. Comprueba tu API Key y conexión.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (id: string) => {
    const item = history.find(h => h.id === id);
    if (!item) return;

    if (currentlyPlayingId === id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        setCurrentlyPlayingId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setCurrentlyPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setCurrentlyPlayingId(id);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
        const item = prev.find(i => i.id === id);
        if (item) URL.revokeObjectURL(item.audioUrl);
        return prev.filter(i => i.id !== id);
    });
    if (currentlyPlayingId === id) {
        audioRef.current?.pause();
        setCurrentlyPlayingId(null);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-12 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="hidden" />

      {/* App Toolbar (Desktop Style) */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between sticky top-0 z-30 shadow-md">
         <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 mr-4">
                 <div className="bg-indigo-600 p-1.5 rounded text-white">
                    <Volume2 size={18} />
                 </div>
                 <span className="font-bold text-lg tracking-tight hidden sm:block">VozGen Pro</span>
             </div>
             
             {/* Toolbar Buttons */}
             <div className="flex space-x-1 border-l border-slate-600 pl-4">
                 <button onClick={handleOpenFile} className="flex flex-col items-center px-3 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors group">
                    <FolderOpen size={20} className="mb-0.5 text-yellow-500 group-hover:text-yellow-400" />
                    <span className="text-[10px]">Abrir TXT</span>
                 </button>
                 <button onClick={handleSaveAudio} className="flex flex-col items-center px-3 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors group">
                    <Save size={20} className="mb-0.5 text-blue-500 group-hover:text-blue-400" />
                    <span className="text-[10px]">Guardar</span>
                 </button>
                 <button onClick={handleClearText} className="flex flex-col items-center px-3 py-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors group">
                    <Eraser size={20} className="mb-0.5 text-red-500 group-hover:text-red-400" />
                    <span className="text-[10px]">Borrar</span>
                 </button>
             </div>
         </div>
         <div className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 hidden sm:block">
            Gemini 2.5 Flash TTS
         </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 h-[calc(100vh-80px)]">
        
        {/* Left Sidebar: Voices */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 h-full overflow-hidden">
             <VoiceSelector selectedVoiceId={voiceId} onSelect={setVoiceId} />
        </div>

        {/* Center: Input Area & Main Controls */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col h-full space-y-4">
            
            {/* Input Wrapper */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col flex-grow relative overflow-hidden ring-1 ring-white/5">
                 {/* Formatting Bar */}
                <div className="bg-slate-900/80 border-b border-slate-700 p-2 flex items-center space-x-2 overflow-x-auto">
                    <span className="text-xs text-slate-500 font-bold px-2 uppercase">Etiquetas:</span>
                    <button onClick={() => insertTag('[pausa]')} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded transition-colors whitespace-nowrap" title="Pausar lectura 2s">[pausa]</button>
                    <button onClick={() => insertTag('[risa]')} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded transition-colors whitespace-nowrap" title="Insertar risa">[risa]</button>
                    <button onClick={() => insertTag('[grito]')} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded transition-colors whitespace-nowrap" title="Hablar a gritos">[grito]</button>
                    <button onClick={() => insertTag('[llanto]')} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-2 py-1 rounded transition-colors whitespace-nowrap" title="Simular llanto">[llanto]</button>
                </div>
                
                <textarea
                    className="flex-1 w-full p-6 bg-slate-800 focus:outline-none resize-none text-white placeholder-slate-500 text-lg leading-relaxed font-mono"
                    placeholder="Escribe aquí o carga un archivo .txt usando el botón 'Abrir TXT'..."
                    value={text}
                    onChange={handleTextChange}
                />

                {/* Status Bar */}
                <div className="bg-slate-950 px-4 py-2 text-xs text-slate-400 flex justify-between items-center border-t border-slate-700">
                    <div className="flex items-center">
                        <FileText size={12} className="mr-1.5" />
                        <span>Archivo: {wordCount === 0 ? 'Nuevo Documento' : 'Sin título.txt'}</span>
                    </div>
                    <div className={`${wordCount > 15000 ? 'text-red-400 font-bold' : ''}`}>
                        Palabras: {wordCount.toLocaleString()} / 15,000
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-900/30 text-red-200 px-4 py-3 rounded-lg border border-red-800/50 flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            {/* Generate Button Area */}
            <div className="flex-shrink-0">
                 <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !text}
                    className={`w-full py-3 rounded-xl shadow-lg flex items-center justify-center text-lg font-bold transition-all border ${
                        isGenerating || !text
                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:translate-y-0.5'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando texto...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5 mr-2" /> Convertir Texto a Audio
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Right Sidebar: Settings & History */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4 h-full overflow-y-auto pb-20 lg:pb-0 custom-scrollbar">
             {/* Mobile Voice Selector (Visible only on small screens) */}
             <div className="lg:hidden">
                 <VoiceSelector selectedVoiceId={voiceId} onSelect={setVoiceId} />
             </div>

            <ControlPanel 
                accent={accent} 
                style={style} 
                speed={speed} 
                pitch={pitch}
                setAccent={setAccent}
                setStyle={setStyle}
                setSpeed={setSpeed}
                setPitch={setPitch}
            />

            <HistoryList 
                items={history} 
                currentlyPlayingId={currentlyPlayingId}
                onPlay={playAudio}
                onDelete={deleteHistoryItem}
            />
        </div>

      </main>
    </div>
  );
}