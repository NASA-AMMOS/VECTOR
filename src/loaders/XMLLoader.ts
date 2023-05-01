import Loader, { LoaderType } from '@/loaders/Loader';

import { FormatType } from '@/formats/Format';

export default class XMLLoader extends Loader {
    private static parser = new DOMParser();
    private static serializer = new XMLSerializer();

    static EXTENSIONS = ['xml', 'tie', 'tpt', 'nav'];

    static async load(file: File): Promise<Document> {
        const contents = await file.text();
        return this.parser.parseFromString(contents, 'application/xml');
    }

    static async write(xml: Document) {
        const contents = this.serializer.serializeToString(xml);
        const blob = new Blob([contents], { type: 'application/xml' });

        // @ts-ignore
        const handle = await window.showSaveFilePicker();

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    static inferFormat(xml: Document): FormatType {
        const tag = xml.querySelector('vector');
        if (tag) {
            return FormatType.VECTOR;
        }
        return FormatType.VISOR;
    }

    static inferType(xml: Document, format: FormatType): LoaderType {
        switch (format) {
            case FormatType.VISOR:
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
