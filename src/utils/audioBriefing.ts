/**
 * TerraHarmonia Voice Audio Briefing
 * Native Web Speech API synthesis for hands-free command center situation updates.
 * Automatically adapts speech language and matching synthesizer voice (Indonesian vs English).
 */

import { AOIRegion } from '../engine/harmonizer';
import { Language } from '../data/translations';

let isSpeaking = false;

// Helper to find the best matching voice for the target language
function getBestVoiceForLanguage(synth: SpeechSynthesis, language: Language): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;

  if (language === 'id') {
    // 1. Look for Indonesian language tag (id-ID, id)
    const idVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('id') ||
        v.name.toLowerCase().includes('indonesia') ||
        v.name.toLowerCase().includes('bahasa')
    );
    if (idVoice) return idVoice;
  } else {
    // 2. Look for English language tag (en-US, en-GB, en)
    const enVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en-us') ||
        v.lang.toLowerCase().startsWith('en-gb') ||
        v.lang.toLowerCase().startsWith('en')
    );
    if (enVoice) return enVoice;
  }

  return null;
}

export function speakSituationBriefing(
  aoi: AOIRegion,
  hotspotCount: number,
  anomalyCount: number,
  language: Language,
  onStateChange?: (speaking: boolean) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert(
      language === 'id'
        ? 'Web Speech API tidak didukung pada browser ini.'
        : 'Web Speech API is not supported on this browser.'
    );
    return;
  }

  const synth = window.speechSynthesis;

  // If already speaking, cancel/toggle off
  if (synth.speaking || isSpeaking) {
    synth.cancel();
    isSpeaking = false;
    if (onStateChange) onStateChange(false);
    return;
  }

  // Generate localized text briefing
  let text = '';
  if (language === 'id') {
    text = `Laporan Situasi Wanareksa. Wilayah pengamatan aktif: ${aoi.name}. Tipe ekosistem: ${aoi.biome}. Terdeteksi ${hotspotCount.toLocaleString('id-ID')} titik panas dalam rekaman pengamatan satelit dengan ${anomalyCount} minggu anomali historis. Status kewaspadaan kebakaran gambut berada pada level siaga. Disarankan pemantauan tinggi muka air tanah dan patroli sekat kanal secara intensif.`;
  } else {
    text = `Wanareksa Situation Briefing. Active monitoring region: ${aoi.name}. Biome type: ${aoi.biome}. Detected ${hotspotCount.toLocaleString('en-US')} total satellite hotspot records with ${anomalyCount} historical anomaly weeks. Peatland fire alert level is elevated. Immediate groundwater table monitoring and canal block patrols are recommended.`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
  utterance.rate = 0.95; // Clear natural pacing
  utterance.pitch = 1.0;

  // Assign matching native voice if available in user's OS/browser
  const selectedVoice = getBestVoiceForLanguage(synth, language);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    isSpeaking = true;
    if (onStateChange) onStateChange(true);
  };

  utterance.onend = () => {
    isSpeaking = false;
    if (onStateChange) onStateChange(false);
  };

  utterance.onerror = () => {
    isSpeaking = false;
    if (onStateChange) onStateChange(false);
  };

  synth.speak(utterance);
}

export function stopSpeakingBriefing(onStateChange?: (speaking: boolean) => void) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    if (onStateChange) onStateChange(false);
  }
}
