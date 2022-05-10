import React from 'react';
import '../css/App.css';
import ScenesFactory from './scenes/ScenesFactory';


/**
 * Placeholder page for the scenes dashboard components pages
 */
class AddScene extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: props.username,
            session_token: props.session_token,
        };
    }

    render() {
        return (
          <ScenesFactory />
        );
    }
}

export default AddScene;
