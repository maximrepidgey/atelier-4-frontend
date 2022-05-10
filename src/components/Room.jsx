import React from 'react';
import '../css/App.css';
import DevicesPanel from './devices/DevicesPanel';

/**
 * Placeholder page for the whole devices dashboard components pages
 */
class Room extends React.Component {
    render() {
        return (
          <DevicesPanel />
        );
    }
}

export default Room;
