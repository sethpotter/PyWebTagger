export class Dataset {
    constructor(index, path, num_files, available_tags) {
        this.index = index;
        this.path = path;
        this.num_files = num_files;
        this.available_tags = available_tags;
    }
}