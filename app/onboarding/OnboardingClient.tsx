"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import StepIndicator from "@/components/onboarding/StepIndicator";
import ConceptStep from "@/components/onboarding/steps/ConceptStep";
import ExamplesStep from "@/components/onboarding/steps/ExamplesStep";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";

const STEPS = [ConceptStep, ExamplesStep, InterestsStep] as const;

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  };
  const prev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleComplete = async () => {
    setSubmitting(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests }),
    });
    router.push("/home");
  };

  const isLast = step === 2;

  const renderStep = () => {
    if (step === 2) return <InterestsStep selected={interests} onToggle={toggleInterest} />;
    const StepComponent = STEPS[step];
    return <StepComponent />;
  };

  const btnStyle = {
    padding: "12px 28px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600 as const,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    border: "none",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        background: "var(--bg)",
        transition: "background .25s",
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text-display)",
          letterSpacing: "0.08em",
          margin: "0 0 40px",
        }}
      >
        LATTICE
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: 380,
          minHeight: 280,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 32 }}>
        <StepIndicator total={3} current={step} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          width: "100%",
          maxWidth: 380,
          justifyContent: "center",
        }}
      >
        {step > 0 && (
          <button
            onClick={prev}
            style={{
              ...btnStyle,
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-visible)",
            }}
          >
            戻る
          </button>
        )}
        <button
          onClick={isLast ? handleComplete : next}
          disabled={submitting}
          style={{
            ...btnStyle,
            background: "var(--accent)",
            color: "#fff",
            opacity: submitting ? 0.6 : 1,
            flex: 1,
            maxWidth: 200,
          }}
        >
          {submitting ? "保存中..." : isLast ? "始める" : "次へ"}
        </button>
      </div>
    </div>
  );
}
