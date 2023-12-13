const applyDefaultProps = (components, props) => {
    components.forEach((com) => com.defaultProps = props);
}

const applyFlexGrowProp = (components) => {
    const props = {
        flexGrow: 1
    };
    applyDefaultProps(components, props);
}

export {
    applyDefaultProps,
    applyFlexGrowProp
}