import os
import re
import traceback

from PIL import Image
import imagehash
from sentence_transformers import SentenceTransformer, util
import torch
from concurrent.futures import ProcessPoolExecutor, as_completed
from multiprocessing import Manager, Pool

class DatasetImage:
    def __init__(self, path: str):
        self.path = path
        self.caption = ''
        self.load()

    def save(self):
        tagfile = get_tagfile(self.path)
        with open(tagfile, 'w') as f:
            f.write(self.caption)

    def load(self):
        tagfile = get_tagfile(self.path)
        if os.path.isfile(tagfile):
            with open(tagfile, 'r') as f:
                self.caption = f.read().strip()

    def __str__(self):
        return f"{self.path}-{self.caption}"


class Tagger:
    def __init__(self):
        self.index = None
        self.path = None
        self.dataset = None
        self.num_files = None

    def load_dataset(self, path: str):
        if not os.path.isdir(path):
            raise NotADirectoryError("Invalid dataset path", path)
        self.index = 0
        self.path = path
        self.dataset = load_dataset(path)
        self.num_files = len(self.dataset)

    def set_index(self, index: int):
        self.index = index
        if self.index < 0:
            self.index = self.num_files - 1
        if self.index >= self.num_files:
            self.index = 0

    def get_image(self, index: int) -> DatasetImage:
        if self.num_files == 0:
            raise LookupError("Dataset is empty")
        if index < 0 or index >= self.num_files:
            raise IndexError("Got subscript", index, "which is out of bounds of 0 to", self.num_files - 1)
        return self.dataset[index]

    def get_image_index(self, path: str) -> int:
        if self.num_files == 0:
            raise LookupError("Dataset is empty")
        return self.dataset.index(path)

    def add(self, path: str):
        self.dataset.append(DatasetImage(path))

    def remove(self, path: str = None):
        if path is None:
            # Program crashes on self.current() because if you keep removing it will crash.
            self.dataset.remove(self.current())
        else:
            if path in self.dataset:
                self.dataset.remove(path)
        # TODO Edge cases: when the dataset is 1, or when index is at the end of the dataset.

    def remove_at_index(self, index: int):
        del self.dataset[index]
        # TODO Edge cases: when the dataset is 1, or when index is at the end of the dataset.

    def next(self):
        self.set_index(self.index + 1)

    def previous(self):
        self.set_index(self.index - 1)

    def current(self) -> DatasetImage:
        return self.get_image(self.index)


# Helper Functions #


def load_dataset(path: str):
    files = recursive_dir(path, [".png", ".jpg", ".jpeg", ".webp"])
    files = sort_alphanumeric(files)
    dataset = []
    for f in files:
        dataset.append(DatasetImage(f))
    return dataset

def make_hash(datasetImage):
    try:
        with Image.open(datasetImage.path) as img:
            img_hash = imagehash.average_hash(img, hash_size=16)
            return (img_hash, datasetImage.path)
    except Exception as e:
        traceback.print_exc()
        return None


def scan_duplicates_hash(dataset: list[DatasetImage]):
    with Pool(processes=16) as p:
        results = p.map(make_hash, [datasetImage for datasetImage in dataset], chunksize=1)

    hash_dict = {}

    print("Pool closed")

    for t in results:
        img_hash, path = t
        if img_hash in hash_dict:
            hash_dict[img_hash].append(path)
        else:
            hash_dict[img_hash] = [path]

    for images in hash_dict.values():
        if len(images) > 1:
            print(images)


def scan_duplicates_clip(dataset: list[DatasetImage]):
    print('Loading CLIP Model...')
    print(torch.cuda.is_available())
    print(torch.cuda.get_device_name(0))
    model = SentenceTransformer('clip-ViT-L-14')
    image_paths = [datasetImage.path for datasetImage in dataset]
    encoded_images = model.encode([Image.open(path) for path in image_paths],
                                 batch_size=512,
                                 convert_to_tensor=True,
                                 show_progress_bar=True)
    processed_images = util.paraphrase_mining_embeddings(encoded_images)
    duplicates = [image for image in processed_images if image[0] >= 1]
    for score, image_id1, image_id2 in duplicates:
        print("\nScore: {:.3f}%".format(score * 100))
        print(image_paths[image_id1])
        print(image_paths[image_id2])


def load_dataset_tags(dataset: list):
    tags = {}
    for img in dataset:
        img_tags = [t.strip() for t in img.caption.split(',')]
        for t in img_tags:
            if t in tags:
                tags[t] = tags[t] + 1
            else:
                tags[t] = 1
    return tags


def get_tagfile(path: str):
    return os.path.splitext(path)[0] + '.txt'


# Sort Alphanumerically
def sort_alphanumeric(l: list):
    convert = lambda text: int(text) if text.isdigit() else text
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


def recursive_dir(path: str, exts: list):
    r = []
    for f in os.listdir(path):
        jf = os.path.join(path, f)
        if os.path.isdir(jf):
            r += recursive_dir(jf, exts)
        elif os.path.isfile(jf):
            for ext in exts:
                if jf.lower().endswith(ext):
                    r.append(jf)
    return r
