// components/JobRankDisplay.jsx
"use client";

import { useState } from "react";

const MOCK_JOBS = [
  { id: "1", title: "Senior Frontend Engineer", company: "Stripe", location: "Remote", matchScore: 94 },
  { id: "2", title: "React Developer", company: "Shopify", location: "Toronto, ON", matchScore: 87 },
  { id: "3", title: "UI Engineer", company: "Notion", location: "San Francisco, CA", matchScore: 74 },
  { id: "4", title: "Frontend Engineer II", company: "Vercel", location: "Remote", matchScore: 68 },
  { id: "5", title: "Software Engineer, Web", company: "Figma", location: "New York, NY", matchScore: 61 },
  { id: "6", title: "Junior Frontend Developer", company: "Webflow", location: "Remote", matchScore: 52 },
  { id: "7", title: "React Native Developer", company: "Airbnb", location: "San Francisco, CA", matchScore: 48 },
  { id: "8", title: "Frontend Architect", company: "Atlassian", location: "Remote", matchScore: 43 },
  { id: "9", title: "Web Engineer", company: "Pinterest", location: "New York, NY", matchScore: 39 },
  { id: "10", title: "UI Developer", company: "Dropbox", location: "Remote", matchScore: 35 },
  { id: "11", title: "Software Engineer, Frontend", company: "Slack", location: "Toronto, ON", matchScore: 31 },
  { id: "12", title: "Frontend Engineer", company: "Asana", location: "San Francisco, CA", matchScore: 27 },
];

const PAGE_SIZE = 10;

function matchColor(score) {
  if (score >= 80) return { text: "#0f6e56", bar: "#1D9E75" };
  if (score >= 60) return { text: "#854f0b", bar: "#EF9F27" };
  return { text: "#a32d2d", bar: "#E24B4A" };
}

export default function JobRankDisplay({ jobs = MOCK_JOBS }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showBanner, setShowBanner] = useState(false);

  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  const handleJobLinkClick = (e, url) => {
    e.preventDefault();
    setShowBanner(true);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Your job matches</h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: showBanner ? 12 : 24 }}>
        Showing {visibleJobs.length} of {jobs.length} results
      </p>

      {showBanner && (
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
          padding: "10px 14px", marginBottom: 16, gap: 10,
        }}>
          <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
            ⚠️ Some listings may have expired or been filled. If a link returns a 404, the position is no longer available.
          </p>
          <button
            onClick={() => setShowBanner(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e", fontSize: 16, flexShrink: 0, padding: 0 }}
          >✕</button>
        </div>
      )}

      {visibleJobs.map((job, index) => {
        const mc = matchColor(job.matchScore);
        return (
          <div key={job.id} style={{
            background: "#fff",
            border: "1px solid #e8e8e6",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <span style={{ fontSize: 13, color: "#aaa", minWidth: 24 }}>#{index + 1}</span>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{job.title}</p>
              <p style={{ fontSize: 13, color: "#888", marginBottom: job.url ? 6 : 0 }}>{job.company} · {job.location}</p>
              {job.url && (
                <a
                  href={job.url}
                  style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}
                  onClick={(e) => handleJobLinkClick(e, job.url)}
                >
                  View Job →
                </a>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: mc.text }}>{job.matchScore}%</span>
              <div style={{ width: 80, height: 4, background: "#eee", borderRadius: 99 }}>
                <div style={{ width: `${job.matchScore}%`, height: "100%", background: mc.bar, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "12px 0",
            background: "#fff",
            border: "1px solid #e8e8e6",
            borderRadius: 12,
            fontSize: 14,
            color: "#555",
            cursor: "pointer",
          }}
        >
          Show more ({jobs.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}