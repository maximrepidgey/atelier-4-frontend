import React, { useContext } from 'react';
import Device from './Device';
import DevicesContext from '../../context/devicesContext';


/**
 * Generates a list of nested devices
 * @returns {DeviceList}
 */
const DeviceList = (isGuest) => {
  const { devices } = useContext(DevicesContext);

  const expandedDevices = [];
  const children = JSON.parse(JSON.stringify(devices));
  let id = 0;

  // Sets a 'child' flag to identify each parent device's children
  devices.forEach((parent) => {
    expandedDevices.push(parent);

    if (parent.switches) {
      parent.parent = true;

      children.forEach((child) => {
        if (child.switched !== null) {
          child.switched.forEach((parentId) => {
            if (parentId === parent.id) {
              child.child = true;
              expandedDevices.push(child);
            }
          });
        }
      });
    }
  });

  return expandedDevices.map((device) => (
    <Device key={id++} device={device} isGuest={isGuest} />
  ));
};

export { DeviceList as default };
