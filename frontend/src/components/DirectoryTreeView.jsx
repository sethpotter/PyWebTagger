import React, {useState} from 'react';
import {FaList, FaRegFolder, FaRegFolderOpen} from "react-icons/fa";
import {Box, Text} from '@chakra-ui/react';
import '../styles/DirectoryTreeView.scss';
import {HFlex, VFlex} from "./WrappedChakra";

export const DirectoryTreeView = (props) => {

    const [selected, setSelected] = useState();
    const {files} = props;

    const getTree = (elements, node, depth = 0) => {
        if(!node)
            return;

        for (const child of node.children)
            getTree(elements, child, depth + 1);
        elements.push(
            <Box className='tree-node' gap={2} ps={(depth * 20) + 'px'} bg={(node.name === selected) ? 'gray.200' : ''} onClick={() => setSelected(node.name)}>
                <FaRegFolder color="e8a87c" className="icon"/>
                {node.name}
            </Box>
        );
    }

    const getElements = () => {
        if(!files)
            return;

        let elements = [];
        getTree(elements, files)
        return elements.reverse();
    }

    return (
        <VFlex className='directory' minHeight='200px'>
            {(files) ? getElements() : <></>}
        </VFlex>
    );
}