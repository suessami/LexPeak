/**
 * A brief transition screen shown between two stages of a session. Without
 * this, moving from e.g. the MCQ quiz straight into the tap-to-find stage
 * felt like one continuous blur rather than distinct steps — this gives
 * each stage its own clear "here's what's next" beat, mirroring the same
 * pattern already used for the review intro / milestone screens.
 */
export default function StageIntro({
  eyebrow,
  title,
  body,
  buttonLabel,
  onContinue,
}: {
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  onContinue: () => void;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 p-8 flex flex-col items-center gap-3 text-center">
      <span className="text-xs uppercase tracking-wide font-medium text-[#e8722c]">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-bold text-[#14274d]">{title}</h2>
      <p className="text-slate-600 leading-relaxed">{body}</p>
      <button
        onClick={onContinue}
        className="w-full rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition mt-2"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
