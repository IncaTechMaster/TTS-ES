import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationSettings, VoiceOption, Gender, Accent } from "../types";
import { decodeBase64Audio, pcmToWav } from "./audioUtils";

// Map our UI voices to Gemini Prebuilt voices
// Gemini Voices: Puck, Charon, Kore, Fenrir, Zephyr
export const AVAILABLE_VOICES: VoiceOption[] = [
  // Women (First as requested)
  { id: 'f1', name: 'Valentina', gender: Gender.Female, geminiVoice: 'Kore', baseToneDescription: 'Voz femenina clara y versátil' },
  { id: 'f2', name: 'Camila', gender: Gender.Female, geminiVoice: 'Zephyr', baseToneDescription: 'Voz femenina suave y tranquila' },
  { id: 'f3', name: 'Isabella', gender: Gender.Female, geminiVoice: 'Kore', baseToneDescription: 'Voz femenina dinámica y alegre' },
  { id: 'f4', name: 'Sofía', gender: Gender.Female, geminiVoice: 'Zephyr', baseToneDescription: 'Voz femenina profunda y profesional' },
  { id: 'f5', name: 'Mariana', gender: Gender.Female, geminiVoice: 'Kore', baseToneDescription: 'Voz femenina dulce y amable' },
  // Men
  { id: 'm1', name: 'Mateo', gender: Gender.Male, geminiVoice: 'Puck', baseToneDescription: 'Voz masculina estándar y amigable' },
  { id: 'm2', name: 'Santiago', gender: Gender.Male, geminiVoice: 'Fenrir', baseToneDescription: 'Voz profunda, seria y autoritaria' },
  { id: 'm3', name: 'Leonardo', gender: Gender.Male, geminiVoice: 'Charon', baseToneDescription: 'Voz grave, madura y narrativa' },
  { id: 'm4', name: 'Diego', gender: Gender.Male, geminiVoice: 'Puck', baseToneDescription: 'Voz joven, rápida y enérgica' },
  { id: 'm5', name: 'Gabriel', gender: Gender.Male, geminiVoice: 'Fenrir', baseToneDescription: 'Voz suave, pausada y reflexiva' },
];

const ACCENT_PROMPTS: Record<string, string> = {
  [Accent.Spain]: 'Español de España (Castellano), pronunciación peninsular con distinción de s/z.',
  [Accent.Mexico]: 'Español de México, acento mexicano natural y auténtico.',
  [Accent.Argentina]: 'Español Rioplatense (Argentina), entonación característica y sheísmo marcado.',
  [Accent.Peru]: 'Español de Perú, acento limeño neutro, claro y pausado.',
  [Accent.Colombia]: 'Español de Colombia, acento colombiano (bogotano/paisa) con entonación melódica.',
};

export const generateAudio = async (settings: GenerationSettings): Promise<Blob> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Find the selected voice config
  const selectedVoice = AVAILABLE_VOICES.find(v => v.id === settings.voiceId) || AVAILABLE_VOICES[0];

  // --- LOGIC UPDATE FOR SPEED AND PITCH ---
  // Create much more granular descriptions so the model reacts to small slider changes.
  
  let speedInstruction = "";
  if (settings.speed <= 0.6) speedInstruction = "extremadamente lenta, arrastrando las palabras (slow motion)";
  else if (settings.speed <= 0.8) speedInstruction = "muy lenta, pausada y deliberada";
  else if (settings.speed < 1.0) speedInstruction = "un poco más lenta de lo normal, relajada";
  else if (settings.speed === 1.0) speedInstruction = "velocidad de conversación natural y estándar";
  else if (settings.speed <= 1.1) speedInstruction = "ligeramente animada y fluida";
  else if (settings.speed <= 1.3) speedInstruction = "rápida, dinámica y ágil";
  else if (settings.speed <= 1.6) speedInstruction = "muy rápida, apresurada y urgente";
  else speedInstruction = "extremadamente rápida, casi frenética (fast paced)";

  let pitchInstruction = "";
  if (settings.pitch <= -8) pitchInstruction = "tono extremadamente grave y profundo (sub-bass)";
  else if (settings.pitch <= -5) pitchInstruction = "tono muy grave y resonante";
  else if (settings.pitch < 0) pitchInstruction = "tono ligeramente más grave de lo habitual";
  else if (settings.pitch === 0) pitchInstruction = "tono natural de la voz";
  else if (settings.pitch <= 4) pitchInstruction = "tono ligeramente más agudo y brillante";
  else if (settings.pitch <= 7) pitchInstruction = "tono agudo y juvenil";
  else pitchInstruction = "tono muy agudo y alto";

  const accentInstruction = ACCENT_PROMPTS[settings.accent] || `Español con acento de ${settings.accent}`;

  const promptText = `
    Eres un actor de voz profesional. Tu tarea es leer el texto con las siguientes especificaciones EXACTAS.
    
    CONFIGURACIÓN OBLIGATORIA:
    1. IDIOMA Y ACENTO: ${accentInstruction}. (Mantén este acento pase lo que pase).
    2. ESTILO: ${settings.style}.
    3. VELOCIDAD: ${speedInstruction}. (Esta instrucción sobrescribe cualquier descripción base de la voz).
    4. TONO: ${pitchInstruction}.
    5. VOZ BASE: ${selectedVoice.baseToneDescription}.

    INSTRUCCIONES DE FORMATO:
    - [pausa]: Haz una pausa clara de 2 segundos.
    - [risa]: Ríete o di la frase riendo.
    - [grito]: Grita o exclama con mucha fuerza.
    - [llanto]: Habla sollozando.
    
    TEXTO A LEER:
    "${settings.text}"
  `;

  // Use the TTS model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{
      parts: [{ text: promptText }]
    }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: selectedVoice.geminiVoice
          }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio content generated.");
  }

  // Use AudioContext to decode the raw PCM and then re-encode as WAV for compatibility
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeBase64Audio(base64Audio, audioContext);
  
  // Convert AudioBuffer to WAV Blob
  const wavBlob = pcmToWav(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
  
  return wavBlob;
};