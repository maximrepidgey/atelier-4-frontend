import React, { useContext } from 'react';
import ScenesContext from '../../context/scenesContext';
import PlayIcon from './PlayIcon';

/**
 * Scene factory that can create any type of scene
 * @param scene object
 * @returns {*}
 * @constructor
 */
const Scene = ({ scene, isGuest }) => {
  const { dispatchScene, setActionCompleted } = useContext(ScenesContext);

  const handleDuplicate = (e) => {
    e.preventDefault();
    dispatchScene({ type: 'DUPLICATE_SCENE', scene, setActionCompleted });
  };

  const handleDelete = (e) => {
    e.preventDefault();
    dispatchScene({ type: 'DELETE_SCENE', scene, setActionCompleted: setActionCompleted });
  };

  return (
    <div className={isGuest.isGuest ? 'col l6' : undefined}>
      <div className="scene row">
        <div id={scene.id} className="item">
          <div id={scene.id} className={isGuest.isGuest ? 'scene-item col l2' : 'scene-item col l1'}>
            <PlayIcon scene={scene} />
          </div>
          <div className={isGuest.isGuest ? 'scene-item col l3' : 'scene-item col l2'}>
            <img
              alt={scene.name}
              className="img-scene-icon"
              src={scene.icon ? scene.icon : '/img/icons/scenes/icon-unknown.svg'}
            />
          </div>
          <div className={isGuest.isGuest ? 'scene-item col l5' : 'scene-item col l6'}>
            <span className="scene-item scene-item-name">{scene.name}</span>
          </div>
          <div className={isGuest.isGuest ? 'display-none' : undefined}>
            <div className="scene-item col l1">
              <a href={`/editScene?id=${scene.id}`}>
                <i
                  className="scene-item material-icons btn-icon"
                >
                  edit
                </i>
              </a>
            </div>
            <div className="scene-item col l1">
              <i
                className="scene-item material-icons btn-icon btn-icon-duplicate"
                onClick={(e) => handleDuplicate(e)}
              >
                file_copy
              </i>
            </div>
            <div className="scene-item col l1">
              <i
                className="scene-item material-icons btn-icon"
                onClick={(e) => handleDelete(e)}
              >
                {' '}
                highlight_off
                {' '}
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Scene as default };
