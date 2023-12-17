import React, {useEffect, useState} from 'react';


import {Tabs, TabList, TabPanels, Tab, TabPanel, Text, Input, Button} from '@chakra-ui/react';

import {Editor} from "./Editor";
import {Gallery} from "./Gallery";
import {Dataset} from "../models/Dataset";
import {load_dataset} from "../api/DatasetRoutes";
import {BHFlex, HFlex, VFlex} from "../components/WrappedChakra";

export const WebTagger = (props) => {

    const [dataset, setDataset] = useState(new Dataset(0, '', 0, {}));
    const [datasetPath, setDatasetPath] = useState(() => {
        const stored = localStorage.getItem('datasetPath');
        return (stored === undefined) ? '' : localStorage.getItem('datasetPath');
    });

    const handleSetDataset = () => {
        load_dataset(datasetPath).then((data) => {
            console.log("Loaded new dataset with " + dataset.num_files + " files");
            setDataset(data);
        });
    }

    const handleIndexChange = (index) => {
        if(isNaN(index)) {
            return;
        }

        if(index > dataset.num_files - 1) {
            index = dataset.num_files - 1;
        }
        if(index < 0) {
            index = 0;
        }

        setDataset(new Dataset(index, dataset.path, dataset.num_files, dataset.available_tags));
    }

    useEffect(() => {
        localStorage.setItem('datasetPath', datasetPath);
    }, [datasetPath]);

    return (
        <VFlex>
            <BHFlex gap={3}>
                <VFlex>
                    <Text color='black' mb='1px' ml='10px' fontSize='sm'>Path to Dataset</Text>
                    <BHFlex p={3}>
                        <Input bg='white' color='black' placeholder='...' value={datasetPath} onChange={(e) => setDatasetPath(e.target.value)} />
                    </BHFlex>
                </VFlex>
                <Button colorScheme='blue' h onClick={() => handleSetDataset()}>Process</Button>
            </BHFlex>
            <Tabs>
                <TabList>
                    <Tab>Editor</Tab>
                    <Tab>Gallery</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Editor dataset={dataset} setIndex={handleIndexChange} />
                    </TabPanel>
                    <TabPanel>
                        <Gallery/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VFlex>
    );
}