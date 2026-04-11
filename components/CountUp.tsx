"use client";

import { useEffect, useState } from "react";

export default function CountUp({
  to,
  duration = 800,
  format = (n: number) => Math.round(n).toString(),
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(to * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(to);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);

  return <>{format(value)}</>;
}
