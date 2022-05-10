import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CardMedia from '@material-ui/core/CardMedia';
import DialogActions from '@material-ui/core/DialogActions';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';


/**
 * Creates a VideoPlayer to view the security camera's video feed
 * @param device
 * @returns {*} VideoPlayer
 */
const VideoPlayer = (device) => {
    const defaultVideo = 'https://res.cloudinary.com/erickgarro/video/upload/v1586203233/SmartHut/video-cabin.mp4';
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [videoSource, setVideoSource] = React.useState(defaultVideo);
    const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

    // Makes interval fetches for state updating
    useEffect(() => {
        if (device.open) {
          const fetchUrl = `${window.location.protocol}//${window.location.hostname}:8080/devices/video/${device.device.id}`;
          const method = 'GET';
          const headers = {
            user: localStorage.getItem('username'),
            'session-token': localStorage.getItem('session_token'),
            Accept: 'application/json',
          };
          fetch(fetchUrl, {
            method,
            headers,
          })
          .then((res) => {
            if (res.status === 200 || res.status === 206 || res.status === 304) {
              return res.text();
            }
            setIsError(true);
            return null;
          })
          .then((data) => {
            if (data !== null) {
              setVideoSource(data);
              setIsLoading(false);
            }
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false);
          });
        }
      },
      [device]
    )
    ;

    return (
      <>
        <Dialog
          fullWidth
          maxWidth="md"
          open={device.open}
          onClose={device.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <h2 className="center-text">
            {device.device.roomName}
            :
            {' '}
            {device.device.name}
          </h2>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div className={(isLoading) ? 'centered-loading-data-message' : 'display-none'}>
                <ColorCircularProgress />
              </div>
              <div className={(isError) ? 'centered-loading-data-message' : 'display-none'}>
                <p className="error-message">Oops! We cannot access this camera&#39;s video feed.</p>
                <p className="error-message">Contact the service administrator.</p>
              </div>
              <CardMedia
                className={(isLoading || isError) ? 'display-none' : undefined}
                component="video"
                image={videoSource}
                autoPlay
                loop
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button
              type="button"
              name="button"
              className="display-inf btn-secondary btn waves-effect waves-light"
              onClick={device.handleClose}
            >
              Close
            </button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
;
export { VideoPlayer as default };
