import React, {useEffect, useState} from 'react'

import {Box, Divider, Input, Text} from "@chakra-ui/react";
import {BVFlex, HFlex} from "./WrappedChakra";
import {Tag} from "./Tag";

export const TagSearch = (props) => {

    const [tagSearch, setTagSearch] = useState('');
    const [activeTags, setActiveTags] = useState([]);

    const {enabledTags, tags, onChange} = props;

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
                            tags.filter((val) => val.includes(tagSearch)).map((val) =>
                                <Tag name={val} value={activeTags.includes(val)} onToggle={(active) => handleActiveTags(active, val)}/>)
                        }
                    </HFlex>
                    <Divider/>
                    <HFlex></HFlex>
                </BVFlex>
            </BVFlex>
        </>
    );
}