import { useEffect, useState } from "react";

export function useCountdown(startedAt: string, durationMinutes: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    return Math.max(0, Math.round(durationMinutes * 60 - elapsed));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setRemainingSeconds(Math.max(0, Math.round(durationMinutes * 60 - elapsed)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const label = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { remainingSeconds, label, isExpired: remainingSeconds <= 0 };
}
