import './HomePage.scss';
import React, {useEffect, useState} from 'react';
import axios from "axios";

import {
    Input,
    Stack,
    HStack,
    VStack,
    Box,
    Text,
    Button,
    Flex,
    Container,
    Spacer,
    Textarea,
    Divider, Select, RadioGroup, Radio, Slider, SliderFilledTrack, SliderTrack, SliderThumb, Image
} from '@chakra-ui/react'
import {VFlex, HFlex, BVFlex, BHFlex} from "../../components/WrappedChakra";

// Unfortunately Chakra does not support adding default props from a theme.
// So this workaround will have to do for now.
// https://github.com/chakra-ui/chakra-ui/discussions/6025
import {applyDefaultProps, applyFlexGrowProp} from "../../util/ChakraUtil";
applyFlexGrowProp([Flex, Button, Input]);

export const HomePage = (props) => {

    useEffect(() => {

    }, []);

    return (
        <>
            <Box bg='white' p={5} color='white'>
                <VFlex gap={3}>
                    <BHFlex gap={3}>
                        <VFlex>
                            <Text color='black' mb='1px' ml='10px' fontSize='sm'>Path to Dataset</Text>
                            <BHFlex p={3}>
                                <Input bg='white' placeholder='...' />
                            </BHFlex>
                        </VFlex>
                        <Button colorScheme='blue' h>Process</Button>
                    </BHFlex>
                    <HFlex gap={3}>
                        <VFlex w='50%' bg='gray.100' p={2} borderRadius={5} gap={5}>
                            <BVFlex bg='white'>
                                <Text color='black' mb='1px' ml='10px' fontSize='sm'>Caption</Text>
                                <Textarea bg='white' placeholder='...' />
                            </BVFlex>
                            <BVFlex>
                                <Text color='black' mb='1px' ml='10px' fontSize='sm'>Available Tags</Text>
                                <Input bg='white' placeholder='Search tags...'/>
                                <BVFlex bg='white'>
                                    <HFlex></HFlex>
                                    <Divider/>
                                    <HFlex></HFlex>
                                </BVFlex>
                            </BVFlex>
                            <BVFlex bg='white'>
                                <Text color='black' mb='1px' ml='10px' fontSize='sm'>Tag Set</Text>
                                <RadioGroup>
                                    <BHFlex gap={2}>
                                        {
                                            ["First", "Second"].map((value) => {
                                                return (
                                                    <BHFlex flexGrow={0} alignItems='center' border='1px solid' borderColor='gray.200' borderRadius={5}>
                                                        <Radio value={value}></Radio>
                                                        <Text color='black' pl='10px' mb='3px' verticalAlign='middle' display='flex'>{value}</Text>
                                                    </BHFlex>
                                                );
                                            })
                                        }
                                    </BHFlex>
                                </RadioGroup>
                            </BVFlex>
                            <HFlex gap={3}>
                                <VFlex>
                                    <BHFlex bg='white' p={3}>
                                        <VFlex>
                                            <Text color='black' mb='1px' ml='10px' fontSize='sm'>Path to Dataset</Text>
                                            <Input placeholder='...' />
                                        </VFlex>
                                    </BHFlex>
                                </VFlex>
                                <Button colorScheme='blue' h>Load Tags</Button>
                            </HFlex>
                        </VFlex>
                        <VFlex w='50%'>
                            <Flex bg='red' alignItems='middle' justifyContent='center'>
                                <Image src='https://raw.githubusercontent.com/SesuMoe/sd-tagger-webui/main/resources/showcase/screenshot-1.png' />
                            </Flex>
                            <HFlex>
                                <VFlex bg='gray.100' p={2} borderRadius={5} gap={5}>
                                    <Text color='black'>Something goes here</Text>
                                </VFlex>
                                <Slider aria-label='slider-ex-1' defaultValue={30}>
                                    <SliderTrack>
                                    <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                </Slider>
                            </HFlex>
                            <HFlex>
                                <Button m={2} colorScheme='blue' h>Previous</Button>
                                <Button m={2} colorScheme='blue' h>Next</Button>
                            </HFlex>
                            <Button m={2} colorScheme='blue' h>Save Tags</Button>
                        </VFlex>
                    </HFlex>
                </VFlex>
            </Box>
        </>
    );
}