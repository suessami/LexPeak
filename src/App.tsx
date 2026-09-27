import { useState } from "react";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import CodeGate from "./pages/CodeGate";
import { getStudentCode } from "./data/studentCode";

type View = { name: "home" } | { name: "session"; unitNo: number };

const reportCode = new URLSearchParams(window.location.search).get("report");

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });
  const [hasCode, setHasCode] = useState(() => !!getStudentCode());

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
        onExit={() => setView({ name: "home" })}
      />
    );
  }

  return (
    <HomePage
      onStartUnit={(unitNo) => setView({ name: "session", unitNo })}
    />
  );
}
