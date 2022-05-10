import React, { useContext, useEffect } from 'react';
import '../../css/scenes.css';
import AutomationsContext from '../../context/automationsContext';

/**
 * Configurator to set scene conditionType and target values
 * @returns {*}
 * @constructor
 * @param blankCondition
 */
const Condition = (blankCondition) => {
  const { condition } = blankCondition;
  const { devices } = blankCondition;
  const { getRandomKey, dispatchConditions } = useContext(AutomationsContext);
  const [device, setDevice] = React.useState({});
  const [sourceId, setSourceId] = React.useState(condition.sourceId);
  const [conditionType, setConditionType] = React.useState(condition.conditionType);
  const [value, setValue] = React.useState(condition.value);
  const handleDelete = (e) => {
    e.preventDefault();
    dispatchConditions({ type: 'DELETE_CONDITION', condition });
  };

  useEffect(() => {
  }, [sourceId]);

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
              max="100"
              placeholder="0.0"
              value={value}
              required
              onChange={(e) => {
                setValue(e.target.value);
                condition.value = e.target.value;
                condition.effectValue = parseInt(e.target.value, 10);
                condition.visible = true;

                dispatchConditions({ conditionType: 'UPDATE_TRIGGER_STATE', condition });
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
   * Generates drop down to select condition
   * @returns {*}
   */
  function getConditionFilter() {
    return (
      <div className=" col l12 effect-configuration">
        <div className=" col l5">
          <label>Source</label>
          <select
            required
            className=" browser-default"
            key={getRandomKey()}
            value={condition.sourceId.toString()}
            // disabled={condition.preexisting}
            onChange={(e) => {
              condition.device = getDevice(parseInt(e.target.value, 10));
              condition.sourceId = parseInt(e.target.value, 10);
              setDevice(condition.device);
              setSourceId(condition.device.id);
              setConditionType(parseInt(e.target.value, 10));
              dispatchConditions({ conditionType: 'UPDATE_STATE' });
              condition.preexisting = true;
            }}
          >
            <option value="0" disabled>Choose a device</option>
            {devices.map((d) =>
              <option key={getRandomKey()} value={d.id.toString()}>{`${d.name} - ${d.roomName}`}</option>)}
          </select>
        </div>
        {device
         && <div className=" col l4">
           <label>Condition</label>
           <select
             required
             className=" browser-default"
             key={getRandomKey()}
             value={condition.conditionType.toString()}
             // disabled={condition.conditionType}
             onChange={(e) => {
               condition.conditionType = parseInt(e.target.value, 10);
               setConditionType(condition.conditionType);
               dispatchConditions({ conditionType: 'UPDATE_STATE' });
               condition.preexisting = true;
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
      {getConditionFilter()}
    </>
  );
};

export { Condition as default };
