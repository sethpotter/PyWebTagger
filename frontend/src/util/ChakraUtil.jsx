const appendDefaultProps = (components, props) => {
    components.forEach((com) => com.defaultProps = {
        ...com.defaultProps,
        ...props
    });
}

export {
    appendDefaultProps
}