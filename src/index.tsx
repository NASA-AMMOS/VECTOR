import '@/index.css';

import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import ProvideData from '@/stores/DataContext';
import ProvideTools from '@/stores/ToolsContext';

import { router } from '@/router';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <ProvideData>
        <ProvideTools>
            <RouterProvider router={router} />
        </ProvideTools>
    </ProvideData>,
);
