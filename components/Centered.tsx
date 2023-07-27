import React from "react";

/**
 * Component that centers its children on the page (vertical and horizontal)
 * @param props The child or children
 * @constructor
 */
export default function Centered(props: {children: JSX.Element | Array<JSX.Element>}): JSX.Element {
    return (
        <div style={{
            display: 'grid',
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
            placeItems: 'center',
            position: 'absolute',
        }}>
            {props.children}
        </div>
    )
}