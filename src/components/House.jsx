import React from 'react';
import '../css/App.css';
import '../css/house.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class House extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: <div className="message-two-lines center-text">
              <span>
                <ColorCircularProgress
                  className="loading-spinner"
                />
              </span>

                   </div>,
        };
    }

    /**
     * Fetches GET request to /rooms/ and
     * if successful sets the response into this.state.rooms
     * otherwise displays an error message
     */
    componentDidMount() {
        fetch('http://localhost:8080/rooms/', {
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
                this.setState({ rooms: <span className="error-message">An error has occurred.</span> });
            } else if (response.length === 0) {
                this.setState({
                    rooms: <p>You haven't added any rooms yet. Please add a new one.</p>,
                });
            } else {
                this.mapRooms(response.sort(this.sortRooms));
            }
        })
        .catch((e) => this.setState({ rooms: <span className="error-message">An error has occurred.</span> }));
    }

    /**
     * Sorts the two rooms
     * @param {room} a
     * @param {room} b
     * @return {number} -1 if a should be before b, 1 otherwise
     */
    sortRooms = (a, b) => {
        const keyA = a.name.toLowerCase();
        const keyB = b.name.toLowerCase();
        if (keyA === keyB) {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
        }
        if (keyA < keyB) return -1;
        return 1;
    }

    /**
     * Maps the received array of rooms and sets it as this.state.rooms.
     * If no rooms are available, this.state.rooms gets changed with a specific phrase.
     * @param {room array} rooms: array of rooms
     */
    mapRooms = (rooms) => {
        if (rooms.length === 0) {
            this.setState({ rooms: <p>You have created no rooms yet. Click on the + button to add one.</p> });
        } else {
            let i = 0;
            const toSet = rooms.map((room) => (
              <div key={i++} className="row room">
                <div className="col l1 image vertical-center"><img src={room.icon} alt="device-logo" /></div>
                <div className="col l5 vertical-center">{room.name}</div>
                <div className="col l2 vertical-center center-text">{room.devices.length}</div>
                <div className="col l2" />
                <div className="col l1 room-button1 vertical-center">
                  <i
                    className="material-icons btn-icon btn-edit"
                    onClick={() => this.redirectToEditRoom(room.id)}
                  >
                    edit
                  </i>
                </div>
                <div className="col l1 room-button2 vertical-center">
                  <i
                    className="material-icons btn-icon btn-edit"
                    onClick={() => this.redirectToRoom(room.id)}
                  >
                    visibility_outlined
                  </i>
                </div>
              </div>
              ));
            this.setState({ rooms: toSet });
        }
    }

    /**
     * Redirection to /room
    */
    redirectToRoom = (roomID) => {
        window.location.href = `/room?id=${roomID}`;
    }

    /**
     * Redirection to /editRoom
    */
    redirectToEditRoom = (roomID) => {
        window.location.href = `/editRoom?id=${roomID}`;
    }

    /**
     * Renders the list of rooms
     */
    render() {
        return (
          <div className="container">
            <div className="rooms-content-box z-depth-2">
              <div className="headline-box row row-custom">
                <h2 className="col col-scene l8 left-align headline-title">My Rooms</h2>
                <a href="/addRoom">
                  <i
                    className="col col-custom l1 btn waves-effect waves-light btn-primary-circular right material-icons"
                  >
                    add
                  </i>

                </a>
              </div>

              <div className="row rooms-headline">
                <div className="col l1" />
                <div className="col l5">Name</div>
                <div className="col l2 center-text">Devices</div>
                <div className="col l4" />
              </div>
              {this.state.rooms}
            </div>
          </div>
        );
    }
}


export default House;
