import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PowerOnIcon from '@material-ui/icons/PowerSettingsNew';
import CoolingIcon from '@material-ui/icons/AcUnit';
import HeatingIcon from '@material-ui/icons/Whatshot';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import '../../css/toggle-buttons.css';
import Slider from '@material-ui/core/Slider';
import DevicesContext from '../../context/devicesContext';
import { getSliderMarks } from '../../helpers/getDeviceMetadataHelper';


/**
 * Gets a string array to set the mode/state of a thermostat,
 * just for re-rendering purposes
 * @returns {string[]}
 * @param device
 */
function getModes(device) {
  if (device.on) {
    switch (device.state) {
      case 1:
        return ['1'];
      case 2:
        return ['1', '2'];
      case 3:
        return ['1', '3'];
      default:
        return ['0'];
    }
  } else {
    return ['0'];
  }
}

// eslint-disable-next-line react/prop-types
function Thermostat({ device, isGuest }) {
  const { dispatch, setActionCompleted } = useContext(DevicesContext);
  const [intensity, setIntensity] = useState(parseFloat((Math.round(device.slider * 2) / 2).toFixed(2)));
  const [source, setSource] = React.useState(device.source.toString());
  const [modes, setModes] = React.useState(getModes(device));
  const [disabled, setDisabled] = useState(false);
  const useStyles = makeStyles((theme) => ({
    toggleContainer: {
      margin: theme.spacing(0.5, 0),
    },
    typography: {
      thermostatSources: {
        fontFamily: 'Open Sans Condensed',
        fontSize: '0.75rem',
      },
    },
  }));
  const classes = useStyles();

  // Triggers the synchronization (render) and updating of devices (backend)
  const updateDevice = () => {
    device.clicked = true;
    dispatch({ type: 'SYNC_DEVICES', device });
    dispatch({ type: 'MODIFY_DEVICE', device, setActionCompleted });
  };

  /**
   * Synchronizes and re-renders devices state for view purposes
   * dispatching the action to the devices reducer
   * @param e {event}
   * @param val {int}
   */
  const handleChange = (e, val) => {
    setIntensity(val);
    device.slider = val;
    device.source = source;
    device.clicked = true;
    dispatch({ type: 'SYNC_DEVICES', device });
  };

  /**
   * Updates only the affected device's state into the back-end
   * @param e {event}
   * @param val {int}
   */
  const handleChangeCommitted = (e, val) => {
    setIntensity(val);
    device.slider = val;
    device.clicked = true;
    device.source = source;
    dispatch({ type: 'MODIFY_DEVICE', device, setActionCompleted });
  };

  const handleSource = (event, newSource) => {
    if (newSource !== null) {
      setSource(newSource);
      device.clicked = true;
      device.source = parseInt(newSource, 10);
    }
    updateDevice();
  };

  // Controls the fours states of the thermostat and avoids forbidden combinations
  const handleMode = (event, incomingModes) => {
    if (incomingModes.length === 0) {
      incomingModes = ['0'];
      device.state = 0;
      device.on = false;
    } else if (incomingModes.length === 1 && incomingModes[0] !== '1') {
      incomingModes = ['0'];
      device.state = 0;
      device.on = false;
    } else if (incomingModes.length > 1 && incomingModes[0] === '0') {
      incomingModes.shift();
      device.state = 1;
      device.on = true;
    } else if (incomingModes.length > 2 && incomingModes[0] === '1') {
      if (incomingModes[1] === '2') {
        incomingModes = ['1', '3'];
        device.state = 3;
        device.on = true;
      } else {
        incomingModes = ['1', '2'];
        device.state = 2;
        device.on = true;
      }
    }

    setModes(incomingModes);
    updateDevice();
  };

  /**
   * Gets the either the temperature read by a thermostat or the average temperature of the room
   * @param d {device}
   * @returns {{src, options: {sourceMap: boolean, sourceMapStyle: string}, dest: string}|{src: [string]}|number}
   */
  function getThermostatTemp(d) {
    if (d.source === 0) {
      return device.label;
    }
    return `${device.averageTemp.toFixed(2)} °C`;
  }

  /**
   * Disables the Thermostat slider on state 0 === Off
   */
  useEffect(() => {
    if (device.state === 0) {
      device.disabled = true;
      setDisabled(true);
    } else {
      device.disabled = false;
      setDisabled(false);
    }
  }, [device, device.state, device.on]);

  /**
   * Controls device disabled state
   * */
  useEffect(() => {
    if (device.on) {
      setDisabled(false);
    } else {
      setModes(['0']);
      setDisabled(true);
    }
  }, [disabled, device.on]);

  /**
   * Synchronizes source on coupled devices
   * */
  useEffect(() => {
    setSource(device.source.toString());
  }, [device, device.source]);

  /**
   * Synchronizes source on coupled devices
   * */
  useEffect(() => {
    setIntensity(parseFloat((Math.round(device.slider * 2) / 2).toFixed(2)));
  }, [device, device.slider]);

  // Manages the state of the thermostats dynamically according to the target temp - temp relation
  useEffect(() => {
    const selfTemp = device.label.split(' ');
    const averageTemp = device.averageTemp.toFixed(2);
    let evalTemp;

    if (device.on) {
      if (source === '0') {
        evalTemp = parseFloat(selfTemp[0]);
      } else {
        setDisabled(false);
        evalTemp = averageTemp;
      }

      if (evalTemp < intensity + 0.5 && evalTemp > intensity - 0.5) {
        setModes(['1']); // idle
        device.state = 1;
      } else if (intensity > evalTemp) {
        device.state = 3; // heating
        setModes(['1', '3']);
      } else {
        device.state = 2; // cooling
        setModes(['1', '2']);
      }
    } else {
      setDisabled(true);
    }
  }, [device, device.on, device.averageTemp, source, intensity]);

  return (
    <div className="row">
      <div className="col l9">
        <Slider
          name="slider"
          onChange={(e, val) => {
            handleChange(e, val);
          }}
          onChangeCommitted={(e, val) => {
            handleChangeCommitted(e, val);
          }}
          valueLabelDisplay="auto"
          value={intensity}
          step={0.5}
          min={5}
          max={40}
          disabled={isGuest || disabled}
          marks={getSliderMarks(device)}
        />
        <div
          className={`col l12 col-custom display-info-thermostat${!disabled ? ' display-active' : ' display-inactive'}`}
        >
          <span>{!disabled ? getThermostatTemp(device) : '- - - - - -'}</span>
        </div>
      </div>
      <div className="col l2">
        <Grid container spacing={2}>
          <Grid item sm={12} md={6}>

            {/* Mode 0: cooling, 1: heating */}
            <div className={classes.toggleContainer}>
              <ToggleButtonGroup
                value={modes}
                onChange={handleMode}
                size="small"
                aria-label="temperature control"
              >

                <ToggleButton
                  value="2"
                  className="btn-thermostat btn-false-disabled"
                  aria-label="cooling"
                  disabled={disabled}
                >
                  <CoolingIcon />
                </ToggleButton>

                <ToggleButton
                  value="3"
                  className="btn-thermostat btn-false-disabled"
                  aria-label="heating"
                  disabled={modes[0] === '0'}
                >
                  <HeatingIcon />
                </ToggleButton>
                <ToggleButton
                  value="1"
                  disabled={isGuest}
                  className="btn-thermostat"
                  aria-label="on/idle"
                >
                  <PowerOnIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            {/* Value source "0": self, "1": average */}
            <div className={classes.toggleContainer}>
              <ToggleButtonGroup
                value={source}
                exclusive
                onChange={handleSource}
                size="small"
                aria-label="temperature value source"
              >
                <ToggleButton value="0" aria-label="self" disabled={disabled}>
                  <Typography className="temperatureSource">Self</Typography>
                </ToggleButton>
                <ToggleButton value="1" aria-label="room average" disabled={disabled}>
                  <Typography className="temperatureSource">Room</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export { Thermostat as default };
