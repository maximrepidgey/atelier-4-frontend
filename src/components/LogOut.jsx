import React from 'react';
import '../css/App.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class LogOut extends React.Component {
    /**
     * Calls this.props.logOut
     */
    componentDidMount() {
        this.props.logOut(0);
    }

    /**
     * Empty page, only used for a better and faster implementation/fix of the logout
     */
    render() {
        return (
          <span>
            <ColorCircularProgress className="loading-spinner" />
          </span>
        );
    }
}

export default LogOut;
