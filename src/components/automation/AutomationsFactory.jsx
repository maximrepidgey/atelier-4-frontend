import React, { useCallback, useEffect, useReducer } from 'react';
import AutomationsContext from '../../context/automationsContext';
import '../../css/scenes.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import automationsReducer from '../../reducers/automationsReducer';
// import triggersReducer from '../../reducers/automationsReducer';
// import conditionsReducer from '../../reducers/automationsReducer';
import TransferList from './TransferList';
import Trigger from './Trigger';
import Condition from './Condition';


const params = (new URL(document.location)).searchParams;
const path = window.location.pathname.toLowerCase().split('/');
let hasName = false;

/**
 * Creates customizable automations
 * @returns {*}
 * @constructor
 */
const AutomationsFactory = () => {
  // const [automations, dispatchAutomations] = useReducer(automationsReducer, []);
  const [automations, setAutomations] = React.useState([]);
  const [devices, setDevices] = React.useState([]);
  const [left, setLeft] = React.useState([]);
  const [right, setRight] = React.useState([]);
  const [name, setName] = React.useState('');
  const [triggers, dispatchTriggers] = useReducer(automationsReducer, []);
  const [conditions, dispatchConditions] = useReducer(automationsReducer, []);
  const [globalRight, setGlobalRight] = React.useState([]);
  const [confirmation, setConfirmation] = React.useState(false);
  const [isValid, setValid] = React.useState(true);
  const [isLoading, setLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [actionCompleted, setActionCompleted] = React.useState(false);
  const [id, setId] = React.useState(0);
  const isEditing = path[1].toLowerCase() === 'editautomation';
  const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

  function getRandomKey() {
    return Math.floor((Math.random() * 1000) * 55);
  }

  const blankTrigger = {
    id: getRandomKey(),
    conditionType: 0,
    sourceId: 0,
    effectValue: 0,
  };

  const blankCondition = {
    id: getRandomKey(),
    conditionType: 0,
    sourceId: 0,
    effectValue: 0,
  };

  const sort = useCallback((arrayToSort) => {
    return arrayToSort.sort((a, b) => {
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

  function createAutomation() {
    const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/automations`;
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
      'Content-Type': 'application/json',
    };
    const body = {
      id: id,
      scenes: left.map((s) => s.id),
      name: name,
      triggers: triggers,
      conditions: conditions,
    };

    console.log(body)


    fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    .then((res) => {
      console.log('res.status: ' + res.status)
      if (res.status === 200 || res.status === 201) {
        setLoading(false);
        setConfirmation(true);
        setActionCompleted(true);
      } else {
        setLoading(false);
        setConfirmation(true);
        setActionCompleted(false);
      }
      setLoading(false);
    })
    .catch((e) => {
      setLoading(false);
      console.log(e);
    });
  }


  function updateAutomation() {
    const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/automations/${params.get('id')}`;
    const headers = {
      user: localStorage.getItem('username'),
      'session-token': localStorage.getItem('session_token'),
      'Content-Type': 'application/json',
    };

    const body = {
      id: id,
      scenes: left.map((s) => s.id),
      name: name,
      triggers: triggers,
      conditions: conditions,
    };
    console.log(body)

    fetch(fetchUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    .then((res) => {
      console.log('res.status: ' + res.status)
      if (res.status === 200) {
        setLoading(false);
        setConfirmation(true);
        setActionCompleted(true);
      } else {
        setLoading(false);
        setConfirmation(true);
        setActionCompleted(false);
      }
    })
    .catch((e) => console.log(e));
  }

  // Fetches user's devices just once
  useEffect(() => {
      const fetchUrl = `${window.location.protocol}//${window.location.hostname}`;
      const method = 'GET';
      const headers = {
        user: localStorage.getItem('username'),
        'session-token': localStorage.getItem('session_token'),
      };
      let fetchedDevices = [];

      fetch(`${fetchUrl}:8080/devices`, {
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
        if (data !== null && data.length !== 0) {
          fetchedDevices = JSON.parse(data);
          fetchedDevices = fetchedDevices.filter((d) => d.type !== 5);
          sort(fetchedDevices);
          setDevices(fetchedDevices);
        }
      })
      .catch((e) => {
        console.log(e);
      });

      if (isEditing) {
        setLoading(true);
        fetch(`${fetchUrl}:8080/automations/${params.get('id')}`, {
          method,
          headers,
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
          if (data === null || data.length === 0) {
          } else {
            // Sets the scene data into the form
            const automation = JSON.parse(data);

            console.log(automation)

            setName(automation.name);
            setName(automation.name);
            setAutomations(automation);

            if (automation.triggers.length > 0) {
              dispatchTriggers({
                type: 'LOAD_TRIGGER',
                triggers: automation.triggers,
              });
            }

            if (automation.conditions.length > 0) {
              dispatchConditions({
                type: 'LOAD_CONDITIONS',
                triggers: automation.conditions,
              });
            }
            // // Mutates the devices[] content into actual devices
            // scene.triggers.forEach((effect) => {
            //   const newDevices = effect.devices.map((id) => fetchedDevices.find((device) => device.id === id));
            //   effect.devices = newDevices;
            // });

            setLoading(false);
            // Adds a boolean label to trigger visibility of triggers and dispatches one at a time
            // automation.triggers.forEach((trigger) => {
            //   trigger.visible = true;
            //   trigger.preexisting = true;
            //
            //   if (trigger.slider !== undefined) {
            //     if (trigger.type === 1 || trigger.type === 4) {
            //       trigger.slider = parseFloat(trigger.slider) * 100;
            //     }
            //   }
            //
            //   effect.devices.forEach((device) => {
            //     switch (effect.type) {
            //       case 1: // Light intensity
            //         device.usedIntensityId = effect.id;
            //         break;
            //       case 2: // Temperature
            //         device.usedTemperatureId = effect.id;
            //         break;
            //       case 3: // Power
            //         device.usedPowerId = effect.id;
            //         device.usedPowerOn = effectConfig.on;
            //         break;
            //       case 4: // Curtains aperture
            //         device.usedApertureId = effect.id;
            //         break;
            //       default:
            //         break;
            //     }
            //   });
            //
            //   dispatchTriggers({
            //     type: 'LOAD_SCENE',
            //     effectConfig: effect,
            //   });
            // });
          }
        })
        .catch((e) => {
          console.log(e);
        });
      }
    },
    [sort, isEditing]);


  // Gets rid of cached state and extracts the next one
  useEffect(() => {
  }, [automations, triggers]);

  // useEffect(() => {
  //   dispatchDevices({ type: 'POPULATE_DEVICES', devices });
  // }, [devices, globalRight]);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      borderRadius: 10,
      padding: 40,
      color: '#000000',
      background: '#FFFFFF',
    },
    textInput: {
      margin: theme.spacing(1),
      width: '30ch',
    },
  }));

  const classes = useStyles();

  const handleRedirect = () => {
    window.location.href = '/automations';
  };

  /**
   * Initializes a blank scene configuration to start working
   * @returns void
   * */
  function createBlankTrigger() {
    setId((prevState) => prevState + 1);
    dispatchTriggers({
      type: 'CREATE_BLANK_TRIGGER',
      trigger: blankTrigger,
    });
  }

  function createBlankCondition() {
    setId((prevState) => prevState + 1);
    dispatchConditions({
      type: 'CREATE_BLANK_CONDITION',
      condition: blankCondition,
    });
  }

  function getTitle() {
    const mode = path[1].toLowerCase();

    if (mode === 'editautomation') {
      return 'Edit automation';
    }

    if (mode === 'addautomation') {
      return 'Add automation';
    }
  }

  function ConfirmationModal() {
    return (
      <div>
        <Dialog
          open={confirmation}
          onClose={handleRedirect}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {actionCompleted
                ? (
                  <span
                    className="center-text bold"
                  >
                    {!isEditing ? 'Creation successful!' : 'Modification successful!'}
                  </span>
                )
                : (
                  <div>
                    <p className="center-tex bold">
                      {!isEditing ? 'Creation failed!' : 'Modification failed!'}
                    </p>
                    <span className="center-text">Please review your automation and try again.</span>
                  </div>
                )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button
              className="btn-secondary btn waves-effect waves-light center"
              type="button"
              name="button"
              onClick={() => {
                if (actionCompleted) {
                  handleRedirect();
                } else {
                  setConfirmation(false);
                }
              }}
            >
              OK
            </button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  return (
    <AutomationsContext.Provider
      value={{
        // dispatchAutomations,
        dispatchConditions,
        dispatchTriggers,
        automations,
        triggers,
        devices,
        setValid,
        isEditing,
        isLoading,
        isError,
        setIsError,
        setLoading,
        globalRight,
        setGlobalRight,
        getRandomKey,
        left,
        right,
        setLeft,
        setRight,
        sort,
      }}
    >
      <div className="container scene-factory-box">
        <form noValidate autoComplete="off">
          <Grid container spacing={3} className="scene-content-box-top">
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Paper xs={12} sm={12} md={12} lg={12} elevation={3} className={classes.paper}>
                <h3 className="left-align headline-title">{getTitle()}</h3>

                <div className="row">
                  <div className="col l4">
                    <div>
                      <label>
                        <span
                          className="row align-left lbl-scene-name-align"
                        >
                          Automation name
                        </span>
                        <input
                          className="row scenes-factory-name-input"
                          type="text"
                          name="name"
                          placeholder="Type a name"
                          onChange={(e) => {
                            hasName = e.target.value < 1;
                            setName(e.target.value);

                          }}
                          value={name}
                          required
                        />
                      </label>
                    </div>
                    <span
                      className={hasName ? 'float-left l12 error-message align-error-message-scene-name' : 'display-none'}
                    >
                      Automations must have a name
                    </span>

                  </div>

                  <div className="col l2" />
                  <div className="col l6" />
                  <div className="col l8 center">
                    <div className="loading-spinner-container">
                      {isLoading && (
                        <ColorCircularProgress
                          className="loading-spinner"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col l12">
                    <div className="row right-text">
                      <button
                        type="button"
                        name="button"
                        className="btn-secondary btn waves-effect waves-light"
                        onClick={() => {
                          handleRedirect();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        name="button"
                        className={isEditing ? 'btn-secondary btn waves-effect waves-light' : 'display-none'}
                        onClick={() => {
                        }}
                      >
                        Delete
                      </button>
                      <button
                        type=" button"
                        name=" button"
                        disabled={!isValid}
                        className="btn-primary btn waves-effect waves-light"
                        onClick={(e) => {
                          e.preventDefault();
                          setActionCompleted(!actionCompleted);
                          setLoading(true);

                          if (isEditing) {
                            updateAutomation();
                          } else {
                            createAutomation();
                          }
                        }}
                      >
                        {isEditing ? 'Modify' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </Paper>
            </Grid>

            {confirmation && <ConfirmationModal />}

            {/* Scenes */}
            <Grid item lg={12} className=" scene-content-box-instructions">
              <span className=" bold">Step 1: </span>
              <span>Choose the scenes that you want to be triggered </span>
              <span
                className="text-emphasis"
              >
                (every automation must have at least one scene assigned)
              </span>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Paper xs={12} sm={12} md={12} lg={12} elevation={3} className={classes.paper}>
                <Grid className=" row" container spacing={0}>
                  <div className=" steps-header col l11">Scenes selection</div>
                  <div className=" steps-header col l1" />
                </Grid>

                <Grid className="row" container>
                  <TransferList />
                </Grid>
              </Paper>
            </Grid>

            {/* Triggers */}
            <Grid item lg={12} className=" scene-content-box-instructions">
              <span className=" bold">Step 2: </span>
              <span>Set at least one event trigger for this scene. </span>
              <span
                className="text-emphasis"
              >
                A trigger activates a scene whenever one of the conditions happen.
              </span>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Paper xs={12} sm={12} md={12} lg={12} elevation={3} className={classes.paper}>
                <Grid className=" row" container spacing={0}>
                  <div className=" steps-header col l11">Triggers selection</div>
                  <div className=" steps-header col l1">
                    <i
                      onClick={() => {
                        hasName = name.length < 1;
                        createBlankTrigger();
                      }}
                      className="col col-custom btn waves-effect waves-light btn-primary-circular
                                     right material-icons btn-circular-fix-margin"
                    >
                      add
                    </i>
                  </div>
                </Grid>

                {/* Configure triggers */}
                <Grid className="row" container>
                  {triggers.map((trigger) => (
                    <Trigger
                      key={getRandomKey()}
                      trigger={trigger}
                      devices={devices}
                    />
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Conditions */}
            <Grid item lg={12} className=" scene-content-box-instructions">
              <span className=" bold">Step 3: </span>
              <span>Set conditions. If you set them, all conditions must be met for this automation to be executed.</span>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Paper xs={12} sm={12} md={12} lg={12} elevation={3} className={classes.paper}>
                <Grid className=" row" container spacing={0}>
                  <div className=" steps-header col l11">Conditions selection (optional)</div>
                  <div className=" steps-header col l1">
                    <i
                      onClick={() => {
                        hasName = name.length < 1;
                        createBlankCondition();
                      }}
                      className="col col-custom btn waves-effect waves-light btn-primary-circular
                                     right material-icons btn-circular-fix-margin"
                    >
                      add
                    </i>
                  </div>
                </Grid>

                {/* Configure triggers */}
                <Grid className="row" container>
                  {conditions.map((condition) => (
                    <Condition
                      key={getRandomKey()}
                      condition={condition}
                      devices={devices}
                    />
                  ))}
                </Grid>
              </Paper>
            </Grid>

          </Grid>
        </form>
      </div>
    </AutomationsContext.Provider>
  );
};

export { AutomationsFactory as default };
