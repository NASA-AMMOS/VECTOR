import { createBrowserRouter } from 'react-router-dom';

import Landing from '@/routes/landing';
import Root from '@/routes/root';
import Scene from '@/routes/scene';
import Images from '@/routes/images';
import Image from '@/routes/image';
import Track from '@/routes/track';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Landing />,
    },
    {
        element: <Root />,
        children: [
            {
                path: 'scene',
                element: <Scene />,
            },
            {
                path: 'images',
                element: <Images />,
            },
            {
                path: 'images/:cameraId',
                element: <Image />,
            },
            {
                path: 'tracks/:trackId',
                element: <Track />,
            },
        ],
    },
]);
