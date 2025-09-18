
"use client";

import { useEffect, useState }from 'react';
import { usePathname, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setProgress(30); // Start with a small progress value

    const timer = setTimeout(() => {
      setProgress(75);
    }, 100); // Give it a bit more progress

    return () => {
      clearTimeout(timer);
      // On cleanup, finish the progress and hide
      setProgress(100);
      setTimeout(() => {
          setIsVisible(false);
      }, 500); // Wait for animation to finish
    };
  }, [pathname, searchParams]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <Progress value={progress} className="h-1" />
    </div>
  );
}
