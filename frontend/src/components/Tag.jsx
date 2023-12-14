import React, {useEffect, useState} from 'react'

import {Box, Text} from "@chakra-ui/react";

export const Tag = (props) => {
    const [on, setOn] = useState(false);

    const {name, value, onToggle, disabled} = props;

    const handleToggle = () => {
        if(disabled) {
            return;
        }

        if(onToggle)
            onToggle(!on)
        setOn(!on);
    }

    useEffect(() => {
        setOn(value);
    }, [value])

    return (
        <>
            <Box onClick={() => handleToggle()} py={1} px={2} border='1px solid' borderColor='gray.200' borderRadius={5} bg={(on) ? 'blue.200' : 'gray.100'}>
                <Text color='black' fontSize='sm' mb={0} cursor={(disabled) ? '' : 'pointer'} userSelect='none'>{name}</Text>
            </Box>
        </>
    );
}