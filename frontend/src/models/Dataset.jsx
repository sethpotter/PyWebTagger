export class Dataset {
    constructor(index, path, files, num_files, available_tags) {
        this.index = index;
        this.path = path;
        this.files = files;
        this.num_files = num_files;
        this.available_tags = available_tags;
    }
}