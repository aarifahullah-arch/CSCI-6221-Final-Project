import os
import re
import hashlib
import chromadb
from chromadb import Search, K, Knn
from chromadb.utils import embedding_functions
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from openai import OpenAI

# Chroma Cloud Client
client = chromadb.CloudClient(
  api_key='ck-2NARKLQEvdWGxoJSLUUHbncxKMYTGXbY9z4zU72exSSE',
  tenant='e6524951-7dba-40a9-837a-3260cb58432f',
  database='job-hunt'
)

# OpenAI Client
openai_key = os.environ.get('$OPENAI_API_KEY')
openai_client = OpenAI(api_key=openai_key)

"""
# Only need to run once to create collection, but can be left in code for easy reset during development
collection = client.create_collection(
    name="jobs_list",
    embedding_function=OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="text-embedding-3-small"
    )
)
"""

#@title Vector Search Database

# Collection already exists
collection = client.get_collection(name="jobs_list")

# Convert job posts to embeddings --> may be optional w/ vectorized search
def get_embedding(text):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def strip_html(text: str) -> str:
    """Remove HTML tags and normalize whitespace."""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_job_id(job):
    unique_string = f"{job['title']}_{job['company']}_{job['url']}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def upsert_jobs(jobs):
    # Generate stable IDs
    for job in jobs:
        job["id"] = generate_job_id(job)

    existing = collection.get(ids=[job["id"] for job in jobs])
    existing_ids = set(existing["ids"])

    new_jobs = [job for job in jobs if job["id"] not in existing_ids]

    if not new_jobs:
        return

    ids = []
    documents = []
    metadatas = []
    embeddings = []

    for job in new_jobs:
        ids.append(job["id"])

        # Strip HTML and truncate description to stay within ChromaDB quota
        clean_desc = strip_html(job.get('description', ''))[:400]
        doc = f"{job['title']} {job['company']} {clean_desc}"
        documents.append(doc)

        # Store structured metadata
        metadatas.append({
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "url": job["url"],
            "source": job["source"],
        })

        embeddings.append(get_embedding(doc))

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )

def search_jobs(resume_text, n_results=10, location=None):
    search = (
        Search()
        .limit(n_results)
        .select(
            K.ID,
            K.SCORE,
            K.METADATA
        )
    )

    if location:
        search = search.where(K("location") == location)

    resume_embedding = get_embedding(resume_text)

    result = collection.search(
        search.rank(Knn(query=resume_embedding))
    )

    rows = result.rows()[0]

    return [
        {
            "id": r["id"],
            "title": r["metadata"].get("title"),
            "company": r["metadata"].get("company"),
            "location": r["metadata"].get("location"),
            "url": r["metadata"].get("url"),
            "score": r["score"],
        }
        for r in rows
    ]