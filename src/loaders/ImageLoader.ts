import Loader from '@/loaders/Loader';

import { ImageFile } from '@/stores/DataContext';

export default class ImageLoader extends Loader {
    static async load(file: File): Promise<ImageFile> {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                resolve({
                    name: file.name,
                    url,
                    width: image.width,
                    height: image.height,
                });
            };
            image.src = url;
        });
    }
}
