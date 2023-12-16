import React, {useEffect, useState} from 'react'

import {Box, Text} from "@chakra-ui/react";

export const Tag = (props) => {
    const [on, setOn] = useState(false);

    const {name, toggled, onToggle, disabled, ...extra} = props;

    const handleToggle = () => {
        if(disabled) {
            return;
        }

        if(onToggle)
            onToggle(!on)
        setOn(!on);
    }

    useEffect(() => {
        setOn(toggled);
    }, [toggled])

    const handleOpenBooruPage = (e) => {
        if(e.button === 1) {
            const tag = e.target.innerText.replace(' ', '_');
            console.log('Open booru page for ' + tag);
            window.open('https://danbooru.donmai.us/wiki_pages/' + tag, '_blank').focus();
        }
        e.preventDefault();
    }

    return (
        <>
            <Box {...extra} onMouseDown={(e) => handleOpenBooruPage(e)} onClick={() => handleToggle()} py={1} px={2} border='1px solid' borderColor='gray.200' borderRadius={5} bg={(on) ? 'blue.200' : 'gray.100'}>
                <Text color='black' fontSize='sm' mb={0} cursor={(disabled) ? '' : 'pointer'} userSelect='none'>{name}</Text>
            </Box>
        </>
    );
}