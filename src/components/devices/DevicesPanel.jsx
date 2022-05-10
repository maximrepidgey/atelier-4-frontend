import React, { useEffect, useState, useReducer, useCallback } from 'react';
import DevicesContext from '../../context/devicesContext';
import devicesReducer from '../../reducers/devicesReducer';
import DeviceList from './DeviceList';
import '../../css/collapsible-component.css';
import '../../css/collapsible-devices.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';


const host = `${window.location.protocol}//${window.location.hostname}:8080`;
const params = (new URL(document.location)).searchParams;
const path = window.location.pathname.toLowerCase().split('/');
const devicesFetchUrl = `${host}/devices`;
const roomDevicesFetchUrl = `${host}/rooms/${params.get('id')}/devices`;
const fetchOwnerUrl = `${window.location.protocol}//${window.location.hostname}:8080/guests/houses`;
const guestDevicesFetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/guests/${params.get('owner')}/devices`;
const fetchRoomUrl = `${host}/rooms/${params.get('id')}`;
let fetchUrl;
let roomBackground;

/**
 * Generates a panel with a DevicePanel
 * @returns {*}
 */
const DevicesPanel = () => {
    const [actionCompleted, setActionCompleted] = React.useState(true);
    const [devices, dispatch] = useReducer(devicesReducer, []);
    const [isDataFound, setIsDataFound] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isShared, setIsShared] = useState(true);
    const [isFakeOwner, setFakeOwner] = useState(false);
    const [fetchMode, setFetchMode] = useState('');
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [title, setTitle] = useState('');
    const [isRoom, setIsRoom] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [hasDevices, setHasDevices] = useState(false);
    const [hasRooms, setHasRooms] = useState(false);
    const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

    // Sets the fetchUrl to access the right route and sets the fetchMode to show the right error messages
    useEffect(() => {
      if (path[1] === 'devices') {
        fetchUrl = devicesFetchUrl;
        setFetchMode('devices');
      }

      if (path[1] === 'room' && params.get('id')) {
        fetchUrl = roomDevicesFetchUrl;
        setFetchMode('rooms');
      }

      if (path[1] === 'shared') {
        fetchUrl = guestDevicesFetchUrl;
        setFetchMode('shared');
      }
    }, [fetchMode]);

    const sortDevices = useCallback((devicesToSort) => {
      devicesToSort.sort((a, b) => {
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
    }, []);

    // Corroborates if user has rooms created and disables the add button
    useEffect(() => {
      const roomsFetchUrl = `${host}/rooms`;
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
            setIsDataFound(false);
            setIsLoading(false);
          }
        })
        .catch((e) => console.log(e));
      }

      fetchRooms();
    }, []);

    // Fetches devices and room info on page load
    useEffect(() => {
      const method = 'GET';
      const headers = {
        user: localStorage.getItem('username'),
        'session-token': localStorage.getItem('session_token'),
      };

      function fetchDevices() {
        fetch(fetchUrl, {
          method,
          headers,
        })
        .then((res) => {
          if (res.status === 401) {
            this.props.logOut(1);
            setIsShared(false);
          } else if (res.status === 200) {
            return res.text();
          } else if (res.status === 404) {
            setIsShared(false);
            return null;
          }
          return null;
        })
        .then((data) => {
          const fetchedDevices = JSON.parse(data);

          if (fetchedDevices.length === 0) {
            setHasDevices(false);
            setIsLoading(false);

            if (fetchMode === 'shared') {
              setIsShared(false);
            } else {
              setIsDataFound(false);
            }
          } else {
            setHasDevices(true);
            sortDevices(fetchedDevices);

            dispatch({ type: 'POPULATE_DEVICES', devices: fetchedDevices });
            setIsLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
          setIsLoading(false);
          setIsNetworkError(true);
        });
      }

      if (path[1].toLowerCase() === 'room' && params.get('id')) {
        setIsRoom(true);

        fetch(fetchRoomUrl, {
          method,
          headers,
        })
        .then((res) => {
          if (res.status === 401) {
            this.props.logOut(1);
          } else if (res.status === 200) {
            return res.text();
          }
          return null;
        })
        .then((data) => {
          const room = JSON.parse(data);
          roomBackground = room.background !== null && room.background;
          setTitle(room.name);
        })
        .then(() => fetchDevices())
        .catch((e) => console.log(e));
      } else if (path[1].toLowerCase() === 'shared' && params.get('owner')) {
        setIsGuest(true);

        fetch(fetchOwnerUrl, {
          method,
          headers,
        })
        .then((res) => {
          if (res.status === 200) {
            return res.text();
          }
          setTitle(`${params.get('owner')}'s House`);
          setIsShared(false);
          setFakeOwner(true);
          return null;
        })
        .then((data) => {
          if (data !== null) {
            const owners = JSON.parse(data);
            const owner = owners.filter((o) => o.username.toLowerCase() === params.get('owner').toLowerCase())[0];
            const ownerName = owner.fullname.split(' ')[0];
            const nameEndsInS = ownerName[ownerName.length - 1].toLowerCase() === 's';

            if (nameEndsInS) {
              setTitle(`${ownerName}' House`);
            } else {
              setTitle(`${ownerName}'s House`);
            }
          }
        })
        .then(() => fetchDevices())
        .catch((e) => console.log(e));
      } else { // House view
        setTitle('My Devices');
        fetchDevices();
      }

      setActionCompleted(false);
    }, [fetchMode, sortDevices]);

    // Discards cached state and extract the next one
    useEffect(() => {
    }, [devices, isGuest]);

    // Makes interval fetches for state updating
    useEffect(() => {
        let tempUpdatedDevices = [];
        const interval = setInterval(async () => {
          const method = 'GET';
          const headers = {
            user: localStorage.getItem('username'),
            'session-token': localStorage.getItem('session_token'),
          };

          async function fetchDevices() {
            return (await fetch(fetchUrl, {
              method,
              headers,
            })).json();
          }

          try {
            tempUpdatedDevices = await fetchDevices();
            sortDevices(tempUpdatedDevices);

            dispatch({ type: 'POPULATE_DEVICES', devices: tempUpdatedDevices, actionCompleted });
          } catch
            (e) {
            console.log(e);
          }
        }, 2000);
        return () => {
          clearInterval(interval);
        };
      },
      [devices, sortDevices, actionCompleted]);

    function redirectToAdd() {
      if (isRoom) {
        return `/addDevice?room=${params.get('id')}`;
      }
      return '/addDevice';
    }

    // eslint-disable-next-line consistent-return
    const errorMessage = () => {
      if (!isDataFound || isFakeOwner) {
        if (fetchMode === 'devices' || fetchMode === 'rooms') {
          if (!hasRooms) {
            return (
              <>
                <span>You haven&#39;t added any rooms yet.&nbsp;</span>
                <a href="/addRoom">Add one now</a>
                <span>.</span>
              </>
            );
          }

          if (!hasDevices) {
            return (
              <>
                <span>You haven&#39;t added any devices yet. Add one now.</span>
              </>
            );
          }
        }
        if (fetchMode === 'shared') {
          return "This owner hasn't shared any devices with you yet.";
        }
      }
      if (isDataFound && !isShared && !isNetworkError) {
        return "This owner hasn't shared any devices with you yet.";
      }

      if (isNetworkError) {
        return 'We are sorry. There was an error.';
      }
    };

    return (
      <DevicesContext.Provider value={{
        devices, dispatch, isRoom, actionCompleted, setActionCompleted,
      }}
      >
        <div id="wrapper" className="devices">
          <main style={{
            backgroundImage: isRoom && `url('${roomBackground}')`,
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
          }}
          >
            <article className="row row-custom">
              <div id="content">
                <section
                  className={(isRoom) ? 'content-box-collapsible z-depth-2 content-box-transparency' : 'content-box-collapsible z-depth-2'}
                >
                  <div className="headline-box row row-custom">
                    <h3 className="col col-custom l8 left-align headline-title">{title}</h3>
                    {!isGuest
                      ? (
                        <a href={redirectToAdd()}>
                          <i className="col col-custom l1 btn waves-effect waves-light btn-primary-circular right material-icons" disabled={!hasRooms}>add</i>
                        </a>
                      )

                      : (
                        <Link to={{
                          pathname: '/shared',
                          search: `?owner=${params.get('owner')}&view=1`,
                        }}
                        >
                          <div
                            className="col col-custom l1 btn waves-effect waves-light btn-primary-semi-circular right"
                          >
                            See
                            scenes
                          </div>
                        </Link>
                      )}
                  </div>
                  <div className={(isLoading) ? 'centered-loading-data-message' : 'hidden'}>
                    <ColorCircularProgress />
                  </div>
                  <div
                    className={(!isDataFound || isNetworkError) ? 'centered-loading-data-message' : 'hidden'}
                  >
                    <p className={(isNetworkError && isShared) ? 'error-message' : undefined}>{errorMessage()}</p>
                  </div>
                  <ul className={(isLoading || !isDataFound || !isShared || isNetworkError) ? 'hidden' : 'collapsible expandable expandable-component'}>
                    <li className="row row-custom">
                      <DeviceList isGuest={isGuest} />
                    </li>
                  </ul>
                </section>
              </div>
            </article>
          </main>
        </div>
      </DevicesContext.Provider>
    );
  }
;

export { DevicesPanel as default };
