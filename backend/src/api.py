from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pygelbooru import Gelbooru
from src.tagger import Tagger, load_dataset_tags, scan_duplicates
import base64
from PIL import Image

app = FastAPI()
gelbooru = Gelbooru()
tagger = Tagger()

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
    return "View the backend documentation using https://localhost:8000/docs"


@app.get("/load_dataset")
async def load_dataset(path: str):
    tagger.load_dataset(path)
    scan_duplicates(tagger.dataset)
    available_tags = load_dataset_tags(tagger.dataset)
    return {'index': tagger.index, 'path': tagger.path, 'num_files': tagger.num_files, 'available_tags': available_tags}


@app.get("/load_image")
async def load_image(index: int):
    dataset_image = tagger.get_image(index)
    img = Image.open(dataset_image.path)
    with open(dataset_image.path, 'rb') as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return {'image': encoded_string, 'size': {'width': img.width, 'height': img.height}, 'path': dataset_image.path,
            'caption': dataset_image.caption}


@app.post("/save_caption")
async def save_caption(index: int, caption: str):
    dataset_image = tagger.get_image(index)
    dataset_image.caption = caption
    dataset_image.save()
    return {'Success'}


@app.get("/gelbooru")
async def fetch_gelbooru(post_id):
    post = await gelbooru.get_post(post_id)
    return post
