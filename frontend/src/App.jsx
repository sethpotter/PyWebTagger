import React from 'react';
import {BrowserRouter, useRoutes} from 'react-router-dom';
import {routes} from './Routes';

import './styles/App.scss';

function App() {
    const Routing = () => {
        return useRoutes(routes);
    }

    return (
        <BrowserRouter>
            <Routing/>
        </BrowserRouter>
    );
}

export default App;
