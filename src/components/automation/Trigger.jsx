import React, { useContext, useEffect } from 'react';
import '../../css/scenes.css';
import AutomationsContext from '../../context/automationsContext';


/**
 * Configurator to set scene conditionType and target values
 * @returns {*}
 * @constructor
 * @param blankTrigger
 */
const Trigger = (blankTrigger) => {
  const { trigger } = blankTrigger;
  const { devices } = blankTrigger;
  const { automations, getRandomKey, dispatchTriggers } = useContext(AutomationsContext);
  const [device, setDevice] = React.useState({});
  const [sourceId, setSourceId] = React.useState(trigger.sourceId);
  const [conditionType, setConditionType] = React.useState(trigger.conditionType);
  const [value, setValue] = React.useState(trigger.value);

  const handleDelete = (e) => {
    e.preventDefault();
    dispatchTriggers({ type: 'DELETE_TRIGGER', trigger });
  };

  useEffect(() => {
    if (conditionType > 0 && setSourceId > 0) {
      trigger.valid = true;
    }
  }, [trigger, automations, conditionType, setSourceId]);


  useEffect(() => {
  }, [trigger, sourceId, value]);

  /**
   * Returns a device by its ID
   * @param deviceId
   * @returns {*}
   */
  function getDevice(deviceId) {
    return devices.filter((d) => d.id === deviceId)[0];
  }

  // Get's measure unit for values according to conditionType
  function getMeasureUnit(type) {
    switch (type) {
      case 8: // Light Sensors
        return 'lm';
      case 9: // Temp Sensors
        return '°C';
      default:
        return '%';
    }
  }

  /**
   * Gets input element according to scene conditionType
   * @returns {*}
   */
  function getValueInput() {
    if (conditionType === 5 || conditionType === 6) {
      return (
        <>
          <div className="col l7">
            <label>Value</label>
            <input
              className="scenes-factory-effect-value-input"
              type="number"
              min="0"
              // max="100"
              placeholder="0.0"
              value={trigger.value}
              required
              onChange={(e) => {
                setValue(e.target.value);
                trigger.value = e.target.value;
                trigger.effectValue = parseInt(e.target.value, 10);
                trigger.visible = true;

                // dispatchTriggers({ conditionType: 'UPDATE_TRIGGER_STATE', trigger });
              }}
            />
          </div>
          <label className="col l1 scene-effect-value-label"> {getMeasureUnit()}</label>
        </>
      );
    }
    return (
      <div className=" col l7 scenes-factory-value-input" />
    );
  }

  /**
   * Generates drop down to select trigger
   * @returns {*}
   */
  function getTriggerFilter() {
    return (
      <div className=" col l12 effect-configuration">
        <div className=" col l5">
          <label>Source</label>
          <select
            required
            className=" browser-default"
            key={getRandomKey()}
            value={trigger.sourceId.toString()}
            // disabled={trigger.preexisting}
            onChange={(e) => {
              trigger.device = getDevice(parseInt(e.target.value, 10));
              trigger.sourceId = parseInt(e.target.value, 10);
              setDevice(trigger.device);
              setSourceId(trigger.device.id);
              setConditionType(parseInt(e.target.value, 10));
              dispatchTriggers({ conditionType: 'UPDATE_STATE' });
              trigger.preexisting = true;
            }}
          >
            <option value="0" disabled>Choose a device</option>
            {devices.map((d) =>
              <option key={getRandomKey()} value={d.id.toString()}>{`${d.name} - ${d.roomName}`}</option>)}
          </select>
        </div>
        {device
         && <div className=" col l4">
           <label>Trigger when</label>
           <select
             required
             className=" browser-default"
             key={getRandomKey()}
             value={trigger.conditionType.toString()}
             // disabled={trigger.conditionType}
             onChange={(e) => {
               trigger.conditionType = parseInt(e.target.value, 10);
               setConditionType(trigger.conditionType);
               trigger.preexisting = true;
               // dispatchTriggers({ type: 'UPDATE_STATE', trigger });
             }}
           >
             <option value="0" disabled>Choose a condition</option>
             <option value="1">Power On</option>
             <option value="2">Power Off</option>
             <option value="3">Motion detected</option>
             <option value="4">Motion not detected</option>
             <option value="5">Over or equal to</option>
             <option value="6">Under or equal to</option>
             )}
           </select>
         </div>
        }
        <div className="col l3">
          <div className="row">
            <div className="row">
              {getValueInput()}
              <div className="col l1">
                <i
                  className="scene-item material-icons btn-icon scene-effect-item"
                  onClick={(e) => handleDelete(e)}
                >
                  highlight_off
                </i>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }

  return (
    <>
      {getTriggerFilter()}
    </>
  );
};

export { Trigger as default };
