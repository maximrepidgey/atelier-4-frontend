import React, { useContext } from 'react';
import '../../css/scenes.css';
import ScenesContext from '../../context/scenesContext';

/**
 * Configurator to set scene type and target values
 * @param config
 * @returns {*}
 * @constructor
 */
const SceneEffectConfig = (config) => {
  const { dispatchScenes } = useContext(ScenesContext);
  const { dispatchEffects } = useContext(ScenesContext);
  const { effectConfig } = config;
  const [effectName, setEffectName] = React.useState('');
  const [effectType, setEffectType] = React.useState(effectConfig.type);
  const [slider, setSlider] = React.useState(effectConfig.slider);
  const [on, setOn] = React.useState(effectConfig.on);

  const handleDelete = (e) => {
    e.preventDefault();
    dispatchEffects({ type: 'DELETE_SCENE_EFFECT', effectConfig });
  };

  /**
   * Gets effect name by type
   * @param type
   * @returns {string}
   */
  function getEffectName(type) {
    switch (type) {
      case 1:
        return 'Light intensity';
      case 2:
        return 'Temperature';
      case 3:
        return 'Power';
      case 4:
        return 'Curtains aperture';
      default:
        return 'Unknown effect type';
    }
  }

  // Get's measure unit for values according to type
  function getMeasureUnit(type) {
    switch (type) {
      case 2: // Temperature
        return '°C';
      case 1: // Intensity
      case 4: // Curtains aperture
      default:
        return '%';
    }
  }

  /**
   * Sets configs' power switch On/Off
   * @param e
   */
  const toggle = (e) => {
    setOn(e.target.checked);
  };

  /**
   * Gets input element according to scene type
   * @param type
   * @returns {*}
   */
  function getEffectValueInput(type) {
    switch (type) {
      case 1: // Light intensity
      case 4: // Curtains aperture
        return (
          <>
            <div className="col l6">
              <label>Value</label>
              <input
                className="scenes-factory-effect-value-input"
                type="number"
                min="0"
                max="100"
                name={effectName}
                placeholder="0.0"
                value={slider}
                required
                onChange={(e) => {
                  // e.target.value = e.target.value.replace(/[^0-9\.]/g, '');
                  effectConfig.slider = e.target.value;
                  effectConfig.visible = true;
                  setSlider(e.target.value);

                  dispatchEffects({
                    type: 'UPDATE_EFFECTS_STATE', effectConfig,
                  });
                }}
              />
            </div>
            <label className="col l1 scene-effect-value-label">{getMeasureUnit(effectType)}</label>
          </>
        );
      case 2: // Temperature
        return (
          <>
            <div className="col l6">
              <label>Value</label>
              <input
                className="scenes-factory-effect-value-input"
                type="number"
                min="5"
                max="40"
                name={effectName}
                placeholder="5.0"
                value={slider}
                required
                onChange={(e) => {
                  effectConfig.slider = e.target.value;
                  effectConfig.visible = true;
                  setSlider(e.target.value);

                  dispatchEffects({
                    type: 'UPDATE_EFFECTS_STATE', effectConfig,
                  });
                }}
              />
            </div>
            <label className="col l1 scene-effect-value-label">{getMeasureUnit(effectType)}</label>
          </>
        );
      case 3: // Power
        return (
          <div className="col l8">
            <div className="switch scene-effect-config-switch scenes-factory-effect-value-input">
              <label>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => {
                    effectConfig.on = e.target.checked;
                    effectConfig.visible = true;
                    setOn(e.target.checked);
                    // setVisible(true)
                    toggle(e);
                    dispatchScenes({ type: 'UPDATE_STATE' });
                  }}
                />
                <span className="lever" />
              </label>
            </div>
            <div className="col l1 scene-effect-value-label" />
          </div>
        );
      default:
        return (
          <div className=" col l8 scenes-factory-value-input" />
        );
    }
  }

  /**
   * Generates drop down to select scene type
   * @returns {*}
   */
  function getEffectFilter() {
    return (
      <div className=" col l6 effect-configuration">
        <div className=" col l8">
          <label>Controlling</label>
          <select
            required
            className=" browser-default"
            key={effectConfig.type.toString()}
            value={effectConfig.type.toString()}
            disabled={effectConfig.preexisting}
            onChange={(e) => {
              effectConfig.type = parseInt(e.target.value, 10);
              effectConfig.name = getEffectName(parseInt(e.target.value, 10));
              setEffectType(parseInt(e.target.value, 10));
              setEffectName(getEffectName(parseInt(e.target.value, 10)));
              dispatchScenes({ type: 'UPDATE_STATE' });
              effectConfig.preexisting = true;
            }}
          >
            <option value="0" disabled>Choose an effect</option>
            <option value="4">Curtains aperture</option>
            <option value="1">Light intensity</option>
            <option value="3">Power</option>
            <option value="2">Temperature</option>
          </select>
        </div>
        <div className="col l3">
          <div className="row">
            <div className="row">
              {getEffectValueInput(effectType)}
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
      {getEffectFilter()}
    </>
  );
};

export { SceneEffectConfig as default };
