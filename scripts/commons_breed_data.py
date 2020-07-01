import csv
import re
import unicodedata
from collections import Counter
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import datetime
from io import BytesIO
from itertools import repeat
from pathlib import Path
from random import uniform
from typing import Optional, NamedTuple, List, Tuple, Dict, AnyStr, Set

import pandas as pd
import requests
from PIL import Image
from bs4 import BeautifulSoup
from loguru import logger as log
from tqdm import tqdm

now = datetime.utcnow().isoformat().replace(":", "_")
PREFIX = "https://en.wikipedia.org"
AKC_DATA = csv.reader(Path(__file__).parents[1].joinpath("akc_info.csv").open())
MAX_SIZE = 255

all_temperament_traits = Counter()


class WikiBreed(NamedTuple):
    name: str = None
    link: str = None


class Breed:
    def __init__(
        self,
        name: str,
        min_height: Optional[float],
        max_height: Optional[float],
        min_weight: Optional[float],
        max_weight: Optional[float],
        min_year: Optional[int],
        max_year: Optional[int],
        temperament_traits: List,
    ):
        self.name = name
        self.temperament_traits = temperament_traits
        self._min_height = min_height
        self._min_weight = min_weight
        self._max_height = max_height
        self._max_weight = max_weight
        self._min_year = min_year
        self._max_year = max_year

    def __repr__(self):
        return f"<Breed(name={self.name})>"

    @property
    def height(self) -> Optional[float]:
        if self._min_height is None and self._max_height is None:
            return None
        else:
            return round(uniform(self._min_height, self._max_height), 2)

    @property
    def weight(self) -> Optional[float]:
        if self._min_weight is None and self._max_weight is None:
            return None
        else:
            return round(uniform(self._min_weight, self._max_weight), 2)


class Dog:
    FRIENDLY_TRAITS = {
        "friendly",
        "affectionate",
        "sweet",
        "sociable",
        "good_natured",
        "charming",
        "happy",
        "sweet_natured",
        "cheerful",
        "merry",
        "gentle",
        "amusing",
        "family_oriented",
    }
    PLAYFUL_TRAITS = {"comical", "mischievous", "vivacious", "famously_funny"}
    PROTECTIVE_TRAITS = {
        "fearless",
        "alert",
        "reserved_with_strangers",
        "watchful",
        "devoted",
        "brave",
        "dependable",
        "confident_guardian",
    }
    FAST_LEARNER_TRAITS = {
        "trainable",
        "bright",
        "obedient",
        "willing_to_please",
        "keen",
        "very_smart",
        "eager_to_please",
    }
    ATHLETIC_TRAITS = {"lively", "agile", "spirited", "powerful", "athletic", "quick"}
    GRACEFUL_TRAITS = {"graceful", "polite"}

    def __init__(
        self,
        name: str,
        height_in: Optional[float],
        weight_lb: Optional[float],
        unfiltered_traits: Optional[List] = None,
    ):
        self._height_in = height_in
        self._weight_lb = weight_lb
        self._unfiltered_traits = unfiltered_traits
        self._name = name
        self._image_path: Optional[AnyStr] = None
        self._common_traits: Optional[Set] = None
        self._id: Optional[int] = None

    def __repr__(self):
        return f"<Dog(name={self.name}, image={self.image_path})>"

    def __iter__(self):
        fields = {
            "dog_id": self._id,
            "breed_name": self.name,
            "height": self.height,
            "image_path": self.image_path,
        }
        fields.update(self.common_traits)
        for prop, var in fields.items():
            yield prop, var

    @property
    def dog_id(self) -> int:
        return self._id

    @dog_id.setter
    def dog_id(self, value: int):
        self._id = value

    @property
    def unfiltered_traits(self) -> Set:
        return set(self._unfiltered_traits)

    @property
    def name(self):
        return self._name

    @property
    def image_path(self) -> AnyStr:
        return self._image_path

    @image_path.setter
    def image_path(self, value: AnyStr):
        self._image_path = value

    @property
    def common_traits(self) -> Dict:
        is_friendly = self.is_friendly(self._common_traits)
        is_playful = self.is_playful(self._common_traits)
        is_protective = self.is_protective(self._common_traits)
        is_fast_learner = self.is_fast_learner(self._common_traits)
        is_athletic = self.is_athletic(self._common_traits)
        is_graceful = self.is_graceful(self._common_traits)
        return {
            "is_friendly": is_friendly,
            "is_playful": is_playful,
            "is_protective": is_protective,
            "is_fast_learner": is_fast_learner,
            "is_athletic": is_athletic,
            "is_graceful": is_graceful,
        }

    @common_traits.setter
    def common_traits(self, values: Set):
        if isinstance(values, set):
            self._common_traits = values
        else:
            raise TypeError(f"Expecting set but got: {type(values)}")

    @property
    def weight(self):
        if self._weight_lb is None:
            return None
        elif 0.0 <= self._weight_lb <= 20.0:
            return "x-small"
        elif 20.0 <= self._weight_lb <= 40.0:
            return "small"
        elif 40.0 <= self._weight_lb <= 54.0:
            return "medium"
        elif 54.0 <= self._weight_lb <= 70.0:
            return "large"
        elif 70.0 <= self._weight_lb <= 240.0:
            return "x-large"
        else:
            return None

    @property
    def height(self):
        if self._height_in is None:
            return None
        elif 3.0 <= self._height_in <= 10.0:
            return "x-short"
        elif 10.0 <= self._height_in <= 15.0:
            return "short"
        elif 15.0 <= self._height_in <= 23.0:
            return "medium"
        elif 23.0 <= self._height_in <= 30.0:
            return "tall"
        elif 30.0 <= self._height_in <= 75.0:
            return "x-tall"

    def is_athletic(self, traits: Set) -> bool:
        if self.ATHLETIC_TRAITS & traits:
            return True
        else:
            return False

    def is_graceful(self, traits: Set) -> bool:
        if self.GRACEFUL_TRAITS & traits:
            return True
        else:
            return False

    def is_fast_learner(self, traits: Set) -> bool:
        if self.FAST_LEARNER_TRAITS & traits:
            return True
        else:
            return False

    def is_friendly(self, traits: Set) -> bool:
        if self.FRIENDLY_TRAITS & traits:
            return True
        else:
            return False

    def is_playful(self, traits: Set) -> bool:
        if self.PLAYFUL_TRAITS & traits:
            return True
        else:
            return False

    def is_protective(self, traits: Set) -> bool:
        if self.PROTECTIVE_TRAITS & traits:
            return True
        else:
            return False


def get_wiki_breed_list() -> List[WikiBreed]:
    breed_list = []
    try:
        page = BeautifulSoup(
            requests.get(f"{PREFIX}/wiki/List_of_dog_breeds").content, "html.parser"
        )
    except Exception as e:
        log.exception(e)
        exit()
    else:
        groups = [
            g.find("ul")
            for g in page.find("div", {"class": "mw-parser-output"}).find_all(
                "div", {"class": "div-col"}
            )
        ]
        for group in groups:
            breeds = group.find_all("li")
            for breed in breeds:
                unicode_name = (
                    breed.find("a")["title"]
                    .lower()
                    .replace(" ", "_")
                    .replace("_(dog)", "")
                )
                name = (
                    unicodedata.normalize("NFKD", unicode_name)
                    .encode("ASCII", "ignore")
                    .decode("utf-8")
                )
                url = PREFIX + breed.find("a")["href"]
                breed_list.append(WikiBreed(name, url))
        return breed_list


def process_image(
    breed_name: str, dog_weight: str, index: int, data_src: str, image_link: str
) -> Optional[AnyStr]:
    if dog_weight is None:
        return None
    image_name = f"{breed_name}_{index}.jpg"
    dataset_image_path = f"images/{data_src}/{image_name}"
    log.info(f"Image path: {dataset_image_path}")
    destination = (
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", dog_weight, dataset_image_path)
    )
    try:
        assert destination.parents[0].exists()
    except AssertionError:
        log.info(f"Creating directory...{destination}")
        destination.parents[0].mkdir(parents=True)
    else:
        log.info(f"Destination: {destination}")

    if destination.exists():
        return dataset_image_path
    else:
        try:
            response = requests.get(image_link)
            log.info(f"Image response code: {response.status_code}")
            assert response.status_code == 200
            image_data = BytesIO(response.content)
        except Exception as e:
            log.error(e)
            return None
        else:
            try:
                if Path(image_link).suffix == ".png":
                    _ = Image.open(image_data)
                    image = _.convert("RGB")
                elif Path(image_link).suffix.lower() not in [".jpg", ".jpeg"]:
                    raise AttributeError(
                        f"No support for image type: {Path(image_link).suffix}"
                    )
                else:
                    image = Image.open(image_data)
                image.thumbnail((MAX_SIZE, MAX_SIZE), Image.ANTIALIAS)
                image.save(destination)
            except AttributeError as _e:
                log.exception(_e)
                return None
            except Exception as _e:
                log.exception(_e)
                return None
            else:
                return dataset_image_path


def get_wiki_breed_images(wiki_url) -> List:
    try:
        page = BeautifulSoup(requests.get(wiki_url).content, "html.parser")
    except Exception as _e:
        log.exception(_e)
        return []
    else:
        image_links = []
        try:
            image_links.append(
                (
                    "https:"
                    + page.find("table", {"class": "infobox"})
                    .find("a", {"class": "image"})
                    .img["src"]
                )
            )
        except Exception as _e:
            log.error(_e)

        try:
            image_links.extend(
                [
                    "https:" + img.find("a", {"class": "image"}).img["src"]
                    for img in page.find_all("div", {"class": "thumb tright"})
                ]
            )
        except Exception as _e:
            log.error(_e)

        return image_links


def get_akc_info(data) -> Tuple[Breed, List]:
    global all_temperament_traits
    _links = []
    temperament = [
        t.strip().lower().replace(" ", "_").replace("-", "_")
        for t in data[0].split(",")
    ]
    log.info(f"Breed temperament: {temperament}")
    all_temperament_traits.update(temperament)
    # example height data: 26-28 inches (male), 24-26 inches (female)
    height_data = [float(h) for h in re.findall(r"(\d+)", row[2])]
    log.info(f"Heights: {height_data}")
    if row[2] == "":
        min_height = None
        max_height = None
    else:
        min_height = min(height_data)
        max_height = max(height_data)
    # example weight data: 100-130 pounds (male), 70-100 pounds (female)
    weight_data = [float(w) for w in re.findall(r"(\d+)", row[3])]
    if row[3] == "":
        min_weight = None
        max_weight = None
    elif "not exceeding" in row[3]:
        log.info("Processing small breed")
        max_weight = max(weight_data)
        min_weight = max_weight * 0.5
    elif "and up" in row[3]:
        log.info("Processing large breed")
        min_weight = min(weight_data)
        max_weight = min_weight * 1.25
    elif "Proportionate" in row[3]:
        min_weight = None
        max_weight = None
    else:
        log.info("Processing average breed")
        min_weight = min(weight_data)
        max_weight = max(weight_data)
    # example year data: 12-15 years
    year_data = [int(y) for y in re.findall(r"(\d+)", row[4])]
    if row[4] == "":
        min_year = None
        max_year = None
    elif len(year_data) == 0:
        min_year = None
        max_year = None
    else:
        min_year = min(year_data)
        max_year = max(year_data)
    unicode_breed = row[5].lower().replace(" ", "_")
    breed = (
        unicodedata.normalize("NFKD", unicode_breed)
        .encode("ASCII", "ignore")
        .decode("utf-8")
        .replace("-", "_")
        .replace("(standard)", "")
        .replace("(toy)", "")
        .replace("(miniature)", "")
        .strip()
    )
    _links = row[7].split(",")
    return (
        Breed(
            temperament_traits=temperament,
            min_height=min_height,
            max_height=max_height,
            min_weight=min_weight,
            max_weight=max_weight,
            min_year=min_year,
            max_year=max_year,
            name=breed,
        ),
        _links,
    )


def make_dog(breed: Breed, indexed_link: Tuple[int, Tuple[str, str]]) -> Optional[Dog]:
    log.info(f"Breed:{breed}, IdxLink:{indexed_link}")
    log.info(f"Image p0: {indexed_link[0]}")
    image_idx = indexed_link[0]
    log.info(f"Image p1: {indexed_link[1]}")
    log.info(f"Image p1-0: {indexed_link[1][0]}")
    data_src = indexed_link[1][0]
    log.info(f"Image p1-1: {indexed_link[1][1]}")
    image_link = indexed_link[1][1]
    _dog = Dog(
        name=breed.name,
        height_in=breed.height,
        weight_lb=breed.weight,
        unfiltered_traits=breed.temperament_traits,
    )
    try:
        image_path = process_image(
            breed_name=breed.name,
            dog_weight=_dog.weight,
            index=image_idx,
            data_src=data_src,
            image_link=image_link,
        )
        assert image_path is not None
    except AssertionError:
        log.warning(f"Problem processing image: {image_link}")
        return None
    else:
        _dog.image_path = image_path
        return _dog


if __name__ == "__main__":
    next(AKC_DATA)  # remove header
    wiki_breeds = get_wiki_breed_list()
    all_dogs = []
    breeds = list(AKC_DATA)
    for idx, row in enumerate(breeds):
        log.info(f"Processing row: {idx}")
        log.info(f"Processing akc breed: {row[5]}-{row[1:]}")
        try:
            akc_breed, akc_images = get_akc_info(row)
            log.info(f"akc name: {akc_breed.name}")
            akc_links = [("akc", link) for link in akc_images]
            log.info(f"AKC Links: {akc_links}")
        except Exception as _e:
            log.exception(_e)
            exit()
        else:
            log.info(f"Created breed: {akc_breed}")
            wiki_links = []
            try:
                wiki_breed_link = next(
                    b.link for b in wiki_breeds if b.name == akc_breed.name
                )
                log.info(f"Found wiki link: {wiki_breed_link}")
                wiki_images = get_wiki_breed_images(wiki_breed_link)
                wiki_links = [("wiki", link) for link in wiki_images]
                log.info(f"WIKI Links {wiki_links}")
            except StopIteration:
                log.warning(f"AKC match not found: {akc_breed.name}")
            finally:
                indexed_links = list(enumerate(wiki_links))
                log.info(f"Indexed links: {indexed_links}")
                with ThreadPoolExecutor() as executor:
                    dogs = list(
                        filter(
                            None.__ne__,
                            tqdm(
                                executor.map(
                                    make_dog, repeat(akc_breed), indexed_links
                                ),
                                total=len(indexed_links),
                                desc=f"Making: {akc_breed.name}",
                            ),
                        )
                    )
                    all_dogs.extend(dogs)
    log.info(f"Traits found: {all_temperament_traits}")
    min_cardinality = 1
    filtered_traits = {
        t[0] for t in all_temperament_traits.most_common() if t[1] >= min_cardinality
    }
    log.info(f"Common traits: {filtered_traits}")
    x_small_dog_dataset = []
    small_dog_dataset = []
    medium_dog_dataset = []
    large_dog_dataset = []
    x_large_dog_dataset = []
    for idx, dog in tqdm(
        enumerate(all_dogs), total=len(all_dogs), desc="Post processing traits"
    ):
        dog.dog_id = idx
        dog.common_traits = filtered_traits.intersection(dog.unfiltered_traits)
        log.info(f"Dog's common traits: {dog.common_traits}")
        dog_data = dict(dog)
        log.info(f"Adding dog data: {dog_data}")
        if dog.weight == "x-small":
            x_small_dog_dataset.append(dog_data)
        elif dog.weight == "small":
            small_dog_dataset.append(dog_data)
        elif dog.weight == "medium":
            medium_dog_dataset.append(dog_data)
        elif dog.weight == "large":
            large_dog_dataset.append(dog_data)
        elif dog.weight == "x-large":
            x_large_dog_dataset.append(dog_data)
        else:
            log.error(f"Bad dog: {dog_data}")
    x_small_df = pd.DataFrame(x_small_dog_dataset)
    x_small_df.set_index("dog_id", inplace=True)
    log.info(f"N small dog breeds: {x_small_df['breed_name'].nunique()}")
    x_small_df.to_csv(
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", "x-small", f"x-small-breeds-{now}.csv"),
        index=False,
    )
    small_df = pd.DataFrame(small_dog_dataset)
    small_df.set_index("dog_id", inplace=True)
    log.info(f"N small dog breeds: {small_df['breed_name'].nunique()}")
    small_df.to_csv(
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", "small", f"small-breeds-{now}.csv"),
        index=False,
    )
    med_df = pd.DataFrame(medium_dog_dataset)
    med_df.set_index("dog_id", inplace=True)
    log.info(f"N medium dog breeds: {med_df['breed_name'].nunique()}")
    med_df.to_csv(
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", "medium", f"medium-breeds-{now}.csv"),
        index=False,
    )
    large_df = pd.DataFrame(large_dog_dataset)
    large_df.set_index("dog_id", inplace=True)
    log.info(f"N large dog breeds: {large_df['breed_name'].nunique()}")
    large_df.to_csv(
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", "large", f"large-breeds-{now}.csv"),
        index=False,
    )
    x_large_df = pd.DataFrame(x_large_dog_dataset)
    x_large_df.set_index("dog_id", inplace=True)
    log.info(f"N x-large dog breeds: {x_large_df['breed_name'].nunique()}")
    x_large_df.to_csv(
        Path(__file__)
        .parents[1]
        .joinpath("commons-datasets", "x-large", f"x-large-breeds-{now}.csv"),
        index=False,
    )
    all_breeds = pd.concat((small_df, med_df, large_df, x_large_df))
    all_breeds.to_csv(
        Path(__file__).parents[1].joinpath(f"all_commons_breeds-{now}.csv"),
        index=False,
    )
    log.info(f"Done.")