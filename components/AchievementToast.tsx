"use client";

import { useEffect, createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const AchievementContext = createContext<{ show: (a: Achievement) => void }>({ show: () => {} });

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Achievement | null>(null);
  return (
    <AchievementContext.Provider value={{ show: setCurrent }}>
      {children}
      <AchievementToastInner achievement={current} onDismiss={() => setCurrent(null)} />
    </AchievementContext.Provider>
  );
}

export const useAchievement = () => useContext(AchievementContext);

function AchievementToastInner({ achievement, onDismiss }: { achievement: Achievement | null; onDismiss: () => void }) {
  const { trigger } = useHaptics();

  useEffect(() => {
    if (!achievement) return;
    trigger("success");
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onDismiss}
          style={{
            position: "fixed",
            top: "calc(12px + env(safe-area-inset-top, 0px))",
            left: 16,
            right: 16,
            zIndex: 99999,
            background: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ fontSize: 32, lineHeight: 1 }}>{achievement.icon}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", margin: "0 0 2px" }}>{achievement.title}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>{achievement.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
