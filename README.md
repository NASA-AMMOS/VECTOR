# VECTOR

Visualization and Editing of Camera Tiepoints, Orientations, and Residuals

## Development

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to install this software beforehand:

```
Node.js v16.15.1
npm v8.11.0
```

To install Node.js and npm, you can use [nvm](https://github.com/nvm-sh/nvm):

1. Install nvm from GitHub. Running this command will attempt to add the nvm path to the user profile. This can fail and a warning will be outputted. To resolve the issue, please look at the [GitHub](https://github.com/nvm-sh/nvm#install--update-script).

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

2. Install the correct version of Node.js.

```bash
nvm install 16.15.1
```

3. Set the default Node.js version.

```bash
nvm alias default 16.15.1
```

4. Restart your terminal and confirm your Node.js version.

```bash
node --version
> v16.15.1
```

### Installation

1. Clone the repository.

```bash
git clone git@github.jpl.nasa.gov:vis-program/vector.git
```

2. Switch to the project directory and install the necessary dependencies.

```bash
cd vector
npm install
```

3. Run the application.

```bash
npm run dev
```

## File Loaders

VECTOR loads files using the File System Access API available in modern browsers. VECTOR introduces a `Loader` interface that can be implemented to parse a `File` object into XML, PNG, VICAR, etc...

### File Extensions

Each implementation of Loader includes an `EXTENSIONS` property that defines what extensions a `Loader` supports. For example, this is the `XMLLoader`:

```typescript
export default class XMLLoader extends Loader {
    static EXTENSIONS = ['xml', 'tie', 'tpt', 'nav'];

    ...
}
```

This is useful when files have custom extensions that are non-standard. If you need to support a new file extension, you can update the `EXTENSIONS` property.

### Custom Loader

Anyone can implement a new `Loader` by extending the abstract base class `Loader` and satisfying the type constraints. You will also need to update the Landing route to handle your new loader.

```typescript
export default class MyLoader extends Loader {
    static EXTENSIONS: string[] = ['kazi', 'jawad'];

    static async load(...): Promise<...> {
        ...
    }
}
```

If a method is not implemented an `Error` will be thrown when that method is called inside VECTOR.

However, **not every** method needs an implementation. If you are not exporting to a file type, the `write` method does not need to be implemented.

## File Formats

VECTOR requires camera, track, and image information to be uploaded by the user.
To allow for flexibility in the data processing, VECTOR exposes a `Format` interface that can be implemented to translate various formats into VECTOR's data structures.

VECTOR **does not** handle different coordinate systems, so tracks and cameras are expected to be in the same coordinate system.

### VISOR Format

The VISOR format is currently used at NASA's Jet Propulsion Laboratory for the Mars 2020 mission.
It defines a `navigation.xml` and `tiepoints.xml` alongside a directory of images that match against a `unique_id` attribute defined inside the `tiepoints.xml`.

### VECTOR Format

The VECTOR format is specifically designed for VECTOR. Therefore, it involves less processing time and is structured exactly like VECTOR's internal data structures.
It defines a `cameras.xml` and `tracks.xml` alongside a directory of images, where the `cameras.xml` includes the filename for the image each camera maps to.

### Custom Format

Anyone can implement a new `Format` by extending the abstract base class `Format` and satisfying the type constraints. You will also need to update the Landing route to handle your new format.

```typescript
class MyFormat extends Format {
    static async processTracks(...): Promise<Track[]> {
        ...
    }

    static async processCameras(_: unknown): Promise<Camera[]> {
        ...
    }

    ...
}
```

If a method is not implemented an `Error` will be thrown when that method is called inside VECTOR.

However, **not every** method needs an implementation.
For example, the `mapImages` method is only needed if image names are not available when cameras are being processed. This is the case for the VISOR format, but you will notice the VECTOR format does not implement this method.

Likewise, if you are not planning on exporting file information, the export methods do not need to be implemented.

## Camera Models

VECTOR supports a `CameraModel` interface that allows anyone to implement their own geoemtric camera model for their specific use cases. The `CameraModel` interface handles geometric details like frustum visualization or ray-image projection.

### CAHVORE Camera Model

The CAHVORE camera model is used at NASA's Jet Propulsion Laboratory and is the primary reference implementation.

### Custom Camera Model

Anyone can implement a new `Format` by extending the abstract base class `Format` and satisfying the type constraints.

```typescript
class MyCameraModel extends CameraModel {
    static ID = 'KaziJawad';

    ...
}
```

If a method is not implemented an `Error` will be thrown when that method is called inside VECTOR.

The `ID` property can be used inside the `Format` interface to validate against different camera models.
The VECTOR format specifically has a `model` attribute that matches against the `ID` string.
This static property might not always be needed. For example, it is not used in the VISOR format because that always uses the CAHVORE camera model.

## Conversion Tools

An alternative to using the `Loader` and `Format` interfaces for data processing is converting to VECTOR's format and use that as input into VECTOR.

This is useful for people inexperienced with JavaScript/TypeScript and are more comfortable writing a script.

We have provided a reference implemention in Python that converts the VISOR format to the VECTOR format without external dependencies inside the `cmd` folder.

## Reference video

For further reference, a presentation on VECTOR can be found [here]( https://youtu.be/zjR8CbQ5nPM)”.

## Contributors

Kazi Jawad, Racquel Fygenson, Isabel Li, Mauricio Hess-Flores, François Ayoub, Robert Deen, Scott Davidoff, Santiago Lombeyda, Maggie Hendrie, Hillary Mushkin

## Acknowledgements

This research was carried out at the Jet Propulsion Laboratory, California Institute of Technology, and was sponsored by the JPL / Caltech / Art Center Data to Discovery Program, and the National Aeronautics and Space Administration (80NM0018D0004).

## License

Please view the [LICENSE.md](LICENSE.md) file in the repository for more information on how VECTOR is licensed.
