import React, {useState} from 'react';
import {Dataset} from "../models/Dataset";
import {VFlex} from "../components/WrappedChakra";


export const Hierarchy = (props) => {

    const [dataset, setDataset] = useState(new Dataset(0, '', 0, {}));
    const [datasetPath, setDatasetPath] = useState(() => {
        const stored = localStorage.getItem('datasetPath');
        return (stored === undefined) ? '' : localStorage.getItem('datasetPath');
    });

    return (
        <VFlex>

        </VFlex>
    );
}