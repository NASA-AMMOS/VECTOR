import '@/index.css';

import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Object3D } from 'three';

import ProvideData from '@/stores/DataContext';
import ProvideFilters from '@/stores/FiltersContext';

import { router } from '@/router';

Object3D.DEFAULT_UP.set(0, 0, 1);

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <ProvideData>
        <ProvideFilters>
            <RouterProvider router={router} />
        </ProvideFilters>
    </ProvideData>,
);
