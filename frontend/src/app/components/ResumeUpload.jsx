/**
 * ResumeUpload.jsx
 *
 * Resume upload component — PDF only.
 * After upload, displays a preview panel showing the filename and
 * extracted text returned by the backend parser.
 *
 * USAGE (e.g. app/upload/page.jsx):
 *
 *   import ResumeUpload from "@/components/ResumeUpload";
 *
 *   export default function UploadPage() {
 *     return <ResumeUpload apiEndpoint="/api/resume" />;
 *   }
 *
 * PROPS:
 *   apiEndpoint   {string}    Where to POST the resume. Default: "/api/resume"
 *   maxSizeMB     {number}    Max allowed file size. Default: 5
 *
 * BACKEND CONTRACT:
 *   POST <apiEndpoint>
 *   Content-Type: multipart/form-data
 *   Field name:   "resume"
 *
 *   Expected JSON response on success:
 *   {
 *     ok: true,
 *     data: {
 *       filename: "john_doe_resume.pdf",
 *       extractedText: "John Doe\nSoftware Engineer\n..."
 *     }
 *   }
 *
 *   On error:
 *   { ok: false, message: "Reason for failure" }
 *
 * STATES this component moves through:
 *   "idle"      → nothing selected yet
 *   "selected"  → file chosen, not yet submitted
 *   "uploading" → POST in flight
 *   "preview"   → upload succeeded, showing extracted text
 *   "error"     → validation or network failure
 */

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


export default function ResumeUpload({
  apiEndpoint = "/api/resume",
  maxSizeMB = 5,
}) {
  const [file, setFile]           = useState(null);
  const [status, setStatus]       = useState("idle");
  const [error, setError]         = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview]     = useState(null);

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
    e.target.value = ""; // allow re-selecting the same file
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
      formData.append("resume", file); // backend reads request.files["resume"]

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — browser adds multipart boundary automatically
      });

      const json = await response.json();

      if (!response.ok || json.ok === false) {
        throw new Error(json.message ?? `Server error ${response.status}`);
      }

      const matches = json.data?.matches ?? [];

      // Save matches to localStorage so rankings page can read them
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
    <div style={s.wrapper}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <h2 style={s.heading}>Upload Your Resume</h2>
      <p style={s.sub}>PDF only · Max {maxSizeMB} MB</p>

      {/* ── Drop zone (hidden once we're in preview state) ─────── */}
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
              /* Empty state */
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
              /* File selected — show name + size */
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

          {/* Error message */}
          {error && <p style={s.errorMsg} role="alert">{error}</p>}

          {/* Submit */}
          <button
            style={{
              ...s.submitBtn,
              ...(!file || status === "uploading" ? s.submitBtnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!file || status === "uploading"}
            aria-busy={status === "uploading"}
          >
            {status === "uploading" ? "Uploading…" : "Analyze Resume →"}
          </button>
        </>
      )}

      {/* ── Preview panel (shown after successful upload) ──────── */}
      {status === "preview" && preview && (
        <PreviewPanel
          preview={preview}
          onReset={reset}
          onViewMatches={() => router.push("/rankings")}
        />
      )}

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

      {/* Success badge */}
      <div style={s.successBadge}>
        <CheckIcon /> Resume parsed successfully
      </div>

      {/* Filename row */}
      <div style={s.previewFilename}>
        <PdfBadge />
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{filename}</span>
      </div>

      {/* Extracted text */}
      <div style={s.textBoxWrapper}>
        <p style={s.textBoxLabel}>Extracted Text Preview</p>
        <pre style={s.textBox}>{displayText}</pre>
        {isTruncated && (
          <p style={s.truncateNote}>
            Showing first {MAX_PREVIEW_CHARS} characters. Full text sent to matching engine.
          </p>
        )}
      </div>
      {/* View rankings */}
      {matches.length > 0 && (
        <button style={s.viewMatchesBtn} onClick={onViewMatches}>
          View Job Matches →
        </button>
      )}

      {/* Reset */}
      <button style={s.resetBtn} onClick={onReset}>
        ↩ Upload a different resume
      </button>

    </div>
  );
}


function UploadIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
      stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"
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
      width: 40, height: 40, borderRadius: 7, background: "#fee2e2",
      color: "#dc2626", fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
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
  wrapper:       { maxWidth: 560, margin: "0 auto", padding: "2rem 1rem",
                   fontFamily: "'Segoe UI', system-ui, sans-serif" },
  heading:       { fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: 4 },
  sub:           { fontSize: "0.875rem", color: "#6b7280", marginBottom: 20 },

  dropZone:      { border: "2px dashed #d1d5db", borderRadius: 12, padding: "2rem 1.5rem",
                   minHeight: 160, display: "flex", alignItems: "center",
                   justifyContent: "center", background: "#f9fafb",
                   cursor: "pointer", transition: "all 0.2s" },
  dropZoneActive:   { borderColor: "#6366f1", background: "#eef2ff" },
  dropZoneSelected: { borderStyle: "solid", borderColor: "#d1d5db",
                      background: "#fff", cursor: "default" },

  emptyState:    { display: "flex", flexDirection: "column", alignItems: "center" },
  dropText:      { fontSize: "1rem", color: "#374151", margin: 0 },
  orText:        { fontSize: "0.875rem", color: "#9ca3af", margin: "8px 0" },
  browseBtn:     { background: "none", border: "1.5px solid #6366f1", color: "#6366f1",
                   padding: "6px 18px", borderRadius: 6, cursor: "pointer",
                   fontSize: "0.875rem", fontWeight: 600 },

  fileCard:      { display: "flex", alignItems: "center", gap: 12, width: "100%" },
  fileInfo:      { flex: 1, overflow: "hidden" },
  fileName:      { display: "block", fontWeight: 600, fontSize: "0.9rem",
                   color: "#111827", whiteSpace: "nowrap", overflow: "hidden",
                   textOverflow: "ellipsis" },
  fileMeta:      { display: "block", fontSize: "0.78rem", color: "#6b7280", marginTop: 2 },
  removeBtn:     { background: "none", border: "none", cursor: "pointer",
                   color: "#9ca3af", fontSize: "1rem", padding: 4,
                   borderRadius: 4, flexShrink: 0 },

  errorMsg:      { marginTop: 10, fontSize: "0.875rem", color: "#dc2626" },

  submitBtn:     { marginTop: 18, width: "100%", padding: "12px 0",
                   background: "#6366f1", color: "#fff", border: "none",
                   borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  submitBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },

  previewWrapper:  { display: "flex", flexDirection: "column", gap: 16 },
  successBadge:    { display: "inline-flex", alignItems: "center",
                     background: "#dcfce7", color: "#15803d",
                     padding: "6px 14px", borderRadius: 20,
                     fontSize: "0.85rem", fontWeight: 600, alignSelf: "flex-start" },
  previewFilename: { display: "flex", alignItems: "center", gap: 10,
                     padding: "10px 14px", background: "#f9fafb",
                     borderRadius: 8, border: "1px solid #e5e7eb" },
  textBoxWrapper:  { display: "flex", flexDirection: "column", gap: 6 },
  textBoxLabel:    { fontSize: "0.8rem", fontWeight: 600, color: "#6b7280",
                     textTransform: "uppercase", letterSpacing: 0.5, margin: 0 },
  textBox:         { background: "#f9fafb", border: "1px solid #e5e7eb",
                     borderRadius: 8, padding: "1rem", fontSize: "0.8rem",
                     color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap",
                     maxHeight: 320, overflowY: "auto", margin: 0,
                     fontFamily: "'Courier New', monospace" },
  truncateNote:    { fontSize: "0.75rem", color: "#9ca3af", margin: 0 },
  viewMatchesBtn:  { background: "#6366f1", color: "#fff", border: "none",
                     padding: "10px 20px", borderRadius: 8, cursor: "pointer",
                     fontSize: "0.95rem", fontWeight: 600, alignSelf: "flex-start" },
  resetBtn:        { background: "none", border: "1.5px solid #d1d5db",
                     color: "#6b7280", padding: "8px 16px", borderRadius: 7,
                     cursor: "pointer", fontSize: "0.875rem", alignSelf: "flex-start" },
};
