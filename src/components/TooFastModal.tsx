import lexStop from "../assets/mascot/lex-stop.webp";

/**
 * Anti-guessing gate, ported from 문단속's TooFastModal: if a student taps an
 * answer within MIN_TIME_MS of the question appearing, the tap is rejected
 * outright (no answer recorded, no penalty) and this notice asks them to
 * actually read the question first.
 */
export default function TooFastModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200">
        <img
          src={lexStop}
          alt=""
          className="w-24 h-auto object-contain mx-auto mb-3"
        />
        <h3 className="text-lg font-bold text-[#14274d] mb-2">
          Whoa, slow down!
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Take a moment to actually read the question before you choose.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-[#14274d] text-white font-medium py-3 hover:opacity-90 transition"
        >
          Read it again
        </button>
      </div>
    </div>
  );
}
