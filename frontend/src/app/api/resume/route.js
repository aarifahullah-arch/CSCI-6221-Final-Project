export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return Response.json(
        { ok: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend — field name must be "file"
    const backendForm = new FormData();
    backendForm.append("file", file);

    const backendResponse = await fetch("http://localhost:8000/jobs/match", {
      method: "POST",
      body: backendForm,
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return Response.json(
        { ok: false, message: backendData.detail ?? `Server error ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    // ChromaDB returns cosine distance scores (lower = better match).
    // Raw distances from OpenAI embeddings typically sit in the 0.4–0.8 range
    // even for strong matches, so a simple (1 - distance) always looks low.
    //
    // Instead we use relative normalization:
    //   - best match  → 90%
    //   - worst match → 30%
    //   - others spread proportionally between them
    //
    // This honestly reflects how well each job ranks relative to the others
    // without artificially inflating every result.
    const rawMatches = backendData.matches ?? [];
    const distances  = rawMatches.map(j => j.score ?? 1);
    const best  = Math.min(...distances);
    const worst = Math.max(...distances);
    const range = worst - best || 0.001; // avoid divide-by-zero if all scores identical

    const matches = rawMatches.map((job, index) => ({
      id:         job.id ?? String(index),
      title:      job.title,
      company:    job.company,
      location:   job.location,
      url:        job.url ?? "",
      matchScore: Math.round(90 - ((job.score - best) / range) * 60),
    }));

    // Build a readable summary from contact_info since the pipeline
    // doesn't return the full resume text
    const info = backendData.resume_info ?? {};
    const lines = [];
    if (info.name)  lines.push(`Name:  ${info.name}`);
    if (info.email) lines.push(`Email: ${info.email}`);
    if (info.phone) lines.push(`Phone: ${info.phone}`);
    lines.push(`\n${matches.length} job matches found.`);

    return Response.json({
      ok: true,
      data: {
        filename: file.name,
        extractedText: lines.join("\n") || "Resume parsed successfully.",
        matches,
      },
    });
  } catch (err) {
    return Response.json(
      { ok: false, message: err.message ?? "Upload failed. Is the backend running?" },
      { status: 500 }
    );
  }
}
