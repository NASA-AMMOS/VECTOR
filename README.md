# VECTOR

Visualization and Editing of Camera Tiepoints, Orientations, and Residuals

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to install this software beforehand:

```
Node.js v16.15.1
npm v8.11.0
```

To install Node.js and npm, you can use [nvm](https://github.com/nvm-sh/nvm):

1. Install nvm from GitHub:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Note: Running this command will attempt to add the nvm path to the user profile. This can fail and a warning will be outputted. To resolve the issue, please look at the [GitHub](https://github.com/nvm-sh/nvm#install--update-script).

2. Install the correct version of Node.js:

```bash
nvm install 16.15.1
```

3. Set the default Node.js version:

```bash
nvm alias default 16.15.1
```

4. Restart your terminal and confirm your Node.js version:

```bash
node --version
> v16.15.1
```

### Installation

A step by step series of examples that tell you how to get a development environment running:

1. Clone the repository:

```bash
git clone git@github.jpl.nasa.gov:vis-program/vector.git
```

2. Switch to the project directory and install the necessary dependencies:

```bash
cd vector
npm install
```

3. Run the application:

```bash
npm run dev
```

## Major Dependencies

- [React](https://reactjs.org)
- [Three.js + React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [D3.js](https://d3js.org)
- [Observable Plot](https://github.com/observablehq/plot)
- [Vanilla Extract](https://vanilla-extract.style)

## Authors

Kazi Jawad, Racquel Fygenson, Isabel Li
