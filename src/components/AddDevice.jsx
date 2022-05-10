import React from 'react';
import '../css/App.css';
import '../css/devices.css';
import '../css/editPages.css';
import * as qs from 'query-string';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class AddDevice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorType: '',
      success: false,
      incomplete: false,
      deviceName: 'Device',
      type: '0',
      room: '0',
      pairing: '0',
      selectRooms: <></>,
      isLoading: false,
      iconType: '0',
      fromRoom: false,
      iconChanged: false,
    };
  }

  /**
   * If present, takes the value for this.state.room parsing the URL
   * Adds an event listener to call sendDatas when key "Enter" is pressed
   * Fetches GET request to /rooms/ and if successful sets the response into this.state.selectRooms
   * If the fetch is unsuccessful, it displays an error message
   */
  componentDidMount() {
    const parsed = qs.parse(window.location.search);
    if (parsed.room !== undefined) this.setState({ room: parsed.room, fromRoom: true });
    else this.setState({ fromRoom: false });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') this.sendDatas(evt);
    });

    fetch('http://localhost:8080/rooms', {
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
        this.setState({ room: '-1' });
        this.setState({
          selectRooms: <select className="selector">
            <option value="-1">Error Occurred</option>
          </select>, room: '-1'
        });
      } else {
        this.mapRooms(response.sort(this.sortRooms));
      }
    })
    .then(() => {
      if (this.state.fromRoom) document.getElementById('roomSelector').value = this.state.room;
    })
    .catch((error) => console.log(error));
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
   * Map received array rooms into the Selector
   * @param {room array} rooms: array of rooms
   */
  mapRooms = (rooms) => {
    if (rooms.length === 0) {
      this.setState({
        selectRooms: <select className="selector" disabled>
          <option value="0">No Room Available</option>
        </select>, room: '0'
      });
    } else {
      let i = 0;
      const toSet = (
        <select id="roomSelector" className="selector" onChange={this.handleRoomChange}>
          {' '}
          <option value="0" style={{ display: 'none' }}>Select Room</option>
          {' '}
          {rooms.map((room) => <option key={i++} value={room.id}>{room.name}</option>)}
        </select>
      );
      this.setState({ selectRooms: toSet });
    }
  }

  /**
   * If all informations aren't filled in, it displays an error message, otherwise:
   * Fetches POST request to /devices/ with this.state.deviceName, iconType, type and room
   * Display a different message depending on if it's successful or not.
   */
  sendDatas = (evt) => {
    evt.preventDefault();
    if (this.state.type === '0' || this.state.room === '0') {
      this.setState({ success: false, incomplete: true });
    } else {
      this.setState({ isLoading: true, success: false, incomplete: false });
      fetch('http://localhost:8080/devices', {
        method: 'POST',
        headers: {
          user: this.props.username,
          'session-token': this.props.session_token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.deviceName,
          icon: this.props.findPathDevice(this.state.iconType),
          type: parseInt(this.state.type, 10),
          roomId: this.state.room,
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
        isLoading: false, success: false, incomplete: false, errorType: e.toString(),
      }));
    }
  };

  /**
   * Handles changes in Type input
   */
  handleTypeChange = (evt) => {
    this.setState({ type: evt.target.value });
    if (!this.state.iconChanged) {
      this.setState({ iconType: evt.target.value });
    }
  }

  /**
   * Handles changes in Device Name input
   */
  handleDeviceNameChange = (evt) => {
    this.setState({ deviceName: evt.target.value });
  }

  /**
   * Handles changes in Room input
   */
  handleRoomChange = (evt) => {
    this.setState({ room: evt.target.value });
  }

  /**
   * Calls this.redirectToPrevious if the device has been successfully created
   * Displays an error message otherwise
   */
  deviceCreated = () => {
    if (this.state.success) {
      this.redirectToPrevious();
    } else if (this.state.incomplete) {
      return (<span className="error-message">Please insert all information</span>);
    } else if (this.state.errorType !== '') {
      return (<span className="error-message">{this.state.errorType}</span>);
    }
  }

  /**
   * Changes the value of this.state.iconType and iconChanged based on the received type,
   * then calls this.moveToInformation.
   * @param {string} type
   */
  changeIconState = (type) => {
    this.setState({ iconType: type, iconChanged: true });
    this.moveToInformation();
  }

  /**
   * Changes the display view to the list of possible icons
   */
  moveToSelection = () => {
    document.getElementById('addDeviceInfo').hidden = true;
    document.getElementById('addDeviceIconSelection').hidden = false;
  }

  /**
   * Changes the display view back to the default one
   */
  moveToInformation = () => {
    document.getElementById('addDeviceInfo').hidden = false;
    document.getElementById('addDeviceIconSelection').hidden = true;
  }

  /**
   * Redirection to previous page
   */
  redirectToPrevious = () => {
    if (this.state.fromRoom) window.location.href = `/room?id=${this.state.room}`;
    else window.location.href = '/devices';
  }

  /**
   * Renders AddDevice page
   */
  render() {
    return (
      <div className="addDevice">
        <div id="addDeviceInfo" className="device-content-box z-depth-2">
          <h2 className="title">Add device</h2>
          <div>
            <div className="textFields">
              <input type="text" name="" placeholder="Device Name" onChange={this.handleDeviceNameChange} required />
            </div>
            <div className="textFields">
              <select className="selector" onChange={this.handleTypeChange}>
                <option value="0" style={{ display: 'none' }}>Device type</option>
                <option value="Lights" disabled>Switches</option>
                <option value="5">&nbsp;&nbsp;Dimmer</option>
                <option value="4">&nbsp;&nbsp;Smart dimmer</option>
                <option value="3">&nbsp;&nbsp;Switch</option>

                <option value="Lights" disabled>Lights</option>
                <option value="2">&nbsp;&nbsp;Dimmable light</option>
                <option value="1">&nbsp;&nbsp;Light</option>

                <option value="Sensors" disabled>Sensors</option>
                <option value="7">&nbsp;&nbsp;Humidity sensor</option>
                <option value="8">&nbsp;&nbsp;Light sensor</option>
                <option value="10">&nbsp;&nbsp;Motion sensor</option>
                <option value="9">&nbsp;&nbsp;Temperature sensor</option>

                <option value="Temperature" disabled>Temperature control</option>
                <option value="11">&nbsp;&nbsp;Thermostat</option>

                <option value="Other" disabled>Other</option>
                <option value="13">&nbsp;&nbsp;Security camera</option>
                <option value="12">&nbsp;&nbsp;Smart curtains</option>
                <option value="6">&nbsp;&nbsp;Smart plug</option>
              </select>
            </div>
            <div className="textFields">
              {this.state.selectRooms}
            </div>
            <div className="roomNameAndIcon left">
              <p>Icon</p>
              <img className="fixedSizeIcon" src={this.props.findPathDevice(this.state.iconType)} onClick={this.moveToSelection} alt="icon error" />
              <button className="material-icons removeBorder toPointer" onClick={this.moveToSelection}>edit</button>
            </div>
            <div className="message-two-lines center-text">
                  <span>
                    <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
                  </span>
              {this.deviceCreated()}
            </div>
          </div>
          <div className="center">
            <button type="button" name="button" className="btn-secondary btn waves-effect waves-light" onClick={this.redirectToPrevious}>Cancel</button>
            <button type="button" name="button" className="btn-primary btn waves-effect waves-light" onClick={this.sendDatas}>Save device</button>
          </div>
        </div>

        <div hidden id="addDeviceIconSelection" className="container">
          <div className="content-box z-depth-2">
            <h2 className="title">Select Icon</h2>
            <div className="content-box-iconSelection">
              <button className="selectionIconBtn" onClick={() => this.changeIconState('0')}>
                <img src={this.props.findPathDevice('0')} alt="Unknown Device" />
                <br />
                Unknown Device
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('2')}>
                <img src={this.props.findPathDevice('2')} alt="Dimmable Light" />
                <br />
                Dimmable Light
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('4')}>
                <img src={this.props.findPathDevice('4')} alt="Dimmer" />
                <br />
                Dimmer
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('5')}>
                <img src={this.props.findPathDevice('5')} alt="Dimmer (no-memory)" />
                <br />
                Dimmer (no-memory)
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('7')}>
                <img src={this.props.findPathDevice('7')} alt="Humidity sensor" />
                <br />
                Humidity sensor
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('1')}>
                <img src={this.props.findPathDevice('1')} alt="Light" />
                <br />
                Light
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('8')}>
                <img src={this.props.findPathDevice('8')} alt="Light sensor" />
                <br />
                Light sensor
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('10')}>
                <img src={this.props.findPathDevice('10')} alt="Motion sensor" />
                <br />
                Motion sensor
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('13')}>
                <img src={this.props.findPathDevice('13')} alt="Security camera" />
                <br />
                Security camera
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('12')}>
                <img src={this.props.findPathDevice('12')} alt="Smart curtains" />
                <br />
                Smart curtains
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('6')}>
                <img src={this.props.findPathDevice('6')} alt="Smart plug" />
                <br />
                Smart plug
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('3')}>
                <img src={this.props.findPathDevice('3')} alt="Switch" />
                <br />
                Switch
                {' '}
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('9')}>
                <img src={this.props.findPathDevice('9')} alt="Temperature sensor" />
                <br />
                Temperature sensor
              </button>
              <button className="selectionIconBtn" onClick={() => this.changeIconState('11')}>
                <img src={this.props.findPathDevice('11')} alt="Thermostat" />
                <br />
                Thermostat
              </button>
            </div>
            <button type="button" name="button" className="btn-secondary btn waves-effect waves-light" onClick={this.moveToInformation}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AddDevice;
