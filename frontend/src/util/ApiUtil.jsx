import {url} from "../url";
import axios from "axios";

const toQuery = (obj) => {
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

const toRouteUrl = (route, request = undefined) => {
    let route_url = `http://${url}/` + route;
    if(request !== undefined) {
        route_url += '?' + toQuery(request)
    }
    return route_url;
}

export {
    toQuery,
    toRouteUrl
}