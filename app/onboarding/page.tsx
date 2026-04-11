"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHaptics } from "@/hooks/useHaptics";
import { nativeFetch } from "@/lib/native-fetch";

const SCREENS = [
  {
    id: "welcome",
    icon: "◆",
    title: "Lattice へようこそ",
    description: "あなたの AI エージェントが\n24時間働き続ける場所",
    cta: "次へ",
  },
  {
    id: "create",
    icon: "🤖",
    title: "エージェントを作成",
    description: "タスクを AI に任せて\n自動実行。複雑な作業も数秒で。",
    cta: "次へ",
  },
  {
    id: "start",
    icon: "🚀",
    title: "さあ、始めよう",
    description: "最初のエージェントを作成するか、\nテンプレートストアから選択。",
    cta: "始める",
  },
];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const router = useRouter();
  const { trigger } = useHaptics();

  const goTo = (i: number) => {
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  const handleNext = async () => {
    trigger("light");
    if (index < SCREENS.length - 1) {
      goTo(index + 1);
    } else {
      await complete();
    }
  };

  const complete = async () => {
    trigger("success");
    try {
      await nativeFetch("/api/user/complete-onboarding", { method: "POST" });
    } catch {}
    router.replace("/home/");
  };

  const screen = SCREENS[index];

  return (
    <div className="onboarding-root">
      <button className="onboarding-skip" onClick={complete}>
        スキップ
      </button>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={screen.id}
          custom={dir}
          className="onboarding-screen"
          initial={{ opacity: 0, x: dir * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -60 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50 && index < SCREENS.length - 1) goTo(index + 1);
            else if (info.offset.x > 50 && index > 0) goTo(index - 1);
          }}
        >
          <motion.div
            className="onboarding-icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
          >
            {screen.icon}
          </motion.div>
          <h1 className="onboarding-title">{screen.title}</h1>
          <p className="onboarding-desc">{screen.description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SCREENS.map((_, i) => (
            <span key={i} className={`dot ${i === index ? "active" : ""}`} />
          ))}
        </div>
        <button className="onboarding-cta" onClick={handleNext}>
          {screen.cta}
        </button>
      </div>
    </div>
  );
}
