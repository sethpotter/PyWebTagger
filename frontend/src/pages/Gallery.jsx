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
import data from "bootstrap/js/src/dom/data";



export const Gallery = (props) => {

    const {dataset, setIndex} = props;

    const [images, setImages] = useState([]);
    const [hovered, setHovered] = useState(-1);
    const [range, setRange] = useState([]);

    const [requests, setRequests] = useState([]);

    const [imageBuffer] = useState({range: [0,0], images: []});

    const loadDatasetImages = (start, end) => {

        // Pass range to the image buffer
        imageBuffer.range = [start, end];

        const futureRequests = [];
        const promises = [];

        for(let i = start; i < end; i++) {
            const exists = requests.some(v => v.index === i) || images.some(v => v.index === i);
            if(!exists) {
                const promise = load_image(i);
                futureRequests.push({index: i, request: promise});
                promises.push(promise);
                console.log("Loading: " + (i));
            }
        }

        const rangePredicate = (index) => (index >= start && index <= end);
        let staleRequests = requests.filter(req => !rangePredicate(req.index));
        let filteredRequests = requests.filter(req => !staleRequests.includes(req));

        if(staleRequests.length > 0)
            console.log(staleRequests);

        for(let req of staleRequests) {
            cancel_dataset_request(req.index);
        }

        setRequests([...filteredRequests, ...futureRequests]);

        //filterImages();

        console.log(requests);
        console.log(imageBuffer);

        if(promises.length === 0)
            return;

        Promise.all(promises).then(results => {
            console.log("Promise CHUNK: " + results.length);
            const filteredResults = results.filter(r => r);
            imageBuffer.images = imageBuffer.images.concat(filteredResults);
            console.log(imageBuffer);
            /*setImages(prevImages => {
                //console.log(prevImages);
                console.log(results);

                //console.log(fin)
                //console.log(prevImages.length + "+" + results.length + "=" + (prevImages.length + results.length));
                return [...prevImages, ...filteredResults];
            });*/
        }).catch(err => {
            /*setRequests(prevRequests => {
                return prevRequests;
            });*/
            console.error(err);
        });
    }

    useEffect(() => {
        // Dataset is not loaded yet.
        if(dataset.num_files <= 0)
            return;

        loadDatasetImages(range[0] - 1, range[1]);
    }, [dataset, range]);

    useEffect(() => {

        const interval = setInterval(() => filterImages(), 250);

        return function cleanup() {
            clearInterval(interval);
            console.log("Cleanup!");
        }

    }, []);

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

    const handleSliderMove = () => {

    }

    return (
        <HFlex>
            <VFlex maxWidth='80%'>
                <BVFlex justifyContent='center' alignItems='center'>
                    <Text>Showing images from {range[0]}-{range[1]} images: {images.length} buffer: {imageBuffer.images.length} expected: {range[1] - range[0]} total: {dataset.num_files}</Text>
                    <HFlex w='100%'>
                        <RangeSlider aria-label={['min', 'max']} min={2} max={dataset.num_files+1} defaultValue={[1, 10]} onChange={(v) => setRange([v[0]-1, v[1]-1])}>
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
                            <VFlex flexGrow={1}>
                                <BHFlex w='200px' h='200px' justifyContent='center' onMouseOver={(e) => handleMouseOver(e, i)}>
                                    <Image h='100%' src={datasetImage.image}></Image>
                                </BHFlex>
                            </VFlex>
                        );
                    })
                }
                </BHFlex>
            </VFlex>
            <VFlex maxWidth='20%'>
                {
                    (hovered >= 0) ?
                        <BVFlex>

                        </BVFlex>
                        :
                        <></>
                }
            </VFlex>
        </HFlex>
    );
}