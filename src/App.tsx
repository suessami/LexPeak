import { useState } from "react";
import HomePage from "./pages/HomePage";
import SessionPage, { type Stage } from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import CodeGate from "./pages/CodeGate";
import StageIntro from "./components/StageIntro";
import { getStudentCode, isMasterCode, clearStudentCode } from "./data/studentCode";
import { TOTAL_UNITS } from "./data/course";
import { getNextUnit } from "./data/progress";

type View =
  | { name: "home" }
  | { name: "session"; unitNo: number; startAt?: Stage };

const reportCode = new URLSearchParams(window.location.search).get("report");
const SESSION_INTRO_SHOWN_KEY = "vocabapp_session_intro_shown";

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [hasCode, setHasCode] = useState(() => !!getStudentCode());
  // Landing straight on the unit list felt like walking into the middle of
  // something. This announces what's next before handing off to Home.
  // Tracked in sessionStorage (not localStorage): opening the URL fresh —
  // a new tab, or the same tab after being closed — always shows it again,
  // but reloading the same still-open tab after dismissing it won't loop
  // back into it repeatedly.
  const [showSessionIntro, setShowSessionIntro] = useState(
    () => sessionStorage.getItem(SESSION_INTRO_SHOWN_KEY) !== "1",
  );

  if (reportCode) {
    return <ReportPage code={reportCode} />;
  }

  if (!hasCode) {
    return <CodeGate onDone={() => setHasCode(true)} />;
  }

  if (showSessionIntro && view.name === "home" && !isMasterCode(getStudentCode())) {
    const nextUnit = getNextUnit(TOTAL_UNITS);
    if (nextUnit) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
          <StageIntro
            eyebrow="Today's Session"
            title={`Unit ${nextUnit}`}
            body="Let's pick up where you left off — starting with a Warm-up."
            buttonLabel="Let's Go"
            onContinue={() => {
              sessionStorage.setItem(SESSION_INTRO_SHOWN_KEY, "1");
              setShowSessionIntro(false);
            }}
          />
        </div>
      );
    }
  }

  if (view.name === "session") {
    return (
      <SessionPage
        unitNo={view.unitNo}
        startAt={view.startAt}
        onExit={() => setView({ name: "home" })}
      />
    );
  }

  return (
    <HomePage
      onStartUnit={(unitNo, startAt) =>
        setView({ name: "session", unitNo, startAt })
      }
      onLogout={() => {
        clearStudentCode();
        setHasCode(false);
        setShowSessionIntro(true);
        setView({ name: "home" });
      }}
    />
  );
}
