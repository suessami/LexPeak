import { canSpeak, speak } from "../lib/speak";

/** Small round speaker button that reads `text` aloud. Hidden on devices without speech. */
export default function SpeakButton({
  text,
  label = "Listen",
  size = "md",
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
}) {
  if (!canSpeak) return null;
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const icon = size === "sm" ? 14 : 16;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={`${dim} shrink-0 inline-flex items-center justify-center rounded-full bg-[#14274d]/8 text-[#14274d] hover:bg-[#e8722c] hover:text-white active:scale-95 transition align-middle`}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
