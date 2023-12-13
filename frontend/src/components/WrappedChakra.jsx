import {Input, Stack, HStack, VStack, Box, Text, Button, Flex, Container, Spacer} from '@chakra-ui/react'

const wrapComponent = (Component, defaultProps) => ({children, ...props}) => {
    return (
        <Component {...defaultProps} {...props}>
            {children}
        </Component>
    );
}

const VFlex = wrapComponent(Flex, {
    direction: 'column'
});

const HFlex = wrapComponent(Flex, {
    direction: 'row'
});

const BVFlex = wrapComponent(Flex, {
    direction: 'column',
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 5,
    p: 2
});

const BHFlex = wrapComponent(Flex, {
    direction: 'row',
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 5,
    p: 2
});

export {
    VFlex,
    HFlex,
    BVFlex,
    BHFlex
}