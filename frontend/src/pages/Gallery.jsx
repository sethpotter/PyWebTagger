import React, {useEffect, useState} from 'react';
import {BHFlex, BVFlex, HFlex, VFlex} from "../components/WrappedChakra";
import {cancel_dataset_request, load_image} from "../api/DatasetRoutes";

import {Box, Button, Flex, Image, Text} from '@chakra-ui/react'

import {
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'

import data from "bootstrap/js/src/dom/data";



export const Gallery = (props) => {

    const {dataset, setIndex} = props;

    const [images, setImages] = useState([]);
    const [hovered, setHovered] = useState(-1);
    const [range, setRange] = useState([]);
    const [requests, setRequests] = useState([]);

    const [imageBuffer] = useState({range: [0,0], images: []});
    
    const [imagePreview, setImagePreview] = useState({});

    const loadDatasetImages = (start, end) => {

        // Pass range to the image buffer
        imageBuffer.range = [start, end];

        const futureRequests = [];
        const promises = [];

        for(let i = start; i < end + 1; i++) {
            const exists = requests.some(v => v.index === i) || images.some(v => v.index === i);
            if(!exists) {
                const promise = load_image(i);
                futureRequests.push({index: i, request: promise});
                promises.push(promise);
                //console.log("Loading: " + (i));
            }
        }

        const rangePredicate = (index) => (index >= start && index <= end);
        let staleRequests = requests.filter(req => !rangePredicate(req.index));
        let filteredRequests = requests.filter(req => !staleRequests.includes(req));

        for(let req of staleRequests) {
            cancel_dataset_request(req.index);
        }

        setRequests([...filteredRequests, ...futureRequests]);

        //filterImages();

        //console.log(requests);
        //console.log(imageBuffer);

        if(promises.length === 0)
            return;

        Promise.all(promises).then(results => {
            //console.log("Loading CHUNK: " + results.length);
            const filteredResults = results.filter(r => r);
            imageBuffer.images = imageBuffer.images.concat(filteredResults);
        }).catch(err => {
            /*setRequests(prevRequests => {
                return prevRequests;
            });*/
            //console.error(err);
        });
    }

    useEffect(() => {
        // Dataset is not loaded yet.
        if(dataset.num_files <= 0)
            return;

        loadDatasetImages(range[0] - 1, range[1] - 1);
    }, [dataset, range]);

    useEffect(() => {

        const interval = setInterval(() => {
            if(!imagePreview.image) {
                const imageBufferChanged = images !== imageBuffer.images;
                if(imageBuffer.images.length > 0 && imageBufferChanged)
                    filterImages()
            }
        }, 250);

        return function cleanup() {
            clearInterval(interval);
            console.log("Cleanup!");
        }

        // TODO Horrible way of dealing with images hook.
    }, [images]);

    const filterImages = () => {
        const rangePredicate = (index) => (index >= imageBuffer.range[0] && index <= imageBuffer.range[1]);
        imageBuffer.images = imageBuffer.images.filter(img => rangePredicate(img.index));
        imageBuffer.images = imageBuffer.images.sort((a, b) => a.index - b.index);
        setImages(imageBuffer.images);
    }

    const handleMouseOver = (e, index) => {
        e.stopPropagation();
        setHovered(index);
    }



    const ImageModal = (props) => {

        const { modalOpen } = props;
        const { isOpen, onOpen, onClose } = useDisclosure()

        return (
            <Modal size='xl' isOpen={modalOpen} onClose={() => setImagePreview({})}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalBody>
                        <Image src={imagePreview.image}></Image>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <>
            <ImageModal modalOpen={imagePreview.image}/>
            <HFlex>
                <VFlex maxWidth='80%'>
                    <BVFlex justifyContent='center' alignItems='center'>
                        <Text>Showing Images from {range[0]}-{range[1]} images: {images.length} buffer: {imageBuffer.images.length} requests: {requests.length} total: {dataset.num_files}</Text>
                        <HFlex w='100%'>
                            <RangeSlider aria-label={['min', 'max']} min={2} max={(dataset.num_files > 0) ? dataset.num_files + 1 : 10} defaultValue={[1, 10]} onChange={(v) => setRange([v[0]-1, v[1]-1])}>
                                <RangeSliderTrack>
                                    <RangeSliderFilledTrack/>
                                </RangeSliderTrack>
                                <RangeSliderThumb index={0}/>
                                <RangeSliderThumb index={1}/>
                            </RangeSlider>
                        </HFlex>
                    </BVFlex>
                    <BHFlex flexWrap='wrap' gap={2}>
                    {
                        images.map((datasetImage, i) => {
                            return (
                                <VFlex position='relative' alignItems='center' justifyContent='center' onMouseOver={(e) => handleMouseOver(e, i)} onClick={() => setImagePreview(datasetImage)}>
                                    <BHFlex width='200px' height='200px' alignItems='center' justifyContent='center'>
                                        <Image maxHeight='100%' src={datasetImage.image}></Image>
                                    </BHFlex>
                                </VFlex>
                            );
                        })
                    }
                    </BHFlex>
                </VFlex>
                <VFlex maxWidth='20%'>
                    {
                        (hovered >= 0 && images[hovered]) ?
                            <BVFlex>
                                <Text>{images[hovered].index}</Text>
                                <Text>{images[hovered].path}</Text>
                                <Text>{images[hovered].caption}</Text>
                            </BVFlex>
                            :
                            <></>
                    }
                </VFlex>
            </HFlex>
        </>

    );
}