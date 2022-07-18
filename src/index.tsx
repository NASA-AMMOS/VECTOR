import '@/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ProvideData from '@/DataContext';
import App from '@/App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ProvideData>
        <App />
    </ProvideData>
);
