import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SessionPage, { type Stage } from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import CodeGate from "./pages/CodeGate";
import { getStudentCode, clearStudentCode } from "./data/studentCode";
import { applyRemoteReset } from "./data/cloudSync";

type View =
  | { name: "home" }
  | { name: "session"; unitNo: number; startAt?: Stage };

const reportCode = new URLSearchParams(window.location.search).get("report");

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [hasCode, setHasCode] = useState(() => !!getStudentCode());

  // Check once per load (and after logging in) whether the teacher reset
  // this student's progress; if so, local progress was just cleared, so
  // reload to show a fresh Home.
  useEffect(() => {
    if (!hasCode) return;
    applyRemoteReset().then((didReset) => {
      if (didReset) window.location.reload();
    });
  }, [hasCode]);

  if (reportCode) {
    return <ReportPage code={reportCode} />;
  }

  if (!hasCode) {
    return <CodeGate onDone={() => setHasCode(true)} />;
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
        setView({ name: "home" });
      }}
    />
  );
}
