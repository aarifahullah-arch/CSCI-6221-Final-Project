# CSCI 6221 Advanced Software Paradigms Final Project
**Professor** Yih-Feng Hwang

---

## Running Locally

You need **two terminals open** — one for the backend, one for the frontend.

### 1. Backend (FastAPI — port 8000)

```bash
# Install dependencies (first time only)
pip install fastapi uvicorn python-multipart PyPDF2 python-docx openai chromadb

# Start the server
cd backend
uvicorn app.main:app --reload
```

Backend will be running at `http://localhost:8000`

### 2. Frontend (Next.js — port 3000)

```bash
# Install dependencies (first time only)
cd frontend
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Usage

1. Navigate to the **Upload** page
2. Upload your resume as a **PDF** (max 5 MB)
3. Click **Analyze Resume** and wait for it to process
4. Click **View Job Matches** to see your ranked results
5. Click **View Job →** on any listing to open the original posting

---

**Team members**

<p>Bilal Raza, Aarifah Ullah, Raina Jacob, Innocent Gwara, Saviour Msopa, Emmanuel Mkandawire</p>

## Contributions

### Bilal Raza

[TODO]

### Aarifah Ullah

[TODO]

### Raina Jacob

[TODO]

### Innocent Gwara

**Job Scraping**
I implemented the backend job scraping module for the project.
I built a Python-based scraping service (job_sources.py)
Integrated external job APIs:
Remotive (remote jobs)
Greenhouse (company job boards)
Created a normalized job format so all jobs have the same structure
Built a FastAPI route: GET /jobs which returns all collected jobs

How it works
External APIs → job_sources.py → jobs.py → main.py → /jobs endpoint
Output

Each job is returned as:

{
  "title": "...",
  "company": "...",
  "location": "...",
  "description": "...",
  "url": "...",
  "source": "..."
}

### Saviour Msopa

[TODO]

### Emmanuel Mkandawire

[TODO]