import React from 'react';
import '../css/App.css';
import AutomationsFactory from './automation/AutomationsFactory';


/**
 * Placeholder page for the scenes dashboard components pages
 */
class AddAutomation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      session_token: props.session_token,
    };
  }

  render() {
    return (
      <AutomationsFactory />
    );
  }
}

export default AddAutomation;
