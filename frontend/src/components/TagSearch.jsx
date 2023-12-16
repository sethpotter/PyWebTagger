import React, {useEffect, useState} from 'react'

import {Box, Button, Divider, Input, Text} from "@chakra-ui/react";
import {BVFlex, HFlex} from "./WrappedChakra";
import {Tag} from "./Tag";

export const TagSearch = (props) => {

    const [tagSearch, setTagSearch] = useState('');
    const [activeTags, setActiveTags] = useState([]);
    const [page, setPage] = useState(0);

    const {enabledTags, tags, tagsPerPage = 75, onChange, onReloadTags, showTagCounts, sortMode} = props;

    const handleActiveTags = (active, val) => {
        const updatedTags = active
        ? [...activeTags, val]
        : activeTags.filter(item => item !== val);

        setActiveTags(updatedTags);

        if(onChange)
            onChange(updatedTags);
    }

    useEffect(() => {
        setActiveTags(enabledTags);
    }, [enabledTags])

    const handlePage = (value) => {
        if(value < 0)
            value = 0;

        const pageLimit = Math.floor(Object.keys(tags).filter((val) => val.includes(tagSearch)).length / tagsPerPage);
        if(value > pageLimit)
            value = pageLimit;

        setPage(value);
    }

    const handleSearch = (value) => {
        setTagSearch(value);
    }

    useEffect(() => {
        handlePage(page);
    }, [tagSearch, tagsPerPage])

    const modifyTags = () => {
        const keyValue = Object.entries(tags);

        if(sortMode === '0') {
            keyValue.sort((a, b) => a[0].localeCompare(b[0]));
        } else if(sortMode === '1') {
            keyValue.sort((a, b) => b[1] - a[1]);
        }

        const databaseKeys = keyValue.map(([key, value]) => key);
        const enabledWithoutDatabaseTags = enabledTags.filter(t => databaseKeys.includes(t))
        const databaseWithoutEnabledTags = databaseKeys.filter(t => !enabledTags.includes(t))

        const tagsAtFront = enabledWithoutDatabaseTags.concat(databaseWithoutEnabledTags);

        return tagsAtFront.filter((val) => val.includes(tagSearch));
    }

    return (
        <>
            <BVFlex flexGrow={0} gap={3}>
                <Text color='black' mb='0px' ml='10px' fontSize='sm'>Available Tags</Text>
                <Input w='25%' bg='white' color='black' placeholder='Search tags...' value={tagSearch}
                       onChange={(e) => {
                           handleSearch(e.target.value)
                       }}/>
                <BVFlex bg='white'>
                    <HFlex flexWrap='wrap' gap={1}>
                        {
                            modifyTags().splice(page * tagsPerPage, tagsPerPage).map((val) =>
                                <Tag name={(showTagCounts) ? tags[val] + ' ' + val : val} value={val} toggled={activeTags.includes(val)} onToggle={(active) => handleActiveTags(active, val)}/>
                            )
                        }
                    </HFlex>
                    <Divider/>
                    <HFlex alignItems='center'>
                        <Button colorScheme='blue' onClick={() => handlePage(page-1)}>Previous</Button>
                        <Text mb={0} p={2} color='black'>{page+1}/{Math.floor(modifyTags().length / tagsPerPage)+1}</Text>
                        <Button colorScheme='blue' onClick={() => handlePage(page+1)}>Next</Button>
                    </HFlex>
                </BVFlex>
            </BVFlex>
        </>
    );
}