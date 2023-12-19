import React, {useState} from 'react';
import {Dataset} from "../models/Dataset";
import TreeView, { flattenTree } from "react-accessible-treeview";
import { DiCss3, DiJavascript, DiNpm } from "react-icons/di";
import {FaList, FaRegFolder, FaRegFolderOpen} from "react-icons/fa";

export const DirectoryTreeView = (props) => {

    const {files} = props;

    const FileIcon = ({filename}) => {
        const extension = filename.slice(filename.lastIndexOf(".") + 1);
        switch (extension) {
            case "js":
                return <DiJavascript color="yellow" className="icon"/>;
            case "css":
                return <DiCss3 color="turquoise" className="icon"/>;
            case "json":
                return <FaList color="yellow" className="icon"/>;
            case "npmignore":
                return <DiNpm color="red" className="icon"/>;
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
        const tree = {}

        const basePathIndex = files.reduce((lowestIndex, path, currentIndex ) => {
          return files[lowestIndex].lastIndexOf('/') > path.lastIndexOf('/') ? currentIndex : lowestIndex;
        }, 0);

        const basePath = files[basePathIndex];



        for(let file of files) {
            const filterPath = file.replace()
        }
    }

    return (
        <TreeView
            data={data}
            aria-label="directory tree"
            nodeRenderer={({
                               element,
                               isBranch,
                               isExpanded,
                               getNodeProps,
                               level,
                           }) => (
                <div {...getNodeProps()} style={{paddingLeft: 20 * (level - 1)}}>
                    {isBranch ? (
                        <FolderIcon isOpen={isExpanded}/>
                    ) : (
                        <FileIcon filename={element.name}/>
                    )}
                    {element.name}
                </div>
            )}
        />
    );
}