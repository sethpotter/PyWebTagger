import React, {useEffect, useRef, useState} from 'react';


import {Tabs, TabList, TabPanels, Tab, TabPanel, Text, Input, Button, Icon, Flex} from '@chakra-ui/react';

import {Editor} from "./Editor";
import {Gallery} from "./Gallery";
import {Dataset} from "../models/Dataset";
import {load_dataset} from "../api/DatasetRoutes";
import {BHFlex, HFlex, VFlex} from "../components/WrappedChakra";
import {GoFileDirectory} from "react-icons/go";
import {Hierarchy} from "./Hierarchy";


export const WebTagger = (props) => {

    const [dataset, setDataset] = useState(new Dataset(0, '', [], 0, {}));
    const [datasetPath, setDatasetPath] = useState(() => {
        const stored = localStorage.getItem('datasetPath');
        return (stored === undefined) ? '' : localStorage.getItem('datasetPath');
    });

    const [tabIndex, setTabIndex] = useState(0);

    const fileInput = useRef(null);

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

        setDataset(new Dataset(index, dataset.path, dataset.files, dataset.num_files, dataset.available_tags));
    }

    useEffect(() => {
        localStorage.setItem('datasetPath', datasetPath);
    }, [datasetPath]);

    return (
        <VFlex>
            <BHFlex gap={3}>
                <VFlex>
                    <Text color='black' mb='1px' ml='10px' fontSize='sm'>Path to Dataset</Text>
                    <BHFlex p={3} alignItems='center' gap={2}>
                        <Input bg='white' color='black' placeholder='...' value={datasetPath} onChange={(e) => setDatasetPath(e.target.value)} />
                        <Flex flexGrow={0}>
                            {/*<Input directory='' webkitdirectory='' type='file' ref={fileInput} display='none' onChange={(e) => console.log(e.target.files)}/>
                            <Button flexGrow={0} px={0} minHeight='10px' variant='ghost' size='sm' color='gray.500' onClick={() => fileInput.current.click()}>
                                <Icon color='gray.600' as={GoFileDirectory} w='25px' h='25px'/>
                            </Button>*/}
                        </Flex>

                    </BHFlex>
                </VFlex>
                <Button colorScheme='blue' h onClick={() => handleSetDataset()}>Process</Button>
            </BHFlex>
            <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
                <TabList>
                    {/*<Tab>Hierarchy</Tab>*/}
                    <Tab>Editor</Tab>
                    <Tab>Gallery</Tab>
                </TabList>
                <TabPanels>
                    {/*<TabPanel>
                        <Hierarchy dataset={dataset} setIndex={handleIndexChange} setTabIndex={setTabIndex}/>
                    </TabPanel>*/}
                    <TabPanel>
                        <Editor dataset={dataset} setIndex={handleIndexChange} setTabIndex={setTabIndex}/>
                    </TabPanel>
                    <TabPanel>
                        <Gallery dataset={dataset} setIndex={handleIndexChange} setTabIndex={setTabIndex}/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VFlex>
    );
}