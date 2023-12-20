import React, {useState} from 'react';
import {VFlex} from "../components/WrappedChakra";
import {Box} from "@chakra-ui/react";
import {FaRegFolder} from "react-icons/fa";
import '../styles/Hierarchy.scss';
import {load_dataset} from "../api/DatasetRoutes";

export const Hierarchy = (props) => {

    const {datasetPath, hierarchy, dataset, setDataset, setIndex, setTabIndex} = props;

    const [selected, setSelected] = useState();

    const handleSelect = (name) => {
        const segments = datasetPath.split('\\');
        const path = segments.join('\\') + name;

        setSelected(name);

        load_dataset(path).then((data) => {
            console.log("Loaded new dataset with " + data.num_files + " files");
            setDataset(data);
        });
    }

    const getTree = (elements, node, path = '', depth = 0) => {
        if(!node)
            return;

        for (const child of node.children)
            getTree(elements, child, path + '\\' + child.name, depth + 1);

        elements.push(
            <Box key={'hierarchy-' + node.name} className='tree-node' gap={2} ps={(depth * 20) + 'px'} bg={(node.name === selected) ? 'gray.200' : ''} onClick={() => handleSelect(path)}>
                <FaRegFolder color="e8a87c" className="icon"/>
                {node.name}
            </Box>
        );
    }

    const getElements = () => {
        if(Object.keys(hierarchy.hierarchy).length === 0)
            return;

        let elements = [];
        getTree(elements, hierarchy.hierarchy);
        return elements.reverse();
    }

    return (
        <VFlex className='directory' minHeight='200px'>
            {(hierarchy) ? getElements() : <></>}
        </VFlex>
    );
}