import { Suspense } from "react";
import NewAgentClient from "./NewAgentClient";

export default function NewAgentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0e1117" }} />}>
      <NewAgentClient />
    </Suspense>
  );
}