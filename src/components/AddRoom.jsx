import React from 'react';
import '../css/App.css';
import '../css/editPages.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class AddRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errimorType: '',
            success: false,
            incomplete: false,
            roomName: '',
            type: 'generic-room',
            isLoading: false,
            background: '',
        };
    }

    /**
     * Adds an event listener to call sendDatas when key "Enter" is pressed
     * Changes the page background based on the value of this.state.type
     */
    componentDidMount() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') this.sendDatas(evt);
        });
        document.querySelector('main').style.backgroundImage = `url(${this.props.findPathRoom(this.state.type, 1)})`;
    }

    /**
     * If all informations aren't filled in, it displays an error message, otherwise:
     * Fetches POST request to /rooms/ with this.state.roomName, iconType and the background image of the page
     * Display a different message depending on if it's successful or not.
     */
    sendDatas = (evt) => {
        evt.preventDefault();
        if (this.state.roomName.length === 0) {
            this.setState({ success: false, incomplete: true });
        } else {
            this.setState({ isLoading: true, success: false, incomplete: false });
            fetch('http://localhost:8080/rooms/', {
                method: 'POST',
                headers: {
                    user: this.props.username,
                    'session-token': this.props.session_token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.state.roomName,
                    icon: this.props.findPathRoom(this.state.type, 0),

                    background: this.state.background !== ''
                        ? this.state.background
                        : this.props.findPathRoom(this.state.type, 1),

                    devices: [],
                }),
            })
            .then((res) => {
                this.setState({ isLoading: false });
                if (res.status === 201) {
                    this.setState({ success: true, incomplete: false, errorType: '' });
                } else if (res.status === 401) {
                    this.props.logOut(1);
                } else {
                    this.setState({ success: false, incomplete: false });
                    return res.json();
                }
                return null;
            })
            .then((data) => {
                if (data !== null) this.setState({ errorType: data.message });
            })
            .catch((e) => this.setState({
                isLoading: false,
                success: false,
                error: false,
                incomplete: false,
                errorType: e.toString(),
            }));
        }
    };

    /**
     * Handles changes in Room Name input
     */
    handleRoomNameChange = (evt) => {
        this.setState({ roomName: evt.target.value });
    };

    /**
     * Handles changes in Type input
     */
    handleTypeChange = (evt) => {
        this.setState({ type: evt.target.value });
    };

    /**
     * Redirects to /house if a room has been successfully created
     * Displays an error message if not
     */
    roomCreated = () => {
        if (this.state.success) {
            window.location.href = '/house';
        } else if (this.state.incomplete) {
            return (<span className="error-message">Please complete all fields</span>);
        } else if (this.state.errorType !== '') {
            return (<span className="error-message">{this.state.errorType}</span>);
        }
    }

    /**
     * Changes the value of this.state.type and the background of this page based on the received path,
     * then calls this.moveToInformation.
     * @param {string} path
     */
    changeIconState = (path) => {
        this.setState({ type: path });
        document.querySelector('main').style.backgroundImage = `url(${this.props.findPathRoom(path, 1)})`;
        if (this.state.background === '') {
            this.resetBackground(path);
        }
        this.moveToInformation();
    }

    /**
     * Changes the display view to the list of possible icons
     */
    moveToSelection = () => {
        document.getElementById('addRoomInfo').hidden = true;
        document.getElementById('addRoomIconSelection').hidden = false;
    }

    /**
     * Changes the display view back to the default one
     */
    moveToInformation = () => {
        document.getElementById('addRoomInfo').hidden = false;
        document.getElementById('addRoomIconSelection').hidden = true;
        if (this.state.background !== '') {
            document.querySelector('main').style.backgroundImage = `url(${this.state.background})`;
            document.getElementById('imageURL').value = this.state.background;
        }
    }

    /**
     * Changes the background with a user selected one
     * @param e
     */
    changeDinamicallyBackground = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];
        if (file) {
            reader.addEventListener('load', (event) => {
                const dataUrl = reader.result;
                document.querySelector('main').style.backgroundImage = `url(${dataUrl})`;
                document.getElementById('imageURL').value = dataUrl;
                this.setState({ background: dataUrl });
            });
            reader.readAsDataURL(file);
        }
    }

    /**
     * Call this.resetBackground with this.state.type
     */
    resetBackgroundNoParam = () => {
        this.resetBackground(this.state.type);
    }

    /**
     * Restore the background selected by the user and
     * changes it back to the one received as type
     * @param {string} type
     */
    resetBackground = (type) => {
        document.getElementById('inputPicture').value = '';
        document.getElementById('imageURL').value = '';
        document.querySelector('main').style.backgroundImage = `url(${this.props.findPathRoom(type, 1)})`;
        this.setState({ background: '' });
    }

    /**
     * Redirection to /house
     */
    redirectToHouse = () => {
        window.location.href = '/house';
    }

    /**
     * Renders AddRoom page
     */
    render() {
        return (
          <div className="addRoom container" id="addRoom">
            <div id="addRoomInfo" className="room-edit-content-box z-depth-2 content-box-transparency">
              <h2 className="title">Add room</h2>
              <div className="dates">
                <div className="roomNameAndIcon">
                  <span className="textFields">
                    <input
                      type="text"
                      name="roomName"
                      placeholder="Room Name"
                      onChange={this.handleRoomNameChange}
                      required
                    />
                  </span>
                  <div className="roomNameAndIcon">
                    <p>Icon</p>
                    <img
                      className="fixedSizeIcon"
                      src={this.props.findPathRoom(this.state.type, 0)}
                      onClick={this.moveToSelection}
                      alt="icon error"
                    />
                    <button
                      className="material-icons removeBorder toPointer"
                      onClick={this.moveToSelection}
                    >
                      edit
                    </button>
                  </div>

                </div>
                <br />
                <br />
                <br />
                <div className="roomNameAndIcon2">
                  <p>Customize background</p>
                  <input
                    type="file"
                    className="inputBackground"
                    accept="image/*"
                    onChange={this.changeDinamicallyBackground}
                    id="inputPicture"
                  />
                  <input type="hidden" id="imageURL" value="" />
                </div>

                <div className="center">
                  <button
                    type="button"
                    name="button"
                    className="btn-secondary btn waves-effect waves-light"
                    onClick={this.resetBackgroundNoParam}
                  >
                    Restore Background
                  </button>
                </div>

                <div className="message-two-lines center-text">
                  <span>
                    <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
                  </span>

                  {this.roomCreated()}
                </div>
              </div>
              <div className="center">
                <button
                  type="button"
                  name="button"
                  className="btn-secondary btn waves-effect waves-light"
                  onClick={this.redirectToHouse}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  name="button"
                  className="btn-primary btn waves-effect waves-light"
                  onClick={this.sendDatas}
                >
                  Save room
                </button>
              </div>
            </div>

            <div hidden id="addRoomIconSelection" className="content-box z-depth-2">
              <h2 className="title">Select Icon</h2>
              <div className="content-box-iconSelection">
                <button className="selectionIconBtn" onClick={() => this.changeIconState('attic')}>
                  <img src={this.props.findPathRoom('attic', 0)} alt="Attic" />
                  <br />
                  Attic
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('backyard')}>
                  <img src={this.props.findPathRoom('backyard', 0)} alt="Backyard" />
                  <br />
                  Backyard
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('bathroom')}>
                  <img src={this.props.findPathRoom('bathroom', 0)} alt="Bathroom" />
                  <br />
                  Bathroom
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('basement')}>
                  <img src={this.props.findPathRoom('basement', 0)} alt="Basement" />
                  <br />
                  Basement
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('bedroom')}>
                  <img src={this.props.findPathRoom('bedroom', 0)} alt="Bedroom" />
                  <br />
                  Bedroom
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('dining-room')}>
                  <img src={this.props.findPathRoom('dining-room', 0)} alt="Dining" />
                  <br />
                  Dining Room
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('garage')}>
                  <img src={this.props.findPathRoom('garage', 0)} alt="Garage" />
                  <br />
                  Garage
                  {' '}
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('generic-room')}>
                  <img src={this.props.findPathRoom('generic-room', 0)} alt="Generic" />
                  <br />
                  Generic
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('hallway')}>
                  <img src={this.props.findPathRoom('hallway', 0)} alt="Hallway" />
                  <br />
                  Hallway
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('house-front')}>
                  <img src={this.props.findPathRoom('house-front', 0)} alt="House" />
                  <br />
                  House
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('kitchen')}>
                  <img src={this.props.findPathRoom('kitchen', 0)} alt="Kitchen" />
                  <br />
                  Kitchen
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('living-room')}>
                  <img src={this.props.findPathRoom('living-room', 0)} alt="Living" />
                  <br />
                  Living
                </button>
                <button className="selectionIconBtn" onClick={() => this.changeIconState('office')}>
                  <img src={this.props.findPathRoom('office', 0)} alt="Office" />
                  <br />
                  Office
                  {' '}
                </button>
              </div>
              <button
                type="button"
                name="button"
                className="btn-secondary btn waves-effect waves-light"
                onClick={this.moveToInformation}
              >
                Cancel
              </button>
            </div>

          </div>

        );
    }
}


export default AddRoom;
