/**
 * Converts all devices in a scene's effects into an array of IDs
 * @param scene
 * @returns {*}
 */
function prepareSceneForFetch(scene) {
  scene.effects.forEach(
    (effect) => (effect.devices = effect.devices.map((device) => device.id)),
  );
}

/**
 * This reducer controls the actions triggered by the events
 * handled by the scene components and its children
 * @param stateParam
 * @param action
 * @returns {state[]}
 */

const scenesReducer = (stateParam, action) => {
  let state = stateParam;
  let copyCount = 1;
  let duplicatedScene = {};
  let sceneCopyNumber = 0;
  let newScenes = [];
  const sceneCopyNumbers = [];
  const host = `${window.location.protocol}//${window.location.hostname}:8080`;
  const fetchUrl = `${host}/scenes`;
  const headers = {
    user: localStorage.getItem('username'),
    'session-token': localStorage.getItem('session_token'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  switch (action.type) {
    case 'POPULATE_SCENES':
      // console.log('Dispatch: POPULATE_SCENES');
      return action.scenes;

    case 'UPDATE_STATE':
      // console.log('Dispatch: UPDATE_STATE');
      state = {
        name: action.name,
        icon: action.icon,
        shared: action.shared,
        effects: action.effects,
      };
      return state;

    case 'UPDATE_TRANSFER_LIST_STATE':
      // console.log('Dispatch: UPDATE_TRANSFER_LIST_STATE');
      action.config.devices = action.devices;

      return action.config;

    case 'UPDATE_EFFECTS_STATE':
      // console.log('Dispatch: UPDATE_STATE');
      state.devices = action.devices;
      return [...state];

    case 'LOAD_SCENE':
      // console.log('Dispatch: LOAD_SCENE');
      return [action.effectConfig, ...state];

    case 'CREATE_BLANK_EFFECT':
      // console.log('Dispatch: CREATE_BLANK_EFFECT');
      return [...state, action.effectConfig];

    case 'CREATE_SCENE':
      // console.log('Dispatch: CREATE_SCENE');

      const newScene = {
        name: action.name,
        icon: action.icon,
        shared: action.shared,
        effects: action.effects,
      };

      newScene.effects.forEach((effect) => {
        delete effect.visible;
        delete effect.preexisting;

        if (effect.slider !== undefined) {
          if (effect.type === 1 || effect.type === 4) {
            effect.slider = parseFloat(effect.slider) / 100;
          } else {
            effect.slider = parseFloat(effect.slider);
          }
        }
      });

      // Mutates the devices[] into IDs only in each effect
      prepareSceneForFetch(newScene);

      fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(newScene),
      })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          action.setActionCompleted(true);
          action.setLoading(false);
        } else {
          action.setActionCompleted(false);
          action.setLoading(false);
        }
        action.setConfirmation(true);
      })
      .catch((e) => console.log(e));
      return state;

    case 'DELETE_SCENE':
      // console.log('Dispatch: DELETE_SCENE');
      state = state.filter((s) => s.id !== action.scene.id);

      fetch(`${fetchUrl}/${action.scene.id}`, {
        method: 'DELETE',
        headers,
      })
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          action.setActionCompleted(true);
        } else {
          action.setActionCompleted(false);
        }
      })
      .catch((e) => console.log(e));

      return [...state];

    case 'DELETE_SCENE_EFFECT':
      // console.log('Dispatch: DELETE_SCENE_EFFECT');
      state = state.filter((e) => e.id !== action.effectConfig.id);
      return [...state];

    case 'RUN_SCENE':
      // console.log('Dispatch: RUN_SCENE');

      fetch(`${fetchUrl}/run/${action.scene.id}`, {
        method: 'PUT',
        headers,
      })
      .then((res) => {
        action.setPlaying(false);
        action.setResultTriggered(true);
        if (res.status === 200 || res.status === 204) {
          action.setSuccess(true);
        } else {
          action.setSuccess(false);
        }
      })
      .catch((e) => console.log(e));

      return state;

    case 'DUPLICATE_SCENE':
      // console.log('Dispatch: DUPLICATE_SCENE');
      // Renames a copy of a scene sequentially, respecting the existing copy numbers from 1 to n
      state.forEach((scene) => {
        let sceneName = scene.name.split(' ');
        const originalName = action.scene.name;

        if (sceneName.length > 3 && sceneName[0] === 'Copy' && sceneName[1] === 'of') {
          sceneCopyNumber = parseInt(sceneName.pop(), 10);
          sceneName = sceneName.join(' ');

          if (sceneName === `Copy of ${originalName}`) {
            sceneCopyNumbers.push(sceneCopyNumber);
          }
        }
      });

      if (sceneCopyNumbers.length > 0) {
        sceneCopyNumbers.sort((a, b) => a - b);
      }

      sceneCopyNumbers.forEach(() => {
        const found = sceneCopyNumbers.includes(copyCount);
        if (found) {
          copyCount += 1;
        }
      });

      duplicatedScene = {
        id: null,
        name: `Copy of ${action.scene.name} ${copyCount}`,
        icon: action.scene.icon,
        shared: action.scene.shared,
        effects: action.scene.effects,
      };

      duplicatedScene.effects.forEach((effect) => {
        delete effect.visible;
        delete effect.preexisting;

        if (effect.slider !== undefined) {
          if (effect.type === 1 || effect.type === 4) {
            effect.slider = parseFloat(effect.slider);
          }
        }
      });

      fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(duplicatedScene),
      })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          action.setActionCompleted(true);
        } else {
          action.setActionCompleted(false);
        }
      })
      .catch((e) => console.log(e));

      duplicatedScene.id = Math.floor((Math.random() * 1000) * 5);

      newScenes = [duplicatedScene, ...state];
      newScenes.sort((a, b) => {
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
      return newScenes;

    case 'MODIFY_SCENE':
      // console.log('Dispatch: MODIFY_SCENE');

      const editedScene = {
        name: action.name,
        icon: action.icon,
        shared: action.shared,
        effects: action.effects,
      };

      editedScene.effects.forEach((effect) => {
        delete effect.visible;
        delete effect.preexisting;

        if (effect.slider !== undefined) {
          if (effect.type === 1 || effect.type === 4) {
            effect.slider = parseFloat(effect.slider) / 100;
          } else {
            effect.slider = parseFloat(effect.slider);
          }
        }
      });

      // Mutates the devices[] into IDs only in each effect
      prepareSceneForFetch(editedScene);

      fetch(`${fetchUrl}/${action.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editedScene),
      })
      .then((res) => {
        if (res.status === 200) {
          action.setActionCompleted(true);
          action.setLoading(false);
        } else {
          action.setActionCompleted(false);
          action.setLoading(false);
        }
        action.setConfirmation(true);
      })
      .catch((e) => console.log(e));
      return state;

    default:
      // console.log('Dispatch: DEFAULT');
      return state;
  }
};
export { scenesReducer as default };
