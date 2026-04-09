"use client";

import { useEffect, useState } from "react";
import JobRankDisplay from "../components/JobRankDisplay";

export default function RankingsPage() {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("jobMatches");
    if (stored) {
      try {
        setJobs(JSON.parse(stored));
      } catch {
        setJobs([]);
      }
    } else {
      setJobs([]);
    }
  }, []);

  // Wait until localStorage is read before rendering
  if (jobs === null) return null;

  return <JobRankDisplay jobs={jobs} />;
}
