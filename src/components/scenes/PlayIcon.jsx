import React, { useContext, useEffect } from 'react'
import ScenesContext from "../../context/scenesContext";

/**
 * Animated icon to show when a scene is running
 * @param scene
 * @returns {*}
 * @constructor
 */
const PlayIcon = ({ scene }) => {
  const { dispatchScene } = useContext(ScenesContext);
  const idleIcon = "/img/icons/material-ui-svg/PlayCircleOutlined.svg";
  const successIcon = "/img/icons/material-ui-svg/PlayCircleSuccess.svg";
  const errorIcon = "/img/icons/material-ui-svg/PlayCircleError.svg";
  const [resultTriggered, setResultTriggered] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [icon, setIcon] = React.useState(idleIcon);

  useEffect(() => {
    if (resultTriggered) {
      if (success) {
        setIcon(successIcon);
      } else {
        setIcon(errorIcon);
      }
      setTimeout(() => {
        setResultTriggered(!resultTriggered);
        setIcon(idleIcon);
      }, 2000);
    } else {
      setIcon(idleIcon);
    }
  }, [resultTriggered, success]);


  const handlePlay = (e) => {
    e.preventDefault();
    setPlaying(!playing);
    dispatchScene({
      type: 'RUN_SCENE',
      scene: scene,
      setSuccess: setSuccess,
      setPlaying: setPlaying,
      setResultTriggered: setResultTriggered
    });
  };

  return (
    <>
      <img alt="scene play button" className="scene-item btn-icon-play"
           src={icon}
           onClick={(e) => handlePlay(e)}
      />
      <img alt="scene play circle 1"
           className={!playing ? "display-none" : "scene-item btn-icon-rotate-clockwise-over-1 btn-icon-rotate-clockwise-1"}
           src="/img/icons/material-ui-svg/PlayCircleOutline1.svg"
      />
      <img alt="scene play circle 2"
           className={!playing ? "display-none" : "scene-item btn-icon-rotate-clockwise-over-2 btn-icon-rotate-clockwise-2"}
           src="/img/icons/material-ui-svg/PlayCircleOutline2.svg"
      />
      <img alt="scene play circle 3"
           className={!playing ? "display-none" : "scene-item btn-icon-rotate-clockwise-over-3 btn-icon-rotate-clockwise-3"}
           src="/img/icons/material-ui-svg/PlayCircleOutline3.svg"
      />
      <img alt="scene play circle 4"
           className={!playing ? "display-none" : "scene-item btn-icon-rotate-clockwise-over-4 btn-icon-rotate-clockwise-4"}
           src="/img/icons/material-ui-svg/PlayCircleOutline4.svg"
      />
    </>
  )
};

export { PlayIcon as default }
