import React, {useEffect, useState} from 'react';
import {BHFlex} from "../components/WrappedChakra";
import {load_image} from "../api/DatasetRoutes";

import {Box, Image} from '@chakra-ui/react'

export const Gallery = (props) => {

    const {dataset, setIndex} = props;

    const [images, setImages] = useState([]);

    const loadDatasetImages = (index, amount) => {

        const promises = [];

        for(let i = 0; i < amount; i++) {
            promises.push(load_image(index + i));
        }

        Promise.all(promises).then(results => {
            console.log(results);
            setImages(results);
        }).catch(err => {
            console.error(err);
        });
    }

    useEffect(() => {
        // Dataset is not loaded yet.
        if(dataset.num_files <= 0)
            return;

        const amount = Math.min(10, dataset.num_files);

        // Don't keep loading images we already have.
        if(!images)
            loadDatasetImages(dataset.index, amount);
    }, [dataset]);

    return (
        <BHFlex flexWrap='wrap'>
            {
                images.map(datasetImage => {
                    return (
                        <Box w='200px' h='200px'>
                            <Image h='100%' src={datasetImage.image}></Image>
                        </Box>
                    );
                })
            }
        </BHFlex>
    );
}