import React, { useEffect, useState, useReducer } from 'react';
import DevicesContext from '../../context/devicesContext';
import devicesReducer from '../../reducers/devicesReducer';
import DeviceList from './SimulationsDeviceList';
import '../../css/collapsible-component.css';
import '../../css/collapsible-devices.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';


/**
 * Generates a panel with a SimulationsPanel
 * @returns {SimulationsPanel}
 */
const SimulationsPanel = () => {
  const [actionCompleted, setActionCompleted] = React.useState(false);
  const [devices, dispatch] = useReducer(devicesReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [hasDevices, setHasDevices] = useState(false);
  const [hasRooms, setHasRooms] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

  // Fetches devices on page load
  useEffect(() => {
    const host = `${window.location.protocol}//${window.location.hostname}:8080`;
    const roomsFetchUrl = `${host}/rooms`;
    const devicesFetchUrl = `${host}/devices`;
    const method = 'GET';
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
    };

    function fetchRooms() {
      fetch(roomsFetchUrl, {
        method,
        headers,
      })
      .then((res) => {
        if (res.status === 200) {
          return res.text();
        }
        return null;
      })
      .then((data) => {
        const fetchedRooms = JSON.parse(data);
        if (fetchedRooms.length > 0) {
          setHasRooms(true);
        } else {
          setShowMessage(true);
        }
        setIsLoading(false);
      })
      .catch((e) => console.log(e));
    }

    function fetchDevices() {
      setShowMessage(false);

      fetch(devicesFetchUrl, {
        method,
        headers,
      })
      .then((res) => {
        if (res.status === 401) {
          this.props.logOut(1);
        } else if (res.status === 200) {
          return res.text();
        } else if (res.status === 404) {
          return null;
        }
        return null;
      })
      .then((data) => {
        let fetchedDevices = JSON.parse(data);

        if (fetchedDevices.length > 0) {
          fetchedDevices = fetchedDevices.filter((d) => d.type === 7
                                                        || d.type === 8
                                                        || d.type === 9
                                                        || d.type === 10
                                                        || d.type === 11
                                                        || d.type === 13);

          if (fetchedDevices.length !== 0) {
            setHasDevices(true);
            fetchedDevices.sort((a, b) => {
              const keyA = a.name.toLowerCase();
              const keyB = b.name.toLowerCase();

              if (keyA === keyB) {
                if (a.id < b.id) {
                  return -1;
                }
                if (a.id > b.id) {
                  return 1;
                }
              }
              if (keyA < keyB) {
                return -1;
              }
              return 1;
            });
            dispatch({ type: 'POPULATE_DEVICES', devices: fetchedDevices });
          } else {
            setShowMessage(true);
            setHasDevices(false);
          }
        } else {
          setShowMessage(true);
        }
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setShowMessage(true);
        setIsLoading(false);
        setIsNetworkError(true);
      });
    }

    fetchRooms();
    if (hasRooms) {
      fetchDevices();
    }
    setActionCompleted(false);
  }, [hasRooms]);

  // Discards cached state and extract the next one
  useEffect(() => {
  }, [devices]);

  const errorMessage = () => {
    console.log(`isLoading:      ${isLoading}`);
    console.log(`hasDevices:     ${hasDevices}`);
    console.log(`hasRooms:       ${hasRooms}`);
    console.log(`showMessage:    ${showMessage}`);
    console.log(`isNetworkError: ${isNetworkError}`);
    console.log('');

    if (showMessage) {
      if (!hasRooms) {
        return (
          <>
            <span>You haven&#39;t added any rooms yet.&nbsp;</span>
            <a href="/addRoom">Add one now</a>
            <span>.</span>
          </>
        );
      }

      if (hasRooms && !hasDevices) {
        return (
          <>
            <span>You haven&#39;t added any sensors or security cameras yet.&nbsp;</span>
            <a href="/addDevice">Add one now</a>
            <span>.</span>
          </>
        );
      }

      if (isNetworkError) {
        return <span className="error-message">We are sorry. There was an error.</span>;
      }
      return '';
    }
  };

  return (
    <DevicesContext.Provider value={{
      devices, dispatch, actionCompleted, setActionCompleted,
    }}
    >
      <div id="wrapper" className="devices">
        <main>
          <article className="row row-custom">
            <div id="content">
              <section className="content-box-collapsible z-depth-2">
                <div className="headline-box row row-custom">
                  <h3 className="col col-custom l8 left-align headline-title">Simulations panel</h3>
                </div>
                <div className={(isLoading) ? 'centered-loading-data-message' : undefined}>
                  {(isLoading) && <ColorCircularProgress />}
                </div>
                <div className={(isLoading || showMessage) ? 'centered-loading-data-message' : undefined}>
                  {showMessage && <p>{errorMessage()}</p>}
                </div>
                <ul className={hasDevices ? 'collapsible expandable expandable-component' : undefined}>
                  <li className="row row-custom">
                    <DeviceList />
                  </li>
                </ul>
              </section>
            </div>
          </article>
        </main>
      </div>
    </DevicesContext.Provider>
  )
    ;
};

export { SimulationsPanel as default };
