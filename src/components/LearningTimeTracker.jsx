import { useEffect } from "react";
import {
  startLearningTimeTracker,
  stopLearningTimeTracker
} from "../lib/learningTimeService";

export default function LearningTimeTracker({ activePage }) {
  useEffect(() => {
    if (!activePage) return;

    startLearningTimeTracker({
      page: activePage,
      entityType: "page",
      entityId: activePage
    });

    return () => {
      stopLearningTimeTracker();
    };
  }, [activePage]);

  return null;
}
