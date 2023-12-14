import React, {useEffect, useState} from 'react'

import {Box, Button, Divider, Input, Text} from "@chakra-ui/react";
import {BVFlex, HFlex} from "./WrappedChakra";
import {Tag} from "./Tag";

export const TagSearch = (props) => {

    const [tagSearch, setTagSearch] = useState('');
    const [activeTags, setActiveTags] = useState([]);
    const [page, setPage] = useState(0);

    const {enabledTags, tags, tagsPerPage = 75, onChange, onReloadTags} = props;

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

        const pageLimit = Math.floor(tags.length / tagsPerPage);
        if(value > pageLimit)
            value = pageLimit;

        setPage(value);
    }

    return (
        <>
            <BVFlex flexGrow={0} gap={3}>
                <Text color='black' mb='0px' ml='10px' fontSize='sm'>Available Tags</Text>
                <Input w='25%' bg='white' color='black' placeholder='Search tags...' value={tagSearch}
                       onChange={(e) => {
                           setTagSearch(e.target.value)
                       }}/>
                <BVFlex bg='white'>
                    <HFlex flexWrap='wrap' gap={1}>
                        {
                            tags.filter((val) => val.includes(tagSearch)).splice(page * tagsPerPage, tagsPerPage).map((val) =>
                                <Tag name={val} value={activeTags.includes(val)} onToggle={(active) => handleActiveTags(active, val)}/>
                            )
                        }
                    </HFlex>
                    <Divider/>
                    <HFlex alignItems='center'>
                        <Button colorScheme='blue' onClick={() => handlePage(page-1)}>Prev</Button>
                        <Text mb={0} p={2} color='black'>{page+1}/{Math.floor(tags.length / tagsPerPage)+1}</Text>
                        <Button colorScheme='blue' onClick={() => handlePage(page+1)}>Next</Button>
                    </HFlex>
                </BVFlex>
            </BVFlex>
        </>
    );
}