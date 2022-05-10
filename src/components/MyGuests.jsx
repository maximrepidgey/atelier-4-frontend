import React from 'react';
import '../css/App.css';
import '../css/house.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class MyGuests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            guests: <div className="message-two-lines center-text">
              <span>
                <ColorCircularProgress
                  className="loading-spinner"
                />
              </span>

            </div>,
            guestToDelete: '',
            isLoading: false,
            error: false,
            errorType: '',
            allowSecurityCameras: false,
        };
    }

    /**
     * Fetches GET request to /shared/ and if succesfull sets the answer into this.state.shared
     * Fetches GET request to /user/ and if successful sets the value of allowSecurityCamers into the state
     * If any of the fetches is unsuccessful, it display an error message
     */
    componentDidMount() {
        fetch('http://localhost:8080/guests/', {
            method: 'GET',
            headers: {
                user: this.props.username,
                'session-token': this.props.session_token,
            },
        })
        .then((res) => {
            if (res.status === 401) {
                this.props.logOut(1);
            } else if (res.status === 200) {
                return res.text();
            } else {
                return null;
            }
        })
        .then((data) => {
            const response = JSON.parse(data);

            if (response === null) {
                this.setState({ guests: <span className="error-message">An error has occurred.</span> });
            } else if (response.length === 0) {
                this.setState({
                    guests: <p><b>You haven't authorized any guest yet. Click on the + button to authorize one.</b></p>,
                });
            } else {
                this.mapGuests(response);
            }
        })
        .catch((e) => this.setState({ guests: <span className="error-message">An error has occurred.</span> }));

        fetch(`http://localhost:8080/user/${this.props.username}`, {
            method: 'GET',
            headers: {
                user: this.props.username,
                'session-token': this.props.session_token,
            },
        })
        .then((res) => {
            if (res.status === 401) {
                this.props.logOut(1);
            } else if (res.status === 200) {
                return res.text();
            } else {
                return null;
            }
        })
        .then((data) => {
            const response = JSON.parse(data);

            if (response === null) {
                this.setState({ guests: <span className="error-message">An error has occurred.</span> });
            } else {
                this.setState({ allowSecurityCameras: response.allowSecurityCameras });
            }
        })
        .catch((e) => this.setState({ guests: <span className="error-message">An error has occurred.</span> }));
    }

    /**
     * Maps the received array of shared and sets it as this.state.shared. If no shared are available, this.state.shared gets changed with a specific phrase.
     * @param {user array} guests: array of shared
     */
    mapGuests = (guests) => {
        if (guests.length === 0) {
            this.setState({
                guests: <p><b>You haven't authorized any guest yet. Click on the + button to authorize one.</b></p>,
            });
        } else {
            let i = 0;
            const toSet = guests.map((guest) => (
              <div key={i++} className="row room">
                <div className="col l1 image vertical-center">{guest.username}</div>
                <div className="col l2 vertical-center" />
                <div className="col l3 vertical-center"><i>{guest.email}</i></div>
                <div className="col l2 vertical-center" />
                <div className="col l1 room-button1 vertical-center">
                  <i
                    className="material-icons btn-edit"
                    onClick={() => this.moveToDeletion(guest.username)}
                  >
                    {' '}
                    highlight_off
                  </i>
                </div>
                <div className="col l1 room-button2 vertical-center" />
              </div>
              ));
            this.setState({ guests: toSet });
        }
    }

    /**
     * Changes the display view to show confirmation of the deletion of the selected user
     * @param {user array} guestUsername: username of the guest to delete
     */
    moveToDeletion = (guestUsername) => {
        this.setState({ guestToDelete: guestUsername });
        document.getElementById('guestList').hidden = true;
        document.getElementById('deleteGuestConfirmation').hidden = false;
    }

    /**
     * Changes the display view to the list of shared
     */
    moveToGuestList = () => {
        this.setState({ guestToDelete: '' });
        document.getElementById('guestList').hidden = false;
        document.getElementById('deleteGuestConfirmation').hidden = true;
    }

    /**
     * Changes this.state.allowSecurityCamera value and then
     * fetches it thorugh a PUT request to /user/:username with this.props.username
     */
    changeSecurityCameraPermissions = () => {
        const toSet = !this.state.allowSecurityCameras;
        this.setState({ allowSecurityCameras: toSet })
        fetch(`http://localhost:8080/user/${this.props.username}`, {
            method: 'PUT',
            headers: {
                user: this.props.username,
                'session-token': this.props.session_token,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ allowSecurityCameras: toSet }),
        })
        .then((res) => {
            // console.log(res)
        })
        .catch((e) => {
            console.log(e);
        });
    }

    /**
     * Fetches a DELETE request to /shared/:username with the username of the Guest to delete
     * If successfull, calls this.moveToGuestList and reloads the page in order to receive the updated list of shared
     * If unsuccessfull, changes the value of this.state.error
     */
    deleteGuest = () => {
        this.setState({ isLoading: true, error: false });
        fetch(`http://localhost:8080/guests/${this.state.guestToDelete}`, {
            method: 'DELETE',
            headers: {
                user: this.props.username,
                'session-token': this.props.session_token,
            },
        })
        .then((res) => {
            this.setState({ isLoading: false });
            if (res.status === 204) {
                this.moveToGuestList();
                window.location.href = '/guests';
            } else if (res.status === 401) {
                this.props.logOut(1);
            } else {
                this.setState({ error: true });
                return res.json();
            }
            return null;
        })
        .then((data) => {
            if (data !== null) this.setState({ errorType: data.message });
        })
        .catch((e) => {
            this.setState({ isLoading: false });
            this.setState({ error: true, errorType: e.toString() });
        });
    }

    /**
     * Returns HTML with error message to display based on this.state.error
     */
    showError = () => {
         if (this.state.error) {
            return (<span className="error-message">{this.state.errorType}</span>);
        }
    }

    /**
     * Renders the list of shared
     */
    render() {
        return (
          <div className="container">
            <div id="guestList" className="rooms-content-box z-depth-2">
              <div className="headline-box row row-collapsible row row-collapsible-custom">
                <h2 className="col l11 left-align headline-title">My guests</h2>
                <a href="/addGuest">
                  <i
                    className="col col-custom l1 btn waves-effect waves-light btn-primary-circular right material-icons"
                  >
                    add
                  </i>

                </a>
              </div>
              <div className="switch">
                <label>
                  <span>Allow access to security cameras:</span>
                  <input
                    type="checkbox"
                    checked={this.state.allowSecurityCameras}
                    onChange={() => this.changeSecurityCameraPermissions()}
                  />
                  <span className="lever" />
                </label>
              </div>

              <div className="row rooms-headline">
                <div className="col l1" />
                <div className="col l5">Username</div>
                <div className="col l4">Email</div>
              </div>
              {this.state.guests}
            </div>

            <div hidden id="deleteGuestConfirmation" className="content-box">
              <h2 className="title">Are you sure that you want to remove this guest?</h2>
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
                onClick={this.moveToGuestList}
              >
                No
              </button>
              <button
                type="button"
                name="button"
                className="Handle-btn-primary btn waves-effect waves-light"
                onClick={this.deleteGuest}
              >
                Yes
              </button>
            </div>
          </div>
        );
    }
}


export default MyGuests;
