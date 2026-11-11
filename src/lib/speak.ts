/**
 * Pronunciation via the browser's built-in speech synthesis (the device's
 * own voice: Apple on iPhone/Mac, Microsoft/Google on Windows/Android).
 * No audio files; quality depends on the device.
 */

export const canSpeak =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Nicer voices first, where the device has them.
const PREFERRED = [
  "Samantha", "Ava", "Allison", "Google US English",
  "Microsoft Aria", "Microsoft Jenny", "Microsoft Guy",
];

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not loaded yet; try next time
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  cachedVoice =
    PREFERRED.map((n) => en.find((v) => v.name.includes(n))).find(Boolean) ??
    en.find((v) => v.lang === "en-US") ??
    en[0] ??
    null;
  return cachedVoice;
}

if (canSpeak) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}

/** Headwords store open slots as "~" or "sb/sth"; read them naturally. */
export function speakableText(text: string): string {
  return text
    .replace(/\bsb\/sth\b/g, "something")
    .replace(/\s*~\s*$/g, "")
    .replace(/~/g, "something")
    .replace(/\s+/g, " ")
    .trim();
}

export function speak(text: string, rate = 0.9) {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(speakableText(text));
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "en-US";
  u.rate = rate;
  synth.speak(u);
}
