"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const ACCEPTED_MIME = "application/pdf";
const ACCEPTED_EXT  = ".pdf";
const MAX_PREVIEW_CHARS = 1500;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Navbar({ onHome, onRankings }) {
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
        <button style={s.navButtonPrimary} onClick={onRankings}>Job Rankings</button>
      </div>
    </nav>
  );
}

export default function ResumeUpload({
  apiEndpoint = "/api/resume",
  maxSizeMB = 5,
}) {
  const [file, setFile]             = useState(null);
  const [status, setStatus]         = useState("idle");
  const [error, setError]           = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview]       = useState(null);

  const fileInputRef = useRef(null);
  const router = useRouter();

  const validateFile = useCallback((candidate) => {
    if (!candidate) return false;
    const mimeOk = candidate.type === ACCEPTED_MIME;
    const extOk  = candidate.name.toLowerCase().endsWith(ACCEPTED_EXT);
    if (!mimeOk && !extOk) {
      setError("Only PDF files are supported. Please upload a .pdf resume.");
      return false;
    }
    if (candidate.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds the ${maxSizeMB} MB limit.`);
      return false;
    }
    setError("");
    return true;
  }, [maxSizeMB]);

  const handleFileChange = (candidate) => {
    setPreview(null);
    if (validateFile(candidate)) {
      setFile(candidate);
      setStatus("selected");
    } else {
      setFile(null);
      setStatus("error");
    }
  };

  const onInputChange = (e) => {
    handleFileChange(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError("");
    setStatus("idle");
  };

  const handleSubmit = async () => {
    if (!file || status === "uploading") return;
    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(apiEndpoint, { method: "POST", body: formData });
      const json = await response.json();

      if (!response.ok || json.ok === false) {
        throw new Error(json.message ?? `Server error ${response.status}`);
      }

      const matches = json.data?.matches ?? [];
      localStorage.setItem("jobMatches", JSON.stringify(matches));

      setPreview({
        filename:      json.data?.filename      ?? file.name,
        extractedText: json.data?.extractedText ?? "(No text returned from server)",
        matches,
      });
      setStatus("preview");

    } catch (err) {
      setError(err.message ?? "Upload failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div style={s.page}>
      <Navbar onHome={() => router.push("/")} onRankings={() => router.push("/rankings")} />

      <div style={s.wrapper}>
        <h2 style={s.heading}>Upload Your Resume</h2>
        <p style={s.sub}>PDF only · Max {maxSizeMB} MB</p>

        {status !== "preview" && (
          <>
            <div
              style={{
                ...s.dropZone,
                ...(isDragging            ? s.dropZoneActive   : {}),
                ...(status === "selected" ? s.dropZoneSelected : {}),
              }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Resume upload area"
              onKeyDown={(e) => e.key === "Enter" && !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXT}
                style={{ display: "none" }}
                onChange={onInputChange}
                aria-label="Select PDF resume"
              />

              {!file ? (
                <div style={s.emptyState}>
                  <UploadIcon />
                  <p style={s.dropText}>
                    {isDragging ? "Drop it here!" : "Drag & drop your PDF resume"}
                  </p>
                  <p style={s.orText}>or</p>
                  <button
                    style={s.browseBtn}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div style={s.fileCard}>
                  <PdfBadge />
                  <div style={s.fileInfo}>
                    <span style={s.fileName}>{file.name}</span>
                    <span style={s.fileMeta}>PDF · {formatBytes(file.size)}</span>
                  </div>
                  <button
                    style={s.removeBtn}
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    aria-label="Remove file"
                  >✕</button>
                </div>
              )}
            </div>

            {error && <p style={s.errorMsg} role="alert">{error}</p>}

            <button
              style={{
                ...s.submitBtn,
                ...(!file || status === "uploading" ? s.submitBtnDisabled : {}),
              }}
              onClick={handleSubmit}
              disabled={!file || status === "uploading"}
              aria-busy={status === "uploading"}
            >
              {status === "uploading" ? "Analyzing…" : "Analyze Resume →"}
            </button>
          </>
        )}

        {status === "preview" && preview && (
          <PreviewPanel
            preview={preview}
            onReset={reset}
            onViewMatches={() => router.push("/rankings")}
          />
        )}
      </div>
    </div>
  );
}

function PreviewPanel({ preview, onReset, onViewMatches }) {
  const { filename, extractedText, matches = [] } = preview;
  const isTruncated = extractedText.length > MAX_PREVIEW_CHARS;
  const displayText = isTruncated
    ? extractedText.slice(0, MAX_PREVIEW_CHARS) + "\n\n… (truncated)"
    : extractedText;

  return (
    <div style={s.previewWrapper}>

      <div style={s.successBadge}>
        <CheckIcon /> Resume parsed successfully
      </div>

      <div style={s.previewFilename}>
        <PdfBadge />
        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#000" }}>{filename}</span>
      </div>

      <div style={s.textBoxWrapper}>
        <p style={s.textBoxLabel}>Extracted Text Preview</p>
        <pre style={s.textBox}>{displayText}</pre>
        {isTruncated && (
          <p style={s.truncateNote}>
            Showing first {MAX_PREVIEW_CHARS} characters. Full text sent to matching engine.
          </p>
        )}
      </div>

      {matches.length > 0 && (
        <button style={s.viewMatchesBtn} onClick={onViewMatches}>
          View Job Matches →
        </button>
      )}

      <button style={s.resetBtn} onClick={onReset}>
        ↩ Upload a different resume
      </button>

    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
      stroke="#999" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" style={{ marginBottom: 10 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function PdfBadge() {
  return (
    <div style={{
      width: 40, height: 40, background: "#000",
      color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>PDF</div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" style={{ marginRight: 6 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const s = {
  page:        { background: "#f9fafb", minHeight: "100vh", fontFamily: "Arial, sans-serif" },

  navbar:      { display: "flex", justifyContent: "space-between", alignItems: "center",
                 padding: "16px 32px", background: "white", borderBottom: "1px solid #ddd" },
  brandWrap:   { display: "flex", gap: 10, alignItems: "center" },
  logo:        { width: 40, height: 40, background: "#000", color: "#fff",
                 display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  brandTitle:  { margin: 0, fontWeight: "bold", fontSize: 14 },
  brandSub:    { margin: 0, fontSize: 12, color: "gray" },
  navLinks:    { display: "flex", gap: 10, alignItems: "center" },
  navButtonPrimary:   { background: "#000", color: "#fff", border: "none",
                        padding: "8px 14px", cursor: "pointer", fontSize: 13 },
  navButtonSecondary: { border: "1px solid #000", background: "white",
                        padding: "8px 14px", cursor: "pointer", fontSize: 13 },

  wrapper:     { maxWidth: 560, margin: "48px auto", padding: "0 1rem",
                 fontFamily: "Arial, sans-serif" },
  heading:     { fontSize: "1.5rem", fontWeight: 700, color: "#000", marginBottom: 4 },
  sub:         { fontSize: "0.875rem", color: "#555", marginBottom: 20 },

  dropZone:    { border: "2px dashed #bbb", padding: "2rem 1.5rem",
                 minHeight: 160, display: "flex", alignItems: "center",
                 justifyContent: "center", background: "#fff",
                 cursor: "pointer", transition: "all 0.2s" },
  dropZoneActive:   { borderColor: "#000", background: "#f9fafb" },
  dropZoneSelected: { borderStyle: "solid", borderColor: "#bbb",
                      background: "#fff", cursor: "default" },

  emptyState:  { display: "flex", flexDirection: "column", alignItems: "center" },
  dropText:    { fontSize: "1rem", color: "#333", margin: 0 },
  orText:      { fontSize: "0.875rem", color: "#999", margin: "8px 0" },
  browseBtn:   { background: "none", border: "1.5px solid #000", color: "#000",
                 padding: "6px 18px", cursor: "pointer",
                 fontSize: "0.875rem", fontWeight: 600 },

  fileCard:    { display: "flex", alignItems: "center", gap: 12, width: "100%" },
  fileInfo:    { flex: 1, overflow: "hidden" },
  fileName:    { display: "block", fontWeight: 600, fontSize: "0.9rem",
                 color: "#000", whiteSpace: "nowrap", overflow: "hidden",
                 textOverflow: "ellipsis" },
  fileMeta:    { display: "block", fontSize: "0.78rem", color: "#666", marginTop: 2 },
  removeBtn:   { background: "none", border: "none", cursor: "pointer",
                 color: "#999", fontSize: "1rem", padding: 4, flexShrink: 0 },

  errorMsg:    { marginTop: 10, fontSize: "0.875rem", color: "#000",
                 borderLeft: "3px solid #000", paddingLeft: 8 },

  submitBtn:         { marginTop: 18, width: "100%", padding: "12px 0",
                       background: "#000", color: "#fff", border: "none",
                       fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  submitBtnDisabled: { opacity: 0.3, cursor: "not-allowed" },

  previewWrapper:  { display: "flex", flexDirection: "column", gap: 16 },
  successBadge:    { display: "inline-flex", alignItems: "center",
                     background: "#000", color: "#fff",
                     padding: "6px 14px",
                     fontSize: "0.85rem", fontWeight: 600, alignSelf: "flex-start" },
  previewFilename: { display: "flex", alignItems: "center", gap: 10,
                     padding: "10px 14px", background: "#fff",
                     border: "1px solid #ddd" },
  textBoxWrapper:  { display: "flex", flexDirection: "column", gap: 6 },
  textBoxLabel:    { fontSize: "0.8rem", fontWeight: 600, color: "#555",
                     textTransform: "uppercase", letterSpacing: 0.5, margin: 0 },
  textBox:         { background: "#fff", border: "1px solid #ddd",
                     padding: "1rem", fontSize: "0.8rem",
                     color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap",
                     maxHeight: 320, overflowY: "auto", margin: 0,
                     fontFamily: "'Courier New', monospace" },
  truncateNote:    { fontSize: "0.75rem", color: "#999", margin: 0 },
  viewMatchesBtn:  { background: "#000", color: "#fff", border: "none",
                     padding: "10px 20px", cursor: "pointer",
                     fontSize: "0.95rem", fontWeight: 600, alignSelf: "flex-start" },
  resetBtn:        { background: "none", border: "1.5px solid #000",
                     color: "#000", padding: "8px 16px",
                     cursor: "pointer", fontSize: "0.875rem", alignSelf: "flex-start" },
};
