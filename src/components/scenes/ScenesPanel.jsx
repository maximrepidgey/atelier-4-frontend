import React, { useEffect, useReducer, useState } from 'react';
import '../../css/scenes.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import ScenesContext from '../../context/scenesContext';
import scenesReducer from '../../reducers/scenesReducer';
import SceneList from './SceneList';

const params = (new URL(document.location)).searchParams;
const path = window.location.pathname.toLowerCase().split('/');
const host = `${window.location.protocol}//${window.location.hostname}:8080`;
const scenesFetchUrl = `${host}/scenes`;
const guestScenesFetchUrl = `${host}/guests/${params.get('owner')}/scenes`;
const fetchOwnerUrl = `${host}/guests/houses`;
let fetchUrl;

/**
 * Generates a panel with a ScenesPanel
 * @returns {ScenesPanel}
 */
const ScenesPanel = () => {
  const [actionCompleted, setActionCompleted] = React.useState(false);
  const [scenes, dispatchScene] = useReducer(scenesReducer, []);
  const [isDataFound, setIsDataFound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isShared, setIsShared] = useState(true);
  const [isFakeOwner, setFakeOwner] = useState(false);
  const [hasRooms, setHasRooms] = useState(false);
  const [hasDevices, setHasDevices] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [title, setTitle] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

  // Fetches scenes on page load
  useEffect(() => {
    const roomsFetchUrl = `${host}/rooms`;
    const devicesFetchUrl = `${host}/devices`;
    const method = 'GET';
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
    };

    if (path[1] === 'shared') {
      fetchUrl = guestScenesFetchUrl;
    }

    if (path[1] === 'scenes') {
      fetchUrl = scenesFetchUrl;
    }

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

    function fetchDevices() {
      fetch(devicesFetchUrl, {
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
        const fetchedDevices = JSON.parse(data);
        if (fetchedDevices.length > 0) {
          setHasDevices(true);
        } else {
          setIsDataFound(false);
          setIsLoading(false);
        }
      })
      .catch((e) => console.log(e));
    }

    function fetchScenes() {
      fetch(fetchUrl, {
        method,
        headers,
      })
      .then((res) => {
        if (res.status === 200) {
          return res.text();
        }
        if (res.status === 404) {
          setIsShared(false);
          return null;
        }
        return null;
      })
      .then((data) => {
        const fetchedScenes = JSON.parse(data);

        if (fetchedScenes.length === 0) {
          setIsLoading(false);
          setIsDataFound(false);
          setIsShared(false);

          if (path[1] === 'shared') {
            setIsShared(false);
          } else {
            setIsDataFound(false);
          }
        } else {
          fetchedScenes.sort((a, b) => {
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
          dispatchScene({ type: 'POPULATE_SCENES', scenes: fetchedScenes });
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        setIsNetworkError(true);
      });
    }

    if (path[1].toLowerCase() === 'shared' && params.get('owner')) {
      setIsGuest(true);

      fetch(fetchOwnerUrl, {
        method,
        headers,
      })
      .then((res) => {
        if (res.status === 200) {
          return res.text();
        }
        setIsShared(false);
        setFakeOwner(true);
        return null;
      })
      .then((data) => {
        if (data !== null) {
          const owners = JSON.parse(data);
          const owner = owners.filter((o) => o.username.toLowerCase() === params.get('owner').toLowerCase())[0];

          if (!owner) {
            window.location.href = '/sharedWithMe';
          }

          const ownerName = owner.fullname.split(' ')[0];
          const nameEndsInS = ownerName[ownerName.length - 1].toLowerCase() === 's';

          if (nameEndsInS) {
            setTitle(`${ownerName}' Scenes`);
          } else {
            setTitle(`${ownerName}'s Scenes`);
          }
        }
      })
      .then(() => fetchScenes())
      .catch((e) => console.log(e));
    } else { // House view
      setTitle('My Scenes');
      fetchRooms();

      if (hasRooms) {
        fetchDevices();
        if (hasDevices) {
          fetchScenes();
        }
      }
    }

    setActionCompleted(false);
  }, [hasRooms, hasDevices]);

  // Fetches scenes on state change, on Reducer's actions completion
  useEffect(() => {
    if (actionCompleted) {
      fetch(fetchUrl, {
        method: 'GET',
        headers: {
          user: localStorage.getItem('username'),
          'session-token': localStorage.getItem('session_token'),
        },
      })
      .then((res) => {
        if (res.status === 401) {
          this.props.logOut(1);
        } else if (res.status === 200) {
          return res.text();
        } else {
          return null;
        }
      })
      .then((data) => {
        if (data === null) {
          setIsDataFound(false);
        } else {
          const fetchedScenes = JSON.parse(data).sort((a, b) => {
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
          if (fetchedScenes.length === 0) {
            setIsDataFound(false);
          }
          dispatchScene({ type: 'POPULATE_SCENES', scenes: fetchedScenes });
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        setIsNetworkError(true);
      });
      setActionCompleted(false);
    }
  }, [scenes, actionCompleted]);

  // Discards cached state and extract the next one
  useEffect(() => {
  }, [scenes]);

  const errorMessage = () => {
    if (path[1] === 'scenes') {
      if (!hasRooms) {
        return (
          <>
            <span>You haven't added any rooms yet.&nbsp;</span>
            <a href="/addRoom">Add one now</a>
            <span>.</span>
          </>
        );
      }

      if (!hasDevices) {
        return (
          <>
            <span>You haven't added any devices yet.&nbsp;</span>
            <a href="/addDevice">Add one now</a>
            <span>.</span>
          </>
        );
      }
    }

    if (!isDataFound || isFakeOwner) {
      if (path[1] === 'scenes') return "You haven't added any scenes yet. Please add a new one.";
      if (path[1] === 'shared') {
        return "This owner hasn't shared any scenes with you yet.";
      }
    }
    if (isDataFound && !isShared && !isNetworkError) {
      return "This owner hasn't shared any scenes with you yet.";
    }

    if (isNetworkError) {
      return 'We are sorry. There was an error.';
    }
  };

  return (
    <ScenesContext.Provider value={{ scenes, dispatchScene, setActionCompleted }}>
      <div id="wrapper" className="scenes">
        <div className="container">
          <article className="row row-scene row-scene-custom">
            <div id="content">
              <section
                className={!isGuest ? 'scene-content-box z-depth-2' : 'scene-content-box-shared z-depth-2'}
              >
                <div className="headline-box row row-custom">
                  <h3 className="col col-custom l8 left-align headline-title">{title}</h3>
                  {!isGuest
                    ? (
                      <a href="/addScene">
                        <i disabled={!hasDevices} className="col col-custom l1 btn waves-effect waves-light btn-primary-circular right material-icons">add</i>
                      </a>
                    )
                    : (
                      <Link to={{
                        pathname: '/shared',
                        search: `?owner=${params.get('owner')}&view=0`,
                      }}
                      >
                        <div
                          className="col col-custom l1 btn waves-effect waves-light btn-primary-semi-circular right"
                        >
                          See
                          devices
                        </div>
                      </Link>
                    )}
                </div>

                <div className={(isLoading) ? 'centered-loading-data-message' : 'display-none'}>
                  <ColorCircularProgress />
                </div>

                <div
                  className={(!isDataFound || isNetworkError) ? 'centered-loading-data-message' : 'display-none'}
                >
                  <p className={(isNetworkError && isShared) ? 'error-message' : undefined}>{errorMessage()}</p>
                </div>

                {(isDataFound && !isNetworkError && !isLoading)
                  ? (
                    <ul>
                      <li className="scenes-panel row">
                        <SceneList isGuest={isGuest} />
                      </li>
                    </ul>
                  )
                  : undefined}
              </section>
            </div>
          </article>
        </div>
      </div>
    </ScenesContext.Provider>
  );
};

export { ScenesPanel as default };
