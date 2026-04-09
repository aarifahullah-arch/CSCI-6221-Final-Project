# CSCI 6221 Advanced Software Paradigms Final Project
**Professor** Yih-Feng Hwang

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