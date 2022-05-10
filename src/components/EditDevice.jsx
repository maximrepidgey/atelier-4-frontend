import React from 'react';
import '../css/App.css';
import '../css/devices.css';
import '../css/editPages.css';
import * as qs from 'query-string';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class EditDevice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      session_token: props.session_token,
      device_id: '',
      deviceName: '',
      error: -1, // -1 nothing, 0 incomplete, 1 everything else
      errorType: '',
      isLoading: false,
      iconType: '0',
      room: '',
      fromRoom: false,
      type: 0,
    };
  }

  /**
   * Takes the value for this.state.device_id parsing the URL
   * If present, takes the value for this.state.room parsing the URL
   * Adds an event listener to call sendDatas when key "Enter" is pressed
   * Fetches GET request to /devices/:id and
   * if successful sets the response into this.state.deviceName and calls this.getIconType
   */
  componentDidMount() {
    const parsed = qs.parse(window.location.search);
    this.setState({ device_id: parsed.id });
    if (parsed.room !== undefined) this.setState({ room: parsed.room, fromRoom: true });
    else this.setState({ fromRoom: false });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') this.sendDatas(evt);
    });

    fetch(`http://localhost:8080/devices/${parsed.id}`, {
      method: 'GET',
      headers: {
        user: this.state.username,
        'session-token': this.state.session_token,
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }
      return null;
    })
    .then((data) => {
      if (data === null) {
        this.setState({ error: 1, errorType: 'An error has occurred.' });
        return;
      }
      this.setState({ deviceName: data.name, type: data.type });
      this.getIconType(data.icon);
    })
    .catch((error) => console.log(error));
  }

  /**
   * Based on the received icon, it sets the corresponding iconType into the state
   * @param {string} icon
   */
  getIconType(icon) {
    if (icon.includes('bulb-regular')) this.setState({ iconType: '1' });
    else if (icon.includes('bulb-led')) this.setState({ iconType: '2' });
    else if (icon.includes('switch')) this.setState({ iconType: '3' });
    else if (icon.includes('dimmer-state')) this.setState({ iconType: '4' });
    else if (icon.includes('dimmer-regular')) this.setState({ iconType: '5' });
    else if (icon.includes('smart-plug')) this.setState({ iconType: '6' });
    else if (icon.includes('sensor-humidity')) this.setState({ iconType: '7' });
    else if (icon.includes('sensor-light')) this.setState({ iconType: '8' });
    else if (icon.includes('sensor-temperature')) this.setState({ iconType: '9' });
    else if (icon.includes('sensor-motion')) this.setState({ iconType: '10' });
    else if (icon.includes('automation-thermostat')) this.setState({ iconType: '11' });
    else if (icon.includes('smart-curtains')) this.setState({ iconType: '12' });
    else if (icon.includes('security-camera')) this.setState({ iconType: '13' });
    else this.setState({ iconType: '0' });
  }

  /**
   * If all informations aren't filled in, it displays an error message, otherwise:
   * Fetches POST request to /devices/:id with this.state.deviceName and iconType
   * If successfull, calls this.redirectToPrevious,
   * otherwise it displays an error message
   */
  sendDatas = (evt) => {
    evt.preventDefault();
    if (this.state.deviceName === '') {
      this.setState({ error: 0 });
    } else {
      this.setState({ isLoading: true, error: -1 });
      fetch(`http://localhost:8080/devices/${this.state.device_id}`, {
        method: 'PUT',
        headers: {
          user: this.state.username,
          'session-token': this.state.session_token,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.deviceName,
          icon: this.props.findPathDevice(this.state.iconType),
        }),
      })
      .then((res) => {
        this.setState({ isLoading: false });
        if (res.status === 200) {
          this.redirectToPrevious();
        } else if (res.status === 401) {
          this.props.logOut(1);
        } else {
          this.setState({ error: 1 });
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data !== null) this.setState({ errorType: data.message });
      })
      .catch((e) => this.setState({ error: 1, errorType: e.toString() }));
    }
  };

  /**
   * Fetches DELETE request to /devices/:id
   * If successful, calls this.redirectToPrevious,
   * otherwise it displays an error message
   */
  deleteDevice = (evt) => {
    this.setState({ isLoading: true, error: -1 });
    fetch(`http://localhost:8080/devices/${this.state.device_id}`, {
      method: 'DELETE',
      headers: {
        user: this.state.username,
        'session-token': this.state.session_token,
      },
    })
    .then((res) => {
      this.setState({ isLoading: false });
      if (res.status === 204) {
        this.redirectToPrevious();
      } else if (res.status === 401) {
        this.props.logOut(1);
      } else {
        this.setState({ error: 1 });
        return res.json();
      }
      return null;
    })
    .then((data) => {
      if (data !== null) this.setState({ errorType: data.message });
    })
    .catch((e) => {
      this.setState({ isLoading: false });
      this.setState({ error: 1, errorType: e.toString() });
    });
  };

  /**
   * Handles changes in Device Name input
   */
  handleDeviceNameChange = (evt) => {
    this.setState({ deviceName: evt.target.value });
  };

  /**
   * Redirection to previous page
   */
  redirectToPrevious = () => {
    if (this.state.fromRoom) window.location.href = `/room?id=${this.state.room}`;
    else window.location.href = '/devices';
  }

  /**
   * Display error message depending on the value of this.state.error
   */
  showError = () => {
    if (this.state.error === 0) {
      return (<span className="error-message">Please fill the name</span>);
    }
    if (this.state.error === 1) {
      return (<span className="error-message">{this.state.errorType}</span>);
    }
  }

  /**
   * Changes the value of this.state.iconType and iconChanged based on the received type,
   * then calls this.moveToInformation.
   * @param {string} type
   */
  changeIconState = (type) => {
    this.setState({ iconType: type });
    this.moveToInformation();
  }

  /**
   * Changes the display view to the list of possible icons
   */
  moveToSelection = () => {
    document.getElementById('editDeviceInfo').hidden = true;
    document.getElementById('editDeviceIconSelection').hidden = false;
  }

  /**
   * Changes the display view back to the default one
   */
  moveToInformation = () => {
    document.getElementById('editDeviceInfo').hidden = false;
    document.getElementById('editDeviceIconSelection').hidden = true;
  }

  /**
   * Redirects to device coupling editing
   * @param evt
   */
  coupleDevice = (evt) => {
    evt.preventDefault();
    const parsed = qs.parse(window.location.search);
    if (parsed.room !== undefined) {
      window.location.href = `/devicesCoupling?id=${this.state.device_id}&room=${parsed.room}`;
    } else {
      window.location.href = `/devicesCoupling?id=${this.state.device_id}`;
    }
  }

  /**
   * Renders the device handler
   */
  render() {
    return (
      <div className="editRoom">
        <div id="editDeviceInfo" className="device-content-box z-depth-2">
          <h2 className="title">Edit Device</h2>
          <div className="textFields">
            <div className="textFields">
              <input
                type="text"
                name="deviceName"
                value={this.state.deviceName}
                placeholder="New Name"
                onChange={this.handleDeviceNameChange}
                required
              />
            </div>
          </div>
          <div className="roomNameAndIcon left">
            <p>Icon</p>
            <img
              className="fixedSizeIcon"
              src={this.props.findPathDevice(this.state.iconType)}
              onClick={this.moveToSelection}
              alt="icon error"
            />
            <button className="material-icons removeBorder toPointer" onClick={this.moveToSelection}>
              edit
            </button>
          </div>

          <div className="message-two-lines center-text">
                <span>
                  <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
                </span>
            {this.showError()}
          </div>

          <div className="center">
            <button
              type="button"
              name="button"
              className="Handle-btn-secondary btn waves-effect waves-light"
              onClick={this.redirectToPrevious}
            >
              Cancel
            </button>
            <button
              type="button"
              name="button"
              className="Handle-btn-secondary btn waves-effect waves-light"
              onClick={this.deleteDevice}
            >
              Delete
            </button>
            {(this.state.type === 3 || this.state.type === 4 || this.state.type === 5)
              ? (
                <button
                  type="button"
                  name="button"
                  className="Handle-btn-primary btn waves-effect waves-light"
                  id="couplingButton"
                  onClick={this.coupleDevice}
                >
                  Edit coupling
                </button>
              )
              : <></>}
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

        <div hidden id="editDeviceIconSelection" className="container">
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
      </div>
    );
  }
}

export default EditDevice;
