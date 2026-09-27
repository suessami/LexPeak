import { useState } from "react";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import CodeGate from "./pages/CodeGate";
import StageIntro from "./components/StageIntro";
import { getStudentCode, isMasterCode, clearStudentCode } from "./data/studentCode";
import { TOTAL_UNITS } from "./data/course";
import { getNextUnit } from "./data/progress";

type View = { name: "home" } | { name: "session"; unitNo: number };

const reportCode = new URLSearchParams(window.location.search).get("report");
const SESSION_INTRO_DATE_KEY = "vocabapp_session_intro_date";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [hasCode, setHasCode] = useState(() => !!getStudentCode());
  // Landing straight on the unit list felt like walking into the middle of
  // something. This shows once per DAY (not once per page load — reopening
  // the same URL later the same day shouldn't re-interrupt), announcing
  // what's next, before handing off to Home — same "here's what's coming"
  // beat as the stage transitions inside a session.
  const [showSessionIntro, setShowSessionIntro] = useState(
    () => localStorage.getItem(SESSION_INTRO_DATE_KEY) !== todayKey(),
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
              localStorage.setItem(SESSION_INTRO_DATE_KEY, todayKey());
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
        onExit={() => setView({ name: "home" })}
      />
    );
  }

  return (
    <HomePage
      onStartUnit={(unitNo) => setView({ name: "session", unitNo })}
      onLogout={() => {
        clearStudentCode();
        setHasCode(false);
        setShowSessionIntro(true);
        setView({ name: "home" });
      }}
    />
  );
}
