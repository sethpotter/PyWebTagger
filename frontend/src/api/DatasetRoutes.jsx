import axios from "axios"
import {toRouteUrl} from "../util/ApiUtil";
import {Dataset} from "../models/Dataset";
import {DatasetImage} from "../models/DatasetImage";


const load_dataset = (path) => {
    const request = {path: path};

    return axios.get(toRouteUrl('load_dataset', request)).then(res => {
        console.log(res);
        console.log(res.data);
        return new Dataset(res.data.index, res.data.path, res.data.num_files, res.data.available_tags);
    }).catch(err => {
        console.log(err.response);
        return undefined;
    });
}

const load_image = (index) => {
    const request = {index: index};

    return axios.get(toRouteUrl('load_image', request)).then(res => {
        console.log(res);
        return new DatasetImage(res.data.image, res.data.size, res.data.path, res.data.caption);
    }).catch(err => {
        console.log(err.response);
        return undefined;
    });
}

const save_caption = (index, caption) => {
    const request = {
        index: index,
        caption: caption
    };

    return axios.post(toRouteUrl('save_caption', request)).then(res => {
        console.log(res);
        return true;
    }).catch(err => {
        console.log(err.response);
        return false;
    });
}

const deepdanbooru = (path, threshold) => {
    const request = {
        path: path,
        threshold: threshold
    };

    return axios.get(toRouteUrl('deepdanbooru', request)).then(res => {
        console.log(res);
        return res.data;
    }).catch(err => {
        console.log(err.response);
        return undefined;
    });
}

export {
    load_dataset,
    load_image,
    save_caption,
    deepdanbooru
}