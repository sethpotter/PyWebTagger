import React from 'react';
import {BrowserRouter, useRoutes} from 'react-router-dom';
import {routes} from './Routes';

import './App.scss';

import { ChakraProvider } from '@chakra-ui/react'

function App() {
    const Routing = () => {
        return useRoutes(routes);
    }
    return (
        <ChakraProvider>
            <BrowserRouter>
                <Routing/>
            </BrowserRouter>
        </ChakraProvider>
    );
}

export default App;
