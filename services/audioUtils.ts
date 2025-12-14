/**
 * Converts a base64 string to an ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encodes Raw PCM data (Float32) to WAV format.
 * Gemini usually returns raw PCM or mono audio that needs headers for browser playback.
 * Assuming 24kHz sample rate based on Gemini standard outputs usually, 
 * but we can adjust if needed.
 */
export function pcmToWav(pcmData: Float32Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Decodes a raw base64 audio string (no header) into an AudioBuffer
 * so we can get the raw PCM data to re-encode as WAV.
 */
export async function decodeBase64Audio(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    // Basic decoding helper
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a temporary buffer. 
    // Gemini output is often raw PCM, so AudioContext.decodeAudioData might fail if it expects a header.
    // However, the GenAI SDK example implies we need to implement manual decoding for raw PCM.
    // The example provided in guidelines:
    // "The audio bytes returned by the API is raw PCM data."
    
    // Manual decoding assuming 16-bit PCM little-endian (standard for Gemini)
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32Data.length, 24000); // 24kHz is standard for Gemini Flash Audio
    buffer.getChannelData(0).set(float32Data);
    return buffer;
}
