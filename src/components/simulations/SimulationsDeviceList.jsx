import React, { useContext } from 'react';
import SimulationDevice from './SimulationDevice';
import DevicesContext from '../../context/devicesContext';


/**
 * Generates a list of nested devices
 * @returns {SimulationsDeviceList}
 */
const SimulationsDeviceList = () => {
  const { devices } = useContext(DevicesContext);
  let id = 0;

  return devices.map((device) => <SimulationDevice key={id += 1} device={device} />);
};

export { SimulationsDeviceList as default };
