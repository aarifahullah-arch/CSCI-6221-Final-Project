"use client";

import React from "react";

export default function WebsiteHome({
  onNavigateToUpload,
  onNavigateToRankings,
}) {
  const handleUpload = onNavigateToUpload || (() => {});
  const handleRankings = onNavigateToRankings || (() => {});

  const jobs = [
    {
      title: "Frontend Developer",
      match: "92% match",
      tags: "React · JavaScript · UI",
    },
    {
      title: "Data Analyst",
      match: "87% match",
      tags: "Python · SQL · Dashboards",
    },
    {
      title: "Software Engineer",
      match: "84% match",
      tags: "APIs · OOP · Problem Solving",
    },
  ];

  return (
    <div style={s.page}>
      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.brandWrap}>
          <div style={s.logo}>JM</div>
          <div>
            <p style={s.brandTitle}>JobMatch</p>
            <p style={s.brandSub}>Search smarter, apply faster</p>
          </div>
        </div>

        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <button style={s.navButtonSecondary} onClick={handleUpload}>
            Resume Upload
          </button>
          <button style={s.navButtonPrimary} onClick={handleRankings}>
            Job Rankings
          </button>
        </div>
      </nav>

      {/* HERO */}
      <main>
        <section style={s.heroSection}>
          <div style={s.heroLeft}>
            <div style={s.badge}>LinkedIn · Indeed · Dice · Company Sites</div>

            <h1 style={s.heroTitle}>
              Find jobs that actually match your resume.
            </h1>

            <p style={s.heroText}>
              Search across multiple job platforms in one place and discover
              opportunities ranked based on your current skills and experience.
            </p>

            <div style={s.heroButtons}>
              <button style={s.ctaPrimary} onClick={handleUpload}>
                Go to Resume Upload
              </button>
              <button style={s.ctaSecondary} onClick={handleRankings}>
                View Job Rankings
              </button>
            </div>
          </div>

          {/* PREVIEW CARD */}
          <div style={s.heroRight}>
            <div style={s.previewCard}>
              <div style={s.previewHeader}>
                <div>
                  <p style={s.previewTitle}>Match Preview</p>
                  <p style={s.previewSub}>Example ranked roles</p>
                </div>
                <span style={s.previewBadge}>AI Fit</span>
              </div>

              {jobs.map((job) => (
                <div key={job.title} style={s.matchItem}>
                  <div>
                    <p style={s.matchTitle}>{job.title}</p>
                    <p style={s.matchTags}>{job.tags}</p>
                  </div>
                  <span style={s.matchBadge}>{job.match}</span>
                </div>
              ))}

              <button style={s.previewAction} onClick={handleRankings}>
                Open Rankings Page
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={s.section}>
          <h2 style={s.sectionTitle}>Why use JobMatch?</h2>

          <div style={s.featureGrid}>
            <div style={s.featureCard}>
              <h3>All job boards in one place</h3>
              <p>
                Combine LinkedIn, Indeed, Dice, and company sites into a single
                search experience.
              </p>
            </div>

            <div style={s.featureCard}>
              <h3>Resume-based matching</h3>
              <p>
                See which jobs fit your current resume before spending time editing.
              </p>
            </div>

            <div style={s.featureCard}>
              <h3>Ranked results</h3>
              <p>
                Focus on high-fit opportunities instead of applying blindly.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#f9fafb",
    minHeight: "100vh",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "white",
    borderBottom: "1px solid #ddd",
  },

  brandWrap: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  logo: {
    width: "40px",
    height: "40px",
    background: "black",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
  },

  brandTitle: { margin: 0, fontWeight: "bold" },
  brandSub: { margin: 0, fontSize: "12px", color: "gray" },

  navLinks: { display: "flex", gap: "10px", alignItems: "center" },

  navLink: { textDecoration: "none", color: "black" },

  navButtonPrimary: {
    background: "black",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },

  navButtonSecondary: {
    border: "1px solid black",
    background: "white",
    padding: "8px 12px",
    cursor: "pointer",
  },

  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    padding: "40px",
    gap: "20px",
  },

  heroLeft: { maxWidth: "50%" },

  heroTitle: { fontSize: "36px", marginBottom: "10px" },

  heroText: { color: "#555" },

  heroButtons: { marginTop: "20px", display: "flex", gap: "10px" },

  ctaPrimary: {
    background: "black",
    color: "white",
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
  },

  ctaSecondary: {
    border: "1px solid black",
    padding: "10px 16px",
    background: "white",
    cursor: "pointer",
  },

  heroRight: { width: "40%" },

  previewCard: {
    background: "white",
    padding: "20px",
    border: "1px solid #ddd",
  },

  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  previewTitle: { margin: 0, fontWeight: "bold" },
  previewSub: { margin: 0, fontSize: "12px", color: "gray" },

  previewBadge: {
    background: "black",
    color: "white",
    padding: "4px 8px",
    fontSize: "12px",
  },

  matchItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    border: "1px solid #eee",
    padding: "10px",
  },

  matchTitle: { margin: 0 },
  matchTags: { margin: 0, fontSize: "12px", color: "gray" },

  matchBadge: {
    background: "#eee",
    padding: "4px 8px",
    fontSize: "12px",
  },

  previewAction: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  section: {
    padding: "40px",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "24px",
    marginBottom: "20px",
  },

  featureGrid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },

  featureCard: {
    background: "white",
    padding: "20px",
    border: "1px solid #ddd",
    width: "250px",
  },

  badge: {
    background: "#eee",
    padding: "5px 10px",
    display: "inline-block",
    marginBottom: "10px",
  },
};