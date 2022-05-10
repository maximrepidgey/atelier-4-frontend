import React from 'react';
import '../css/App.css';
import '../css/house.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class AddGuest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      guestUsername: '',
      error: -1, // -1 nothing, 0 no guest username, 1 guest = this user, 2 everything else
      errorType: '',
    };
  }

  /**
   * Adds an event listener to call sendDatas when key "Enter" is pressed
   */
  componentDidMount() {
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') this.sendDatas(evt);
    });
  }

  // Input Handler
  handleGuestUsernameChange = (evt) => {
    this.setState({ guestUsername: evt.target.value });
  }

  // Redirection to /guests
  redirectToGuests = () => {
    window.location.href = '/guests';
  }

  /**
   * Fetches a POST request with this.state.guestUsername if it's not empty,
   * otherwise it sets this.state.error to 0
   */
  sendDatas = (evt) => {
    evt.preventDefault();

    if (this.state.guestUsername === '') {
      this.setState({ error: 0 });
    } else if (this.state.guestUsername === this.props.username) {
      this.setState({ error: 1 });
    } else {
      this.setState({ isLoading: true, error: -1 });
      fetch('http://localhost:8080/guests/', {
        method: 'POST',
        headers: {
          user: this.props.username,
          'session-token': this.props.session_token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: this.state.guestUsername,
      })
      .then((res) => {
        this.setState({ isLoading: false });
        if (res.status === 201) {
          this.redirectToGuests();
        } else if (res.status === 401) {
          this.props.logOut(1);
        } else {
          this.setState({ error: 2 });
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data !== null) this.setState({ errorType: data.message });
      })
      .catch((e) => this.setState({ isLoading: false, error: 2, errorType: e.toString() }));
    }
  }

  /**
   * Returns HTML with error message to display based on this.state.error
   */
  showError = () => {
    if (this.state.error === 0) {
      return (<span className="error-message">Please fill the guest's username or email</span>);
    }
    if (this.state.error === 1) {
      return (<span className="error-message">You cannot add yourself as guest</span>);
    }
    if (this.state.error === 2) {
      return (<span className="error-message">{this.state.errorType}</span>);
    }
  }

  /**
   * Renders the input for adding a new Guest
   */
  render() {
    return (
      <div className="container">
        <div className="rooms-content-box z-depth-2">
          <div className="headline-box row row-collapsible row row-collapsible-custom">
            <h2 className="col l11 left-align headline-title">Add guest</h2>
          </div>
          <div className="textFields">
            <input
              type="text"
              name="guestUsername"
              value={this.state.guestUsername}
              placeholder="Insert Guest Username"
              onChange={this.handleGuestUsernameChange}
              required
            />
          </div>

          <div className="message-two-lines center-text">
            <span>
              <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
            </span>
            {this.showError()}
          </div>
          <button
            type="button"
            name="button"
            className="btn-secondary btn waves-effect waves-light"
            onClick={this.redirectToGuests}
          >
            Cancel
          </button>
          <button
            type="button"
            name="button"
            className="Handle-btn-primary btn waves-effect waves-light"
            onClick={this.sendDatas}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}


export default AddGuest;
