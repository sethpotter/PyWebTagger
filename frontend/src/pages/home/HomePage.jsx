import './HomePage.scss';
import React, {useEffect, useState} from 'react';
import axios from "axios";

import {
    Input, Stack, HStack, VStack, Box, Text, Button, Flex, Container, Spacer, Textarea,
    Divider, Select, RadioGroup, Radio, Slider, SliderFilledTrack, SliderTrack, SliderThumb, Image
} from '@chakra-ui/react'
import {VFlex, HFlex, BVFlex, BHFlex} from "../../components/WrappedChakra"
import {load_dataset, load_image} from "../../api/DatasetRoutes";

// Unfortunately Chakra does not support adding default props from a theme.
// So this workaround will have to do for now.
// https://github.com/chakra-ui/chakra-ui/discussions/6025
import {appendDefaultProps} from "../../util/ChakraUtil";
import {Dataset} from "../../models/Dataset";
import {DatasetImage} from "../../models/DatasetImage";
appendDefaultProps([Flex, Button, Input], {
    flexGrow: 1,
    flexBasis: 0
});
appendDefaultProps([Button], {
    minHeight: '50px'
});
appendDefaultProps([Input], {
    minHeight: '40px'
});

export const HomePage = (props) => {

    const [datasetPath, setDatasetPath] = useState('');
    const [dataset, setDataset] = useState(new Dataset(0, '', 0));
    const [datasetImage, setDatasetImage] = useState(new DatasetImage(0, {}, '', []));

    const displayResizeButton = () => {
        let display = document.getElementById("display");
        let displayResizeBtn  = document.getElementById("display_resize_button");
        let displayBounds = display.getBoundingClientRect();
        let drag = false;
        let downY = 0;

        document.addEventListener("mousemove", (e) => {
            if(drag) {
                display.style.height = (e.pageY - displayBounds.y + 10) + "px";
                display.style.minHeight = (e.pageY - displayBounds.y + 10) + "px";
            }
        });

        displayResizeBtn.onmousedown = (e) => {
            drag = true;
            downY = e.pageY;
        };

        document.addEventListener("mouseup", (e) => {
            drag = false;
        });
    };

    const handleIndexChange = (index) => {
        if(isNaN(index)) {
            return;
        }

        if(index > dataset.num_files) {
            index = dataset.num_files;
        }
        if(index < 1) {
            index = 1;
        }

        console.log(dataset);
        console.log(index-1);
        setDataset(new Dataset(index-1, dataset.path, dataset.num_files));

        load_image(index-1).then((datasetImage) => {
            setDatasetImage(datasetImage);
        });
    }

    const handleSetDataset = () => {
        load_dataset(datasetPath).then((data) => {
            console.log(data);
            console.log("SET DATA");
            setDataset(data);
        });
    }


    useEffect(() => {
        displayResizeButton();
    }, []);

    return (
        <>
            <Box bg='white' p={5} color='white'>
                <VFlex gap={3}>
                    <BHFlex gap={3}>
                        <VFlex>
                            <Text color='black' mb='1px' ml='10px' fontSize='sm'>Path to Dataset</Text>
                            <BHFlex p={3}>
                                <Input bg='white' color='black' placeholder='...' value={datasetPath} onChange={(e) => setDatasetPath(e.target.value)} />
                            </BHFlex>
                        </VFlex>
                        <Button colorScheme='blue' h onClick={() => handleSetDataset()}>Process</Button>
                    </BHFlex>
                    <HFlex gap={3}>
                        <VFlex w='50%' bg='gray.100' p={2} borderRadius={5} gap={5}>
                            <BVFlex flexGrow={0} bg='white'>
                                <Text color='black' mb='1px' ml='10px' fontSize='sm'>Caption</Text>
                                <Textarea bg='white' placeholder='...' />
                            </BVFlex>
                            <BVFlex flexGrow={0}>
                                <Text color='black' mb='1px' ml='10px' fontSize='sm'>Available Tags</Text>
                                <Input bg='white' placeholder='Search tags...'/>
                                <BVFlex bg='white'>
                                    <HFlex></HFlex>
                                    <Divider/>
                                    <HFlex></HFlex>
                                </BVFlex>
                            </BVFlex>
                            <BVFlex flexGrow={0} bg='white'>
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
                            <HFlex flexGrow={0} gap={3}>
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
                        <VFlex w='50%' gap={3}>
                            <BVFlex id='display' position='relative' alignItems='center' justifyContent='center' p={4} height='1000px' minHeight='1000px'>
                                <HFlex flexGrow={0} alignItems='center' justifyContent='center' maxHeight='100%'>
                                    <Image height='100%' src={'data:image/png;base64,' + datasetImage.image} />
                                    <Box position='relative' w='0%' h='0%'>
                                        <div id='cropper'>Cropper</div>
                                    </Box>
                                </HFlex>
                                <button id='display_resize_button' />
                            </BVFlex>
                            <HFlex gap={3}>
                                <VFlex bg='gray.100' p={2} borderRadius={5} gap={5}>
                                    <Text color='black' fontSize='sm'>{dataset.index+1} / {dataset.num_files} {datasetImage.path} ({datasetImage.size.width}x{datasetImage.size.height})</Text>
                                </VFlex>
                                <BVFlex>
                                    <Box position='relative'>
                                        <HFlex position='absolute' top='-21px' left='2px' p={1} bg='white'>
                                            <Text fontSize='xs' height='20px' textAlign='center' color='black'>Dataset Index</Text>
                                        </HFlex>
                                        <HFlex position='absolute' top='-16px' right='2px' py={1}>
                                            <Input minHeight='0px' maxWidth='100px' placeholder='...' value={dataset.index+1} onChange={(e) => handleIndexChange(e.target.value)} fontSize='xs' height='20px' textAlign='center' color='black' bg='white' />
                                        </HFlex>
                                    </Box>
                                    <HFlex>
                                        <Slider flexGrow={1} w='50%' onChange={(val) => handleIndexChange(val)} value={dataset.index+1} defaultValue={1} min={1} max={dataset.num_files}>
                                            <SliderTrack>
                                            <SliderFilledTrack />
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                    </HFlex>
                                </BVFlex>
                            </HFlex>
                            <HFlex gap={3}>
                                <Button colorScheme='blue' h onClick={() => handleIndexChange(dataset.index + 1 - 1)}>Previous</Button>
                                <Button colorScheme='blue' h onClick={() => handleIndexChange(dataset.index + 1 + 1)}>Next</Button>
                            </HFlex>
                            <Button colorScheme='blue' h>Save Tags</Button>
                        </VFlex>
                    </HFlex>
                </VFlex>
            </Box>
        </>
    );
}