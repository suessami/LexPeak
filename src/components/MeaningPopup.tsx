/**
 * Small Korean-meaning bubble shown right under a blank the moment it's
 * filled with the correct word (or revealed after two misses). It confirms
 * the meaning without needing a tap, then fades out on its own (~1.8s,
 * see .meaning-pop in index.css). Parent must be `relative`.
 */
export default function MeaningPopup({ text }: { text: string }) {
  return (
    <span
      className="meaning-pop pointer-events-none absolute left-1/2 top-full mt-1.5 z-10 whitespace-nowrap rounded-lg bg-[#14274d] px-2.5 py-1 text-sm font-semibold text-white shadow-md"
      style={{ transform: "translate(-50%, 0)" }}
    >
      {text}
    </span>
  );
}
