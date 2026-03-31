from fastapi import FastAPI

app = FastAPI(
    title="Job Matcher Backend",
    description="Backend API for resume parsing, job scraping, and matching",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
