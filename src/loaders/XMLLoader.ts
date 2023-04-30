import Loader, { LoaderType } from '@/loaders/Loader';

import { FormatType } from '@/format/Format';

export default class XMLLoader extends Loader {
    private static parser = new DOMParser();

    static async load(file: File): Promise<Document> {
        const contents = await file.text();
        return this.parser.parseFromString(contents, 'application/xml');
    }

    static inferFormat(xml: Document): FormatType {
        const tag = xml.querySelector('vector');
        if (tag) {
            return FormatType.VECTOR;
        }
        return FormatType.JPL;
    }

    static inferType(xml: Document, format: FormatType): LoaderType {
        switch (format) {
            case FormatType.JPL:
                if (xml.querySelector('tiepoint_file')) {
                    return LoaderType.TRACKS;
                } else if (xml.querySelector('camera_model')) {
                    return LoaderType.CAMERAS;
                }

            case FormatType.VECTOR:
                const tag = xml.querySelector('vector');
                if (tag) {
                    const format = tag.getAttribute('format');
                    if (format === LoaderType.TRACKS || format === LoaderType.CAMERAS) {
                        return format;
                    }
                }
        }

        throw new Error(`Failed to infer type from ${format}`);
    }
}
