/*
 ** Code references for devices **
 1: Light
 2: DimmableLight
 3: Switch
 4: DimmableSwitch
 5: StatelessDimmableSwitch
 6: SmartPlug
 7: HumiditySensor
 8: LightSensor
 9: TempSensor
 10: MotionSensor
 11: Thermostat
 12: SmartCurtains
 13: SecurityCamera
 */

/**
 * Gets a Material-UI icon name for parent or child devices
 * @param {object} device
 * @returns {string} SVG imported icon
 */
// eslint-disable-next-line consistent-return
export function getRowIcon(device) {
  if (device.parent) {
    return 'more_vert';
  }

  if (device.child) {
    return 'arrow_drop_up';
  }
}

/**
 * Returns the device type name
 * @param type {int}
 * @returns {string}
 */
export function getDeviceTypeName(type) {
  switch (type) {
    // Regular lights (w/o intensity)
    case 1:
      return 'Light';

    // Smart lights (with intensity state)
    case 2:
      return 'Dimmable light';

    // Light controllers
    case 3:
      return 'Switch';
    case 4:
      return 'Smart dimmer';
    case 5:
      return 'Dimmer';
    case 6:
      return 'Smart plug';

    // Sensors
    case 7:
      return 'Humidity sensor';
    case 8:
      return 'Light sensor';
    case 9:
      return 'Temperature sensor';
    case 10:
      return 'Motion sensor';

    // Automation
    case 11:
      return 'Thermostat';

    // Other
    case 12:
      return 'Smart curtains';

    // Surveillance
    case 13:
      return 'Security camera';

    default:
      return 'Unknown device';
  }
}

/**
 * Returns the range for a slider according to device type
 * @param type
 * @returns {number[]} [min][max]
 */
export function getMinMax(device) {
  switch (device.type) {
    case 11:
      return [0, 100];
    default:
      return [0, 100]
  }
}

/**
 * Returns the min and max marks to show on a slider according to device type
 * @returns {[{label: string, value: number}, {label: string, value: number}]}
 * @param device
 */
export function getSliderMarks(device) {
  const lightMarks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 100,
      label: '100%',
    },
  ];

  const temperatureMarks = [
    {
      value: 5,
      label: '5°C',
    },
    {
      value: 40,
      label: '40°C',
    },
  ];

  const curtainsMarks = [
    {
      value: 0,
      label: 'Closed',
    },
    {
      value: 100,
      label: 'Open',
    },
  ];

  switch (device.type) {
    case 11:
      return temperatureMarks;
    case 12:
      return curtainsMarks;
    default:
      return lightMarks;
  }
}
