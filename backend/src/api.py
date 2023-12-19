from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pygelbooru import Gelbooru
from src.tagger import Tagger, load_dataset_tags, scan_duplicates
import base64
from PIL import Image
import os
from torch.hub import download_url_to_file
from src.interrogate import deep_danbooru_model
import torch
import tqdm
import numpy as np

from backend.src.tagger import recursive_dir

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

@app.get("/deepdanbooru")
async def deepdanbooru(path: str, threshold: float):
    # Code courtesy of https://github.com/AUTOMATIC1111/TorchDeepDanbooru
    if not torch.cuda.is_available():
        print('CUDA is not available!')
        print('Torch requires CUDA for interrogation')

    model_path = '../models/model-resnet_custom_v3.pt'
    if not os.path.exists(model_path):
        print('Running interrogate for the first time. Downloading DeepDanBooru model...')
        print('You can find this in the /models/ folder')
        os.mkdir('../models/')
        download_url_to_file('https://github.com/AUTOMATIC1111/TorchDeepDanbooru/releases/download/v1/model-resnet_custom_v3.pt', model_path, progress=True)

    model = deep_danbooru_model.DeepDanbooruModel()
    model.load_state_dict(torch.load(model_path))
    model.eval()
    model.half()
    model.cuda()

    pic = Image.open(path).convert("RGB").resize((512, 512))
    a = np.expand_dims(np.array(pic, dtype=np.float32), 0) / 255

    with torch.no_grad(), torch.autocast("cuda"):
        x = torch.from_numpy(a).cuda()
        y = model(x)[0].detach().cpu().numpy()

    tags = {}

    for i, p in enumerate(y):
        if p >= threshold:
            tags[model.tags[i]] = float(p)

    print('DeepDanBooru Interrogate', path, '-', len(tags), 'Tags')

    return dict(sorted(tags.items(), key=lambda item: item[1], reverse=True))


@app.get("/load_dataset")
async def load_dataset(path: str):
    files = recursive_dir(path)
    tagger.load_dataset(files=files)
    available_tags = load_dataset_tags(tagger.dataset)
    return {'index': tagger.index, 'path': tagger.path, 'files': files, 'num_files': tagger.num_files, 'available_tags': available_tags}


@app.get("/get_duplicates")
async def get_duplicates():
    return scan_duplicates(tagger.dataset)


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
