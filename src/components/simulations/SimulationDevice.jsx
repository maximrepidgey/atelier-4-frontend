import React from 'react';
import { getDeviceTypeName } from '../../helpers/getDeviceMetadataHelper';


/**
 * SimulationDevice factory that can create any type of device

 * @param device
 * @param isGuest
 * @returns {*}
 * @constructor
 */
const SimulationDevice = ({ device }) => {
  /**
   * Calls the edit device page with the corresponding device ID
   * @param id {int}
   */
  function redirectToEdit() {
    if (device.type === 13) {
      window.location.href = `/editCamera?id=${device.id}`;
    } else {
      window.location.href = `/editSensor?id=${device.id}`;
    }
  }

  /**
   * Gets the right button either for security camera or sensors
   * @returns {*}
   */
  function getButton() {
    return (
      <div className="col col-custom l9 s8">
        <button
          type="button"
          name="button"
          className="waves-effect waves-light z-depth-1 btn-video-active btn-simulations-panel-fix"
          onClick={redirectToEdit}
        >
          {(device.type === 13 ? 'Set custom video feed' : 'Set custom values')}
        </button>
      </div>
    );
  }

  return (
    <div id={device.id} className="collapsible-header">
      <form id="devicesForm" className="device-form">
        <div className="col col-custom l6 m6 s12">
          <div className="col col-custom l12 s12 icons-wrapper">
            <i className="material-icons l1"></i>
            <div className="icon-device l1">
              <img src={device.icon} alt={device.name} />
            </div>
            <div className="device-info col col-custom l12 m6 s12 left-align">
              <p className="device-name">{device.name}</p>
              <p className="device-location">{device.roomName}</p>
              <p className="device-type-name">{getDeviceTypeName(device.type)}</p>
            </div>
          </div>
        </div>
        <div className="device-control col col-custom l6 m6 s12">
          <div className="col col-custom l8 m6 s8" />
          <div>
            {getButton()}
          </div>
        </div>
      </form>
    </div>
  );
};

export { SimulationDevice as default };
