import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import '../../css/toggle-buttons.css';
import DevicesContext from '../../context/devicesContext';


function StatelessDimmerButtons({ device }) {
  const { dispatch, setActionCompleted } = useContext(DevicesContext);

  /**
   * Synchronizes and re-renders devices state for view purposes dispatching the
   * action to the devices reducer. Then PUTs the new slider value to the API
   * @param e {event}
   */
  const handleClick = (e) => {
    let val;

    if (e.currentTarget.value === 'increase') {
      val = 1;
    } else {
      val = -1;
    }

    device.slider = val;
    dispatch({ type: 'SYNC_DEVICES', device });
    dispatch({ type: 'MODIFY_DEVICE', device, setActionCompleted });
  };

  return (
    <ButtonGroup variant="contained" size="small" aria-label="contained primary button group">
      <Button value="decrease" onClick={handleClick}>
        <i className="waves-effect waves-light right material-icons"> remove </i>
      </Button>
      <Button value="increase" onClick={handleClick}>
        <i className="waves-effect waves-light right material-icons"> add </i>
      </Button>
    </ButtonGroup>
  );
}

export { StatelessDimmerButtons as default };
