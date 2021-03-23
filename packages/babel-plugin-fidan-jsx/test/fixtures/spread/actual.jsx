const Component = (props, children) => {
    return <li id={props.name}>{ children}</li>
}

const LiComponent1 = _props => <li onClick={() => alert(1)} {..._props}>{_props.children}</li>;
const LiComponent2 = (_props, children) => <Component {..._props}>{children}</Component>;
