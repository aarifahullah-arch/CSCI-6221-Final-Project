# CSCI 6221 Advanced Software Paradigms Final Project
**Professor** Yih-Feng Hwang

### JobMatch

*Search Smarter, Apply Faster*


### Running Locally

**One-time only**

```bash
# cd to main directory: CSCI-6221-FINAL-PROJECT
python3 -m venv .venv
source .venv/bin/activate

pip install fastapi uvicorn python-multipart PyPDF2 python-docx textract openai chromadb

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# Verify the Node.js version:
node -v # Should print "v24.14.1".

# Verify npm version:
npm -v # Should print "11.11.0".

npm install
```

Note: You also require an OpenAI API key in your environment path.

You need **two terminals open** — one for the backend, one for the frontend.

### 1. Backend (FastAPI — port 8000)

```bash
# Start the server
cd backend
uvicorn app.main:app --reload
```

Backend will be running at `http://localhost:8000`

### 2. Frontend (Next.js — port 3000)

```bash
# Start the dev server
cd frontend
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

**Frontend Development & Frontend-Backend Integration**

Developed the frontend resume upload page and job rankings display, and handled the full integration between the frontend and backend systems.

- Built the `ResumeUpload` component with drag-and-drop support, file validation, and upload state management
- Built the `JobRankDisplay` component with ranked job cards, match score visualization, pagination, and job links
- Created the Next.js API route (`/api/resume`) to bridge the frontend and FastAPI backend
- Connected the resume upload flow to the backend pipeline so uploaded resumes are parsed, matched against jobs via vector search, and results are returned and displayed to the user
- Implemented match score normalization to convert raw vector distances into intuitive percentages
- Styled both pages to match the site's black and white design theme and added consistent navbar navigation

### Aarifah Ullah

<p>I worked on on the Vector Search algorithm, combining resume parsing and job scraping all into the algorithm workflow. I integrated the entire backend to work seamlessly together.<br>

The search algorithm takes jobs from the internet and is maintained and stored in a Chroma database. These are stored as OpenAI Text Embeddings (3 Small). The search algorithm takes raw, parsed resume text and converts them into embeddings. These are then queries into the database where the algorithm applies advanced ML techniques like KNN and hybrid search to find the closest embeddings to the query. These results are automatically ranked and users have the option to filter based on standard criteria (location, modality (remote, hybrid, in-person), etc.) </p>

List of accomplishments:

- Created Chroma database. Read through documentation to design customized JobMatch solution.
- Linked ChromaCloud database and collections with API calls.
- Connected OpenAI API's to make state-of-the-art embeddings for pulled jobs and resume text.
- Used Chroma's advanced vector seach algorithms (KNN, hybrid) to search through embedding space.
- Ranked results that truly match the user's resume using the algorithm's scoring system.
- Integrated backend successfully, combining resume parsing and job scraping modules.
- Added over 20 direct company job boards to populate database with over 180+ records.
- Used MD5 hash to uniquely store different jobs across websites and companies in database.
- Provided an endpoint for frontend to list search results including (title, company, modality, and location).

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

Reranking Module

### Overview  
The reranking module is responsible for refining job search results returned by the backend vector search system. While the initial retrieval provides semantically similar jobs, I improve these results by re-ranking them based on how well they match a candidate’s resume. This ensures that users see the most relevant job opportunities first.

### Objective  
- I reduce irrelevant job results  
- I prioritize jobs that best match user skills and experience  
- I provide a structured ranking mechanism for job display  

### Architecture  

backend/reranker/
├── src/
│   ├── reranker.py      # Main ranking pipeline
│   ├── scoring.py       # Final score computation
│   ├── features.py      # Feature extraction (skills, experience)
│   ├── explain.py       # (Planned) explanation generation
│   └── utils.py         # Helper functions
├── tests/
│   └── test_scoring.py  # Unit tests


### How It Works  

1. **Input**  
   - I receive jobs from vector search (with `embedding_score`)  
   - I also take user resume data (skills, experience)

2. **Feature Extraction**  
   - **Skill Match**: I measure overlap between resume and job skills  
   - **Experience Match**: I compare required vs actual experience  

3. **Scoring**  
   I compute a weighted score using:

   Final Score =
     0.6 × Embedding Score +
     0.3 × Skill Match +
     0.1 × Experience Match

4. **Reranking**  
   - I assign a `final_score` to each job  
   - I sort jobs in descending order  
   - The top results represent the best matches  

### Example Output  

[
  {
    "title": "Cybersecurity Analyst",
    "final_score": 0.92
  },
  {
    "title": "Backend Developer",
    "final_score": 0.81
  }
]


### Testing  

I validate the module using unit tests to ensure correctness of scoring and ranking logic.

```bash
python -m tests.test_scoring
