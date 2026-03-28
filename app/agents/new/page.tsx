import { Suspense } from "react";
import NewAgentClient from "./NewAgentClient";

export default function NewAgentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#111318" }} />}>
      <NewAgentClient />
    </Suspense>
  );
}