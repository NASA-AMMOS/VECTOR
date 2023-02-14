import '@/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ProvideData from '@/stores/DataContext';
import ProvideRouter from '@/stores/RouterContext';
import ProvideTools from '@/stores/ToolsContext';
import App from '@/App';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <ProvideData>
        <ProvideRouter>
            <ProvideTools>
                <App />
            </ProvideTools>
        </ProvideRouter>
    </ProvideData>,
);
