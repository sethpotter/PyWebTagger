from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pygelbooru import Gelbooru

app = FastAPI()
gelbooru = Gelbooru()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
async def home():
    return {"View the backend documentation using https://localhost:8000/docs"}


@app.get("/gelbooru")
async def fetch_gelbooru(post_id):
    post = await gelbooru.get_post(post_id)
    return post
