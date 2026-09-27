import { useState } from "react";
import { setStudentCode, isMasterCode } from "../data/studentCode";
import { verifyStudentCode } from "../data/cloudSync";
import duoWave from "../assets/mascot/duo-wave-both.webp";

export default function CodeGate({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  async function submit() {
    const code = value.trim();
    if (!code) return;

    if (isMasterCode(code)) {
      setStudentCode(code);
      onDone();
      return;
    }

    setStatus("checking");
    const ok = await verifyStudentCode(code);
    if (!ok) {
      setStatus("error");
      return;
    }
    setStudentCode(code);
    onDone();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div>
          <img
            src={duoWave}
            alt=""
            className="w-32 h-auto object-contain mx-auto mb-2"
          />
          <h1 className="text-3xl font-extrabold text-[#14274d]">
            Hey there!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to LexPeak — enter your student code to get started
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white shadow-md border border-slate-200 p-6 flex flex-col gap-3">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Student code"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg tracking-wide focus:outline-none focus:border-[#14274d]"
          />
          {status === "error" && (
            <p className="text-sm text-red-500">
              That code wasn't found. Please double-check with your teacher.
            </p>
          )}
          <button
            onClick={submit}
            disabled={status === "checking"}
            className="w-full rounded-xl bg-[#14274d] text-white font-semibold py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "checking" ? "Checking…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
