/**
 * Generic fetch to POST and PUT
 * @param fetchUrl
 * @param method
 * @param body
 */
function doFetch(fetchUrl, method, body) {
  const host = `${window.location.protocol}//${window.location.hostname}:8080`;
  const headers = {
    user: localStorage.getItem('username'),
    'session-token': localStorage.getItem('session_token'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const devicesFetchUrl = `${host}/devices${fetchUrl}`;

  fetch(devicesFetchUrl, {
    method,
    headers,
    body,
  })
  .then((res) => {
    if (res.status === 200 || res.status === 204) {
      console.log(`${method} successful!`);
    } else {
      console.log(`${method} unsuccessful!`);
    }
    return res;
  })
  .catch((error) => console.log(error));
}

/**
 * This reducer controls the actions triggered by the events
 * handled by the device components and its children
 * @param state
 * @param action
 * @returns {state[]}
 */
const devicesReducer = (state, action) => {
  switch (action.type) {
    case 'POPULATE_DEVICES':
      // console.log('Dispatch: POPULATE_DEVICES');
      action.devices.forEach((device) => {
        if (device.slider !== null && device.type !== 11) { // Does not apply to Thermostat
          device.slider *= 100;
        }
      });
      return action.devices;

    case 'UPDATE_STATE':
      // console.log('Dispatch: UPDATE_STATE');
      if (action.actionCompleted) {
        state.forEach((d) => {
          action.devices.forEach((device) => {
            if (d.id === device.id) {
              if (device.on !== null) {
                d.on = device.on;
              }

              if (device.slider !== null) {
                if (device.type === 11) {
                  d.slider = device.slider;
                } else {
                  d.slider = device.slider * 100;
                }
              }

              if (device.source !== null) {
                d.source = device.source;
              }

              if (device.video !== null) {
                d.video = device.video;
              }
            }
          });
        });
      }
      return [...state];

    case 'UPDATE_SENSORS':
      // console.log('Dispatch: UPDATE_SENSORS');
      state.forEach((d) => {
        action.sensors.forEach((sensor) => {
          if (d.id === sensor.id) {
            d.label = sensor.label;
            d.averageTemp = sensor.averageTemp;
          }
        });
      });
      return [...state];

    case 'MODIFY_DEVICE':
      // console.log('Dispatch: MODIFY_DEVICE');
      let fetchUrl = '';
      let body = {};

      if (action.device.reset) { // SmartPlug
        fetchUrl = `/reset/${action.device.id}`;
        action.device.reset = false;
        body = {};
      } else {
        fetchUrl = `/${action.device.id}`;

        switch (action.device.type) {
          case 2: // DimmableLight
          case 4: // DimmableSwitch
            body.on = action.device.on;
            body.slider = action.device.slider / 100;
            break;
          case 5: // StatelessDimmableSwitch, doesn't need division by 100
            body.slider = action.device.slider;
            break;
          case 11: // Thermostat
            body.slider = action.device.slider;
            body.state = action.device.state;
            body.source = action.device.source;
            body.on = action.device.on;
            break;
          case 12: // SmartCurtains
            body.slider = action.device.slider / 100;
            break;
          default: // Light, Switch, SmartPlug, SecurityCamera
            body.on = action.device.on;
            break;
        }
      }

      doFetch(fetchUrl, 'PUT', JSON.stringify(body));
      action.setActionCompleted(true);
      return state;

    case 'SYNC_DEVICES':
      // console.log('Dispatch: SYNC_DEVICES');

      state.forEach((device) => {
        if (device.switched) {
          device.switched.forEach((parentId) => {
            if (parentId === action.device.id) {
              // If parent is turned ON/OFF
              if (action.device.clicked && device.on !== null) {
                device.on = action.device.on;
              }

              // If child is ON
              if (device.on && action.device.on && device.slider !== null) {
                if (device.on !== null) {
                  device.on = action.device.on;
                }

                // Slider for non stateless dimmer children
                if (device.slider && action.device.type !== 5 && device.type !== 11) {
                  device.slider = action.device.slider;
                }

                // Slider for stateless dimmer children
                if (device.on && action.device.type === 5) {
                  const newSlider = device.slider + action.device.slider;
                  if (newSlider > 100) {
                    device.slider = 100;
                  } else if (newSlider < 0) {
                    device.slider = 0;
                  } else {
                    device.slider = newSlider;
                  }
                }
              }
            }
          });
        }

        // Controls original and child copies of same device
        if (action.device.clicked && device.id === action.device.id) {
          if (device.slider) {
            device.slider = action.device.slider;
          }

          if (device.on !== null) {
            device.on = action.device.on;
          }

          if (device.source !== null) {
            device.source = action.device.source;
          }
        }
      });

      action.device.clicked = false;
      return [...state];

    default:
      return state;
  }
};
export { devicesReducer as default };
