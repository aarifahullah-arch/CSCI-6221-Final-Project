// components/JobRankDisplay.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  if (score >= 60) return { text: "#000", bar: "#000" };
  if (score >= 40) return { text: "#555", bar: "#555" };
  return { text: "#999", bar: "#999" };
}

function Navbar({ onHome, onUpload }) {
  return (
    <nav style={s.navbar}>
      <div style={{ ...s.brandWrap, cursor: "pointer" }} onClick={onHome}>
        <div style={s.logo}>JM</div>
        <div>
          <p style={s.brandTitle}>JobMatch</p>
          <p style={s.brandSub}>Search smarter, apply faster</p>
        </div>
      </div>
      <div style={s.navLinks}>
        <button style={s.navButtonSecondary} onClick={onHome}>Home</button>
        <button style={s.navButtonPrimary} onClick={onUpload}>Resume Upload</button>
      </div>
    </nav>
  );
}

export default function JobRankDisplay({ jobs = MOCK_JOBS }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showBanner, setShowBanner]     = useState(false);
  const router = useRouter();

  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  const handleJobLinkClick = (e, url) => {
    e.preventDefault();
    setShowBanner(true);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={s.page}>
      <Navbar onHome={() => router.push("/")} onUpload={() => router.push("/upload")} />

      <div style={s.content}>
        <h1 style={s.heading}>Your job matches</h1>
        <p style={s.sub}>Showing {visibleJobs.length} of {jobs.length} results</p>

        {showBanner && (
          <div style={s.banner}>
            <p style={s.bannerText}>
              ⚠ Some listings may have expired or been filled. If a link returns a 404, the position is no longer available.
            </p>
            <button onClick={() => setShowBanner(false)} style={s.bannerClose}>✕</button>
          </div>
        )}

        {visibleJobs.map((job, index) => {
          const mc = matchColor(job.matchScore);
          return (
            <div key={job.id} style={s.card}>
              <span style={s.rank}>#{index + 1}</span>

              <div style={s.jobInfo}>
                <p style={s.jobTitle}>{job.title}</p>
                <p style={s.jobMeta}>{job.company} · {job.location}</p>
                {job.url && (
                  <a
                    href={job.url}
                    style={s.jobLink}
                    onClick={(e) => handleJobLinkClick(e, job.url)}
                  >
                    View Job →
                  </a>
                )}
              </div>

              <div style={s.scoreWrap}>
                <span style={{ ...s.scoreText, color: mc.text }}>{job.matchScore}%</span>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width: `${job.matchScore}%`, background: mc.bar }} />
                </div>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <button style={s.showMore} onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>
            Show more ({jobs.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  page:       { background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial, sans-serif" },

  navbar:     { display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 32px", background: "white", borderBottom: "1px solid #ddd" },
  brandWrap:  { display: "flex", gap: 10, alignItems: "center" },
  logo:       { width: 40, height: 40, background: "#000", color: "#fff",
                display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  brandTitle: { margin: 0, fontWeight: "bold", fontSize: 14 },
  brandSub:   { margin: 0, fontSize: 12, color: "gray" },
  navLinks:   { display: "flex", gap: 10, alignItems: "center" },
  navButtonPrimary:   { background: "#000", color: "#fff", border: "none",
                        padding: "8px 14px", cursor: "pointer", fontSize: 13 },
  navButtonSecondary: { border: "1px solid #000", background: "white",
                        padding: "8px 14px", cursor: "pointer", fontSize: 13 },

  content:    { maxWidth: 600, margin: "48px auto", padding: "0 20px" },
  heading:    { fontSize: 22, fontWeight: 700, color: "#000", marginBottom: 4 },
  sub:        { fontSize: 14, color: "#555", marginBottom: 24 },

  banner:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #f59e0b",
                padding: "10px 14px", marginBottom: 16, gap: 10 },
  bannerText: { fontSize: 13, color: "#92400e", margin: 0 },
  bannerClose:{ background: "none", border: "none", cursor: "pointer",
                color: "#92400e", fontSize: 16, flexShrink: 0, padding: 0 },

  card:       { background: "#fff", border: "1px solid #ddd",
                padding: "16px 20px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 16 },

  rank:       { fontSize: 13, color: "#bbb", minWidth: 28, fontWeight: 600 },

  jobInfo:    { flex: 1 },
  jobTitle:   { fontSize: 15, fontWeight: 600, color: "#000", margin: "0 0 2px 0" },
  jobMeta:    { fontSize: 13, color: "#666", margin: "0 0 6px 0" },
  jobLink:    { fontSize: 12, color: "#000", textDecoration: "underline",
                fontWeight: 500, cursor: "pointer" },

  scoreWrap:  { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  scoreText:  { fontSize: 16, fontWeight: 600 },
  barTrack:   { width: 80, height: 4, background: "#eee" },
  barFill:    { height: "100%", transition: "width 0.3s" },

  showMore:   { width: "100%", marginTop: 8, padding: "12px 0",
                background: "#fff", border: "1px solid #ddd",
                fontSize: 14, color: "#333", cursor: "pointer" },
};
