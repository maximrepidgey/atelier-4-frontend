import React, { useEffect } from 'react';
import '../css/App.css';
import '../css/devices.css';
import '../css/editPages.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import { getDeviceTypeName } from '../helpers/getDeviceMetadataHelper';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

const EditSecurityCamera = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);
  const [device, setDevice] = React.useState({});
  const [video, setVideo] = React.useState('');
  const defaultVideo = 'https://res.cloudinary.com/erickgarro/video/upload/v1586203233/SmartHut/video-cabin.mp4';

  // PUTS the customized security camera video file
  function updateDevice(mode) {
    const newVideo = JSON.stringify({ video });

    if (isValid) {
      const params = (new URL(document.location)).searchParams;
      const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/devices/${params.get('id')}`;
      const headers = {
        user: localStorage.getItem('username'),
        'session-token': localStorage.getItem('session_token'),
        'Content-Type': 'application/json',
      };

      if (mode !== 'update') {
        setVideo(defaultVideo);
      }

      setIsLoading(true);
      setIsValid(false);
      fetch(fetchUrl, {
        method: 'PUT',
        headers,
        body:
        newVideo
        ,
      })
      .then((res) => {
        setIsLoading(false);
        if (res.status === 401) {
          this.props.logOut(1);
        } else if (res.status === 200) {
          setSuccess(true);
          setShowMessage(true);
          return res.text();
        } else if (res.status === 400) {
          setSuccess(false);
        } else if (res.status === 404) {
          setIsError(true);
        }
        setShowMessage(true);
        return null;
      })
      .catch((e) => {
        setIsLoading(false);
        setIsError(true);
        setShowMessage(true);
        console.log(e);
      });
    }
  }

  // Validates the size of the video file
  function validateVideoFile() {
    const upl = document.getElementById('upload-video');
    const max_size = 70000000;
    const file_size = upl.files[0].size;

    if (file_size > max_size) {
      setIsValid(false);
      setIsError(true);
      setShowMessage(true);
    } else {
      setIsValid(true);
      setIsError(false);
      setShowMessage(false);

      const reader = new FileReader();
      reader.readAsDataURL(upl.files[0]);

      reader.onload = function () {
        setVideo(reader.result);
      };

      reader.onerror = function () {
        console.log('error');
      };
    }
  }

  // Resets video file to default video URL
  function resetVideo() {
    setVideo(defaultVideo);
    setIsValid(true);
  }

  // Additional validation to enable saving
  useEffect(() => {
      if (showMessage) {
        if (video.length > 0) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
        if (isError) {
          setShowMessage(true);
        }
      }
    },
    [video, device, isError, showMessage]);

  // Disable message when something is loading
  useEffect(() => {
    setShowMessage(false);
  }, [isLoading]);

  // Fetches devices on page loads
  useEffect(() => {
    const params = (new URL(document.location)).searchParams;
    const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/devices/${params.get('id')}`;
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
    };

    fetch(fetchUrl, {
      method: 'GET',
      headers,
    })
    .then((res) => {
      if (res.status === 401) {
        this.props.logOut(1);
      } else if (res.status === 200) {
        return res.text();
      } else if (res.status === 404) {
        return null;
      }
      return null;
    })
    .then((data) => {
      const fetchedDevice = JSON.parse(data);
      if (fetchedDevice === null) {
        setIsError(true);
        setIsLoading(false);
      } else {
        setDevice(fetchedDevice);
        setIsLoading(false);
      }
    })
    .catch((e) => {
      console.log(e);
    });
  }, []);

  /**
   * Display feedback message
   */
  function showFeedbackMessage() {
    if (showMessage) {
      if (!isValid && isError) {
        return (
          <p className="enter-text error-message">Max. file size allowed 70 MB at 720p resolution.</p>
        );
      }

      if ((isError && !isValid && !success) || (!isError && !isValid && !success)) {
        return (
          <p className="enter-text error-message">There was an error!</p>
        );
      }

      if (success) {
        return (
          <p className="enter-text success-message">Video successfully saved!</p>
        );
      }
    }
    return (<p>&nbsp;</p>);
  }

  return (
    <div>
      <div id="addDeviceInfo" className="device-content-box z-depth-2">
        <h2 className="title">Set custom video feed</h2>

        <div id={device.id} className="collapsible-header no-border">
          <form id="devicesForm" className="device-form row">

            <div className="col col-custom l5 icons-wrapper">
              <div className="icon-device l1">
                <img src={device.icon} alt={device.name} />
              </div>

              <div className="device-info col col-custom l12 left-align">
                <p className="device-name">{device.name}</p>
                <p className="device-location">{device.roomName}</p>
                <p className="device-type-name">{getDeviceTypeName(device.type)}</p>
              </div>
            </div>

            <div className="device-control col col-custom l7">
              <div className="col l5">
                <button
                  type="button"
                  name=" button"
                  className=" btn-primary waves-effect waves-light btn"
                  onClick={() => resetVideo()}
                >
                  Reset
                </button>
              </div>
              <div className="col l1">
                &nbsp;
              </div>
              <div className="col l5">
                <label
                  htmlFor="upload-video"
                  className="btn-primary waves-effect waves-light btn"
                >
                  Modify video
                </label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={() => validateVideoFile()}
                  id="upload-video"
                  hidden
                />
              </div>
            </div>

          </form>
        </div>
        <div className="message-one-lines center-text center row">
          <div className="col l12 loading-spacer">
            <ColorCircularProgress className={isLoading ? 'loading-spinner' : 'loading-spinner hidden'} />
          </div>
          <div className="col l12">
            {showFeedbackMessage()}
          </div>
        </div>

        <div className="col l12 center">
          <button
            type="button"
            name="button"
            className="btn-secondary waves-effect waves-light btn"
            onClick={() => {
              window.location.href = '/simulations';
            }}
          >
            {success ? 'Go back' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={!isValid || isLoading}
            name=" button"
            className=" btn-primary waves-effect waves-light btn"
            onClick={() => updateDevice('save')}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};
export default EditSecurityCamera;
