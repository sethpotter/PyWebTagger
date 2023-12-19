import axios from "axios"
import {toRouteUrl} from "../util/ApiUtil";
import {Dataset} from "../models/Dataset";
import {DatasetImage} from "../models/DatasetImage";

let axiosAbort = [];

const cancel_dataset_request = (index) => {
    const request = axiosAbort.find(c => c.index === index);
    if(request) {
        axiosAbort = axiosAbort.filter(r => r.index !== index);
        request.controller.abort();
        console.log("Aborted Request: " + request);
    }
}

const load_dataset = (path) => {
    const request = {path: path};

    return axios.get(toRouteUrl('load_dataset', request)).then(res => {
        console.log(res);
        console.log(res.data);
        return new Dataset(res.data.index, res.data.path, res.data.hierarchy, res.data.num_files, res.data.available_tags);
    }).catch(err => {
        console.log(err.response);
        return undefined;
    });
}

const load_image = (index) => {
    const request = {index: index};

    const controller = new AbortController();

    const promise = axios.get(toRouteUrl('load_image', request), {signal: controller.signal}).then(res => {
        //console.log(res);
        axiosAbort = axiosAbort.filter(r => r.index !== index);
        return new DatasetImage(index, 'data:image/png;base64,' + res.data.image, res.data.size, res.data.path, res.data.caption);
    }).catch(err => {
        console.error(err);
        return undefined;
    });

    axiosAbort.push({index: index, controller: controller});
    return promise;
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
    deepdanbooru,
    cancel_dataset_request
}