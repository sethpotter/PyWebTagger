import {extendTheme, withDefaultProps} from '@chakra-ui/react'

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false
}

const colors = {
}

const theme = extendTheme({
    config,
    colors
})

export default theme;