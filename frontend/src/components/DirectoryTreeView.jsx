import React, {useState} from 'react';
import TreeView, { flattenTree } from "react-accessible-treeview";
import {FaList, FaRegFolder, FaRegFolderOpen} from "react-icons/fa";
import { GoFileMedia, GoFile } from "react-icons/go";
import {Box, Text} from '@chakra-ui/react';
import '../styles/DirectoryTreeView.scss';

export const DirectoryTreeView = (props) => {

    const {files} = props;

    const FileIcon = ({filename}) => {
        const extension = filename.slice(filename.lastIndexOf(".") + 1);
        switch (extension) {
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
                return <GoFileMedia color='gray' className="icon"/>
            case 'txt':
                return <GoFile color='gray' className="icon"/>
            default:
                return null;
        }
    }

    const FolderIcon = ({isOpen}) =>
        isOpen ? (
            <FaRegFolderOpen color="e8a87c" className="icon"/>
        ) : (
            <FaRegFolder color="e8a87c" className="icon"/>
        );

    const convertListToFileStructure = (files) => {

        const buildStructure = (paths) => {
            const folder = {name: '', children: []};

            if(paths)
                paths.forEach(path => {
                    addPathToFolder(folder, path.split('\\'));
                });

            return folder;
        }

        const addPathToFolder = (currentFolder, segments) => {
            const segment = segments.shift();
            const existingFolder = currentFolder.children.find(node => node.name === segment);

            if (!existingFolder) {
                const newFolder = {name: segment, children: []};
                currentFolder.children.push(newFolder);

                if (segments.length > 0) {
                    addPathToFolder(newFolder, segments);
                }
            } else {
                if (segments.length > 0) {
                    addPathToFolder(existingFolder, segments);
                }
            }
        }

        const directoryFirst = (structure) => {
            if(structure) {
                if(structure.children) {
                    const dirs = structure.children.filter(i => !i.name.includes('.'));
                    const files = structure.children.filter(i => i.name.includes('.'));
                    structure.children = dirs.concat(files);
                    structure.children.forEach(s => directoryFirst(s));
                }
            }
        }

        const structure = buildStructure(files);
        directoryFirst(structure);

        return structure;
    }

    return (
        <TreeView
            className='directory'
            data={flattenTree(convertListToFileStructure(files))}
            aria-label="directory tree"
            nodeRenderer={({
                               element,
                               isBranch,
                               isExpanded,
                               getNodeProps,
                               level,
                           }) => (
                <Box whiteSpace='nowrap' fontSize='sm' m={0} {...getNodeProps()} listStyleType='none' style={{paddingLeft: 25 * (level - 1)}}>
                    {isBranch ? (
                        <FolderIcon isOpen={isExpanded}/>
                    ) : (
                        <FileIcon filename={element.name}/>
                    )}
                    {element.name}
                </Box>
            )}
        />
    );
}