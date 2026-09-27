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

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [hasCode, setHasCode] = useState(() => !!getStudentCode());
  // Landing straight on the unit list felt like walking into the middle of
  // something. This shows once per app open, announcing what's next, before
  // handing off to the Home screen — same "here's what's coming" beat as
  // the stage transitions inside a session.
  const [showSessionIntro, setShowSessionIntro] = useState(true);

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
            onContinue={() => setShowSessionIntro(false)}
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
