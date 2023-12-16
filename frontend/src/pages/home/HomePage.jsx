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
    Divider,
    Select,
    RadioGroup,
    Radio,
    Slider,
    SliderFilledTrack,
    SliderTrack,
    SliderThumb,
    Image,
    Switch,
    NumberInput,
    NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Checkbox
} from '@chakra-ui/react'
import {VFlex, HFlex, BVFlex, BHFlex} from "../../components/WrappedChakra"
import {load_dataset, load_image, save_caption, deepdanbooru} from "../../api/DatasetRoutes";

// Unfortunately Chakra does not support adding default props from a theme.
// So this workaround will have to do for now.
// https://github.com/chakra-ui/chakra-ui/discussions/6025
import {appendDefaultProps} from "../../util/ChakraUtil";
import {Dataset} from "../../models/Dataset";
import {DatasetImage} from "../../models/DatasetImage";
import {Tag} from "../../components/Tag";
import {TagSearch} from "../../components/TagSearch";
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

    const [datasetPath, setDatasetPath] = useState(() => {
        const stored = localStorage.getItem('datasetPath');
        return (stored === undefined) ? '' : localStorage.getItem('datasetPath');
    });

    const [dataset, setDataset] = useState(new Dataset(0, '', 0, {}));
    const [datasetImage, setDatasetImage] = useState(new DatasetImage(0, {}, '', ''));

    const [tagMode, setTagMode] = useState(false);
    const [autoSave, setAutoSave] = useState(false);
    const [tagsToDisplay, setTagsToDisplay] = useState(100);
    const [showTagCounts, setShowTagCounts] = useState(false);
    const [sortMode, setSortMode] = useState('0');
    const [sortTags, setSortTags] = useState(false);
    const [formatTags, setFormatTags] = useState(false);

    const [recommend, setRecommend] = useState([]);
    const [threshold, setThreshold] = useState(0.8);
    const [append, setAppend] = useState('0');


    const [busy, setBusy] = useState(false);


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

        if(autoSave) {
            // Only save if something changed
            if(datasetImage.caption !== datasetImage.original_caption)
                handleCaptionSave(dataset.index, datasetImage.caption);
        }

        setDataset(new Dataset(index-1, dataset.path, dataset.num_files, dataset.available_tags));

        loadDatasetImage(index - 1);
    }

    const handleSetDataset = () => {
        load_dataset(datasetPath).then((data) => {
            console.log("Loaded new dataset with " + dataset.num_files + " files");
            setDataset(data);
            loadDatasetImage(0);
        });
    }

    const loadDatasetImage = (index) => {
        load_image(index).then((datasetImage) => {
            datasetImage.original_caption = datasetImage.caption;

            if(tagMode) {
                const tags = handleTagOptions(datasetImage.caption.split(',').map(val => val.trim()));
                datasetImage.caption = tags.join(', ');
            }

            setDatasetImage(datasetImage);
        });
    }

    const handleTagOptions = (tags) => {
        if(sortTags) {
            if(sortMode === '1') {
                tags = tags.sort((a, b) => a.localeCompare(b));
            } else if(sortMode === '2') {
                tags = tags.sort((a, b) => dataset.available_tags[b] - dataset.available_tags[a]);
            }
        }
        if(formatTags) {
            tags = tags.map(t => t.trim().toLowerCase().replaceAll(' ', '_'));
        }
        return tags;
    }

    const handleCaptionUpdate = (caption) => {
        console.log(caption);
        const newDatasetImage = new DatasetImage(datasetImage.image, datasetImage.size, datasetImage.path, caption);
        newDatasetImage.original_caption = datasetImage.original_caption;
        setDatasetImage(newDatasetImage);
    }

    const handleCaptionSave = (index, caption) => {
        const tags = caption.split(',').map(v => v.trim());
        const originalTags = datasetImage.original_caption.split(',').map(v => v.trim());
        const removedTags = originalTags.filter(t => !tags.some(v => v === t));

        for(const t of tags) {
            if(!(t in dataset.available_tags)) {
                dataset.available_tags[t] = 1;
                console.log("New Tag: " + t);
            } else {
                if(!originalTags.includes(t)) {
                    dataset.available_tags[t] = Number(dataset.available_tags[t]) + 1;
                    console.log(t + " +1 -> " + dataset.available_tags[t]);
                }
            }
        }

        for(const t of removedTags) {
            const count = dataset.available_tags[t];
            if(count > 1) {
                dataset.available_tags[t] -= 1;
                console.log(t + " -1 -> " + dataset.available_tags[t]);
            } else {
                delete dataset.available_tags[t];
                console.log("Deleted Tag: " + t);
            }
        }


        save_caption(index, caption).then(() => {
            const newDatasetImage = new DatasetImage(datasetImage.image, datasetImage.size, datasetImage.path, caption);
            newDatasetImage.original_caption = caption;
            setDatasetImage(newDatasetImage);
            console.log("Saved " + index + " with caption " + caption);
        });
    }

    const handleInterrogate = () => {
        setBusy(true);
        deepdanbooru(datasetImage.path, threshold).then((tags_data) => {
            const interrogate = Object.entries(tags_data).map(([key, value]) => key).join(', ');
            if(append === '0') {
                setRecommend(interrogate);
            } else if(append === '1') { // Replace
                handleCaptionUpdate(interrogate);
            } else if(append === '2') { // Before
                handleCaptionUpdate(interrogate + ', ' + datasetImage.caption);
            } else if(append === '3') { // After
                handleCaptionUpdate(datasetImage.caption + ', ' + interrogate);
            }
            setBusy(false);
        });
    }


    useEffect(() => {
        displayResizeButton();

        // Add arrow keys as a scrolling method
        const handleKeyPress = (event) => {
            const key = event.keyCode;
            if(key === 37) {
                handleIndexChange(dataset.index + 1 - 1);
            }
            if(key === 39) {
                handleIndexChange(dataset.index + 1 + 1);
            }
        }

        document.addEventListener('keydown', handleKeyPress);

        return function cleanup() {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('datasetPath', datasetPath);
    }, [datasetPath]);

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
                                <HFlex justifyContent='space-between' mb={1}>
                                    <Text color='black' mb='2px' ml='2px' fontSize='sm'>{(tagMode) ? 'Tags' : 'Caption'}</Text>
                                </HFlex>
                                {
                                    (tagMode) ?
                                        <HFlex flexWrap='wrap' gap={1}>
                                            {
                                                (() => {
                                                    const tags = handleTagOptions(datasetImage.caption.split(',').map(val => val.trim()));
                                                    const dupes = tags.filter((t, i) => tags.indexOf(t) !== i);

                                                    const tagBackground = (tag) => {
                                                        if(dupes.some(v => v === tag)) {
                                                            return 'red.200';
                                                        }
                                                        if(!(tag in dataset.available_tags)) {
                                                            return 'green.200';
                                                        }
                                                        return 'white';
                                                    };

                                                    const onClick = (index) => {
                                                        handleCaptionUpdate(tags.filter((v, i) => i !== index).join(', '));
                                                    }

                                                    return tags.map((val, index) => <Tag key={'image-' + val} cursor='pointer' bg={tagBackground(val)} name={val} onClick={() => onClick(index)} disabled/>);
                                                })()
                                            }
                                        </HFlex>
                                        :
                                        <Textarea bg='white' color='black' fontSize='sm' placeholder='No caption found...' value={datasetImage.caption} onChange={(e) => handleCaptionUpdate(e.target.value)} disabled={(busy) ? true : ''} />
                                }
                            </BVFlex>
                            {
                                (!recommend) ?
                                    <BVFlex flexGrow={0} bg='white'>
                                        <HFlex justifyContent='space-between' mb={1}>
                                            <Text color='black' mb='2px' ml='2px' fontSize='sm'>{(tagMode) ? 'Suggested Tags' : 'Caption'}</Text>
                                            <Button flexGrow={0}>X</Button>
                                        </HFlex>
                                        <HFlex>
                                            {
                                                (tagMode) ?
                                                    <HFlex flexWrap='wrap' gap={1}>
                                                        {recommend.map((val, index) => <Tag key={'suggested-' + val} cursor='pointer' name={val} onClick='' disabled/>)}
                                                    </HFlex>
                                                    :
                                                    <Text>{recommend}</Text>
                                            }
                                        </HFlex>
                                    </BVFlex>
                                    :
                                    <></>
                            }
                            {
                                (() => {
                                    if(tagMode) {
                                        let activeTags = datasetImage.caption.split(',').map(val => val.trim());
                                        return (
                                            <TagSearch enabledTags={activeTags}
                                               tags={dataset.available_tags}
                                               onChange={(tags) => handleCaptionUpdate(tags.join(', '))}
                                               tagsPerPage={tagsToDisplay}
                                               showTagCounts={showTagCounts}
                                               sortMode={sortMode} />
                                        )
                                    } else {
                                        return <></>
                                    }
                                })()
                            }
                            <BVFlex flexGrow={0} bg='white'>
                                <Text color='black' ml={2} mb={0}>Interrogate</Text>
                                <HFlex gap={5} p={2}>
                                    <VFlex gap={2}>
                                        <BVFlex p={3}>
                                            <Text color='black' mb={2} fontSize='sm'>Threshold: {threshold}</Text>
                                            <Slider flexGrow={1} onChange={(val) => setThreshold(val)} value={threshold} min={0} step={0.01} max={1}>
                                                <SliderTrack>
                                                <SliderFilledTrack />
                                                </SliderTrack>
                                                <SliderThumb />
                                            </Slider>
                                        </BVFlex>
                                        <BVFlex p={3}>
                                            <Text color='black' mb={2} fontSize='sm'>Append Options</Text>
                                            <RadioGroup display='flex' gap={3} color='black' size='sm' value={append} onChange={setAppend}>
                                                <Radio value='0'>Recommend</Radio>
                                                <Radio value='1'>Replace</Radio>
                                                <Radio value='2'>Before</Radio>
                                                <Radio value='3'>After</Radio>
                                            </RadioGroup>
                                        </BVFlex>
                                    </VFlex>
                                    <Button colorScheme='blue' h='100%' onClick={handleInterrogate} isLoading={busy}>Interrogate</Button>
                                </HFlex>
                            </BVFlex>
                            <BVFlex flexGrow={0} bg='white'>
                                <Text color='black' ml={2} mb={0}>Settings</Text>
                                <VFlex p={2}>
                                    <VFlex gap={1} w='25%'>
                                        <HStack>
                                            <Text color='black' mb='1px' fontSize='sm' title='Activates tag mode which makes it easier to caption images with buttons'>Tag Mode</Text>
                                            <Switch onChange={(e) => setTagMode(e.currentTarget.checked)}/>
                                        </HStack>
                                        <HStack>
                                            <Text color='black' mb='1px' fontSize='sm' title='Save the caption when the image changes'>Auto Save</Text>
                                            <Switch onChange={(e) => setAutoSave(e.currentTarget.checked)}/>
                                        </HStack>
                                        {
                                            (tagMode) ?
                                                <>
                                                    <HStack>
                                                        <Text color='black' mb='1px' fontSize='sm' title='Show the number of occurances beside the tag'>Tag Counts</Text>
                                                        <Switch onChange={(e) => setShowTagCounts(e.currentTarget.checked)}/>
                                                    </HStack>
                                                    <HStack>
                                                        <Text color='black' mb='1px' fontSize='sm' title='Replaces spaces with underscores and makes tags lowercase'>Format Tags</Text>
                                                        <Switch onChange={(e) => setFormatTags(e.currentTarget.checked)}/>
                                                    </HStack>
                                                    <HStack>
                                                        <Text color='black' mb='1px' fontSize='sm' title='If the image tags should be sorted as well'>Sort Image Tags</Text>
                                                        <Switch onChange={(e) => setSortTags(e.currentTarget.checked)}/>
                                                    </HStack>
                                                    <HStack gap={0}>
                                                        <Text color='black' mb='1px' fontSize='sm' w='140px' title='Controls how the tags should be sorted'>Sorting Mode</Text>
                                                        <Select color='black' size='xs' onChange={(e) => setSortMode(e.target.value)} value={sortMode}>
                                                            <option value='0'>No Sorting</option>
                                                            <option value='1'>Alphanumeric</option>
                                                            <option value='2'>Tag count</option>
                                                        </Select>
                                                    </HStack>
                                                    <HStack>
                                                        <Text color='black' mb='1px' fontSize='sm' title='The amount of tags to display per page'>Tags Per Page</Text>
                                                        <NumberInput color='black' maxW='65px' size='xs' min={1} max={999} value={tagsToDisplay} onChange={(val) => setTagsToDisplay(val)} allowMouseWheel>
                                                            <NumberInputField/>
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper/>
                                                                <NumberDecrementStepper/>
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                    </HStack>
                                                </>
                                                :
                                                <></>
                                        }
                                    </VFlex>

                                </VFlex>

                            </BVFlex>
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
                            <Button colorScheme='blue' h onClick={() => handleCaptionSave(dataset.index, datasetImage.caption)}>Save Caption</Button>
                        </VFlex>
                    </HFlex>
                </VFlex>
            </Box>
        </>
    );
}