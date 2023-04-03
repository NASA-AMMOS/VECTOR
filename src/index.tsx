import '@/index.css';

import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import ProvideData from '@/stores/DataContext';
import ProvideFilters from '@/stores/FiltersContext';

import { router } from '@/router';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <ProvideData>
        <ProvideFilters>
            <RouterProvider router={router} />
        </ProvideFilters>
    </ProvideData>,
);
