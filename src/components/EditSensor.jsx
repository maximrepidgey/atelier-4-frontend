import React, { useEffect, useCallback } from 'react';
import '../css/App.css';
import '../css/devices.css';
import '../css/editPages.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import { getDeviceTypeName } from '../helpers/getDeviceMetadataHelper';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

const EditSensor = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);
  const [device, setDevice] = React.useState({});
  const [value, setValue] = React.useState();
  const [tolerance, setTolerance] = React.useState();
  const defaultMesssage = (<p className="hidden">Secret message!</p>);
  const [message, setMessage] = React.useState(defaultMesssage);

  // Get's measure unit for values according to sensor type
  function getMeasureUnit(type) {
    switch (type) {
      case 9: // TempSensor
      case 11: // Thermostat
        return '°C';
      case 8: // LightSensor
        return 'lm';
      case 7: // HumiditySensor
      case 10: // MovementSensor
      default:
        return '%';
    }
  }

  // Get's min/max accepted values according to sensor type
  function getMinMax(type) {
    switch (type) {
      case 9: // TempSensor
      case 11: // Thermostat
        return [undefined, undefined];
      case 8: // LightSensor
        return ['0', undefined];
      case 7: // HumiditySensor
      case 10: // MovementSensor
      default:
        return ['0', '100'];
    }
  }

  const checkHumiditySensorTolerance = useCallback((devicesToSort) => {
    const hiddenMessage = (<p className="hidden">Secret message!</p>);

    if (value && !tolerance) {
      if (Number(value) <= 50) {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>The tolerance should be between 0 % and {value} %</p>,
        );
      } else {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>The tolerance should be between 0 % and {100 - value} %</p>,
        );
      }
    } else if (!value && tolerance) {
      if (Number(tolerance) > 50) {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Tolerance is to high, there are no compatible values. Set the tolerance lesser or equal than 50%</p>,
        );
      } else if (Number(tolerance) === 50) {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>The only accepted value is 50%</p>,
        );
      } else {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>The value should be between {tolerance} % and {100 - tolerance} %</p>,
        );
      }
    } else if (value && tolerance) {
      if (Number(value) + Number(tolerance) <= 100 && Number(value) - Number(tolerance) >= 0) {
        setIsValid(true);
        setShowMessage(false);
        setMessage(hiddenMessage);
      } else if (Number(value) + Number(tolerance) <= 100 && Number(value) - Number(tolerance) < 0) {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Tolerance is to high, tolerance should not be greater than the value</p>,
        );
      } else if (Number(value) + Number(tolerance) > 100) {
        setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Tolerance or value is to high, tolerance should not be greater than value and the value summed to the tolerance must not exceed 100%</p>,
        );
      }
    }
}, [value, tolerance, showMessage]);

  const checkLightSensorTolerance = useCallback((devicesToSort) => {
    const hiddenMessage = (<p className="hidden">Secret message!</p>);

    if (value && !tolerance) {
      setShowMessage(true);
        setIsValid(false);
        setMessage(
        <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Tolerance should be lesser or equal to value</p>,
        );
    } else if (!value && tolerance) {
      setShowMessage(true);
      setIsValid(false);
      setMessage(
      <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Value must be greater or equal to tolerance</p>,
      );
    } else if (value && tolerance) {
      if (value - tolerance < 0) {
        setShowMessage(true);
      setIsValid(false);
      setMessage(
      <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Tolerance must be lesser than vlaue</p>,
      );
      } else if (value - tolerance >= 0) {
        setIsValid(true);
        setShowMessage(false);
        setMessage(hiddenMessage);
      }
    }
  }, [value, tolerance, showMessage]);

  // Checks validity to save and show feedback messages
  useEffect(() => {
      const hiddenMessage = (<p className="hidden">Secret message!</p>);

      if (showMessage) {
        // TempSensor and Thermostat
        if (device.type === 9 || device.type === 11) {
          if (value && tolerance >= 0) {
            setIsValid(true);
            setShowMessage(false);
            setMessage(hiddenMessage);
          }

          if ((!value && !tolerance) || (!value && tolerance < 0) || (value && tolerance < 0)) {
            setShowMessage(true);
            setIsValid(false);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please fill both fields, and tolerance with a positive value.</p>,
            );
          }

          if (value && !tolerance) {
            setShowMessage(true);
            setIsValid(false);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please fill tolerance with a positive value.</p>,
            );
          }

          if (!value && tolerance >= 0) {
            setShowMessage(true);
            setIsValid(false);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please fill the value field.</p>,
            );
          }
        }

        // MovementSensor
        if (device.type === 10) {
          if (value >= 0 && value <= 100) {
            setIsValid(true);
            setShowMessage(false);
            setMessage(hiddenMessage);
          }

          if (!value || value < 0 || value > 100) {
            setIsValid(false);
            setShowMessage(true);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please enter a value between 0 and 100.</p>,
            );
          }
        }

        // LightSensor
        if (device.type === 8) {
          if (value >= 0 && tolerance >= 0) {
            setIsValid(true);
            setShowMessage(false);
            setMessage(hiddenMessage);
          checkLightSensorTolerance();          
          }

          if (value < 0 || tolerance < 0 || !value || !tolerance) {
            setIsValid(false);
            setShowMessage(true);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please enter values greater or equal to 0.</p>,
            );
          checkLightSensorTolerance();          
          }
        }

        // HumiditySensor
        if (device.type === 7) {
          if (value >= 0 && value <= 100 && tolerance >= 0 && tolerance <= 100) {
            setIsValid(true);
            setShowMessage(false);
            setMessage(hiddenMessage);

          checkHumiditySensorTolerance();
          }

          if (!value || !tolerance || value < 0 || value > 100 || tolerance < 0 || tolerance > 100) {
            setIsValid(false);
            setShowMessage(true);
            setMessage(
              <p className={showMessage ? 'enter-text error-message' : 'hidden'}>Please enter values between 0 and 100.</p>,
            );
          checkHumiditySensorTolerance();
          }
        }

        if (success) {
          setShowMessage(true);
          setMessage(
            <p className="enter-text success-message">Values successfully saved!</p>,
          );
        }

        if (isError) {
          setShowMessage(true);
          setMessage(
            <p className="enter-text error-message">There was an error!</p>,
          );
        }
      }
    },
    [device, value, tolerance, success, isError, showMessage, checkHumiditySensorTolerance, checkLightSensorTolerance]);

  // Extracts value is isLoading on change
  useEffect(() => {
    setShowMessage(false);
  }, [isLoading]);

  // Fetches devices and room info on page load
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

  function updateDevice() {
    if (isValid) {
      const params = (new URL(document.location)).searchParams;
      const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/devices/${params.get('id')}`;
      const headers = {
        user: localStorage.getItem('username'),
        'session-token': localStorage.getItem('session_token'),
        'Content-Type': 'application/json',
      };
      const body = {
        quantity: value,
        tolerance,
      };
      setIsLoading(true);
      setIsValid(false);
      fetch(fetchUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
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

  return (
    <div>
      <div id="addDeviceInfo" className="device-content-box z-depth-2">
        <h2 className="title">Set custom sensor values</h2>

        <div id={device.id} className="collapsible-header no-border">
          <form id="devicesForm" className="device-form row">

            <div className="col col-custom l7 icons-wrapper">
              <i className="material-icons l1" />
              <div className="icon-device l1">
                <img src={device.icon} alt={device.name} />
              </div>

              <div className="device-info col col-custom l12 left-align">
                <p className="device-name">{device.name}</p>
                <p className="device-location">{device.roomName}</p>
                <p className="device-type-name">{getDeviceTypeName(device.type)}</p>
              </div>
            </div>

            <div className="device-control col col-custom l5">
              {device.type === 10 && <div className="col l4" />}
              <div className="col l4">
                {device.type === 10 ? <label>Probability</label> : <label>Value</label>}
                <input
                  className="scenes-factory-effect-value-input"
                  type="number"
                  min={getMinMax(device.type)[0]}
                  max={getMinMax(device.type)[1]}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setShowMessage(true);
                  }}
                  placeholder={parseFloat(device.quantity).toFixed(2).toString() || '0.00'}
                  required
                />
              </div>
              <label className="col l1 scene-effect-value-label">{getMeasureUnit(device.type)}</label>
              <div className="col l1">
                &nbsp;
              </div>
              {device.type !== 10
               && (
                 <>
                   <div className="col l4">
                     <label>&plusmn;Tolerance</label>
                     <input
                       className="scenes-factory-effect-value-input"
                       type="number"
                       onChange={(e) => {
                         setTolerance(e.target.value);
                         setShowMessage(true);
                       }}
                       min="0"
                       max={getMinMax(device.type)[1]}
                       placeholder={parseFloat(device.tolerance).toFixed(2).toString() || '0.00'}
                       required
                     />
                   </div>
                   <label className="col l1 scene-effect-value-label">{getMeasureUnit(device.type)}</label>
                 </>
               )}
            </div>

          </form>
        </div>
        <div className="message-one-lines center-text center row">
          <div className="col l12 loading-spacer">
            <ColorCircularProgress className={isLoading ? 'loading-spinner' : 'loading-spinner hidden'} />
          </div>
          <div className="col l12">
            {message}
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
            onClick={() => updateDevice()}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};
export default EditSensor;
