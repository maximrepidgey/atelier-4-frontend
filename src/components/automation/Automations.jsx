import React from 'react';
import '../../css/App.css';
import '../../css/house.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class Automations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      automations: <div className="message-two-lines center-text">
        <span>
          <ColorCircularProgress
            className="loading-spinner"
          />
        </span>

      </div>,
      automationToDelete: '',
      isLoading: false,
      error: false,
      errorType: '',
    };
  }

  /**
   * Fetches GET request to /automations/ and
   * if successful sets the response into this.state.automations
   * otherwise displays an error message
   */
  componentDidMount() {
    fetch('http://localhost:8080/automations', {
      method: 'GET',
      headers: {
        user: this.props.username,
        'session-token': this.props.session_token,
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
      const response = JSON.parse(data);

      if (response === null) {
        this.setState({ automations: <span className="error-message">An error has occurred.</span> });
      } else if (response.length === 0) {
        this.setState({
          automations: <p>You haven't added any automations yet. Please add a new one.</p>,
        });
      } else {
        this.mapAutomations(response.sort(this.sortAutomations));
      }
    })
    .catch((e) => this.setState({ automations: <span className="error-message">An error has occurred.</span> }));
  }

  /**
   * Sorts the two automations
   * @param {automation} a
   * @param {automation} b
   * @return {number} -1 if a should be before b, 1 otherwise
   */
  sortAutomations = (a, b) => {
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
  }

  /**
   * Maps the received array of automations and sets it as this.state.automations.
   * If no automations are available, this.state.automations gets changed with a specific phrase.
   * @param {automation array} automations: array of automations
   */
  mapAutomations = (automations) => {
    if (automations.length === 0) {
      this.setState({ automations: <p>You have created no automations yet. Click on the + button to add one.</p> });
    } else {
      let i = 0;
      const toSet = automations.map((automation) => (
        <div key={i++} className="row room">
          <div className="col l1 image vertical-center"></div>
          <div className="col l5 vertical-center">{automation.name}</div>
          <div className="col l2 vertical-center center-text"></div>
          <div className="col l2" />
          <div className="col l1 room-button1 vertical-center">
            <i
              className="material-icons btn-icon btn-edit"
              onClick={() => this.redirectToEditAutomation(automation.id)}
            >
              edit
            </i>
          </div>
          <div className="col l1 room-button2 vertical-center">
            <i
              className="material-icons btn-edit"
              onClick={() => this.moveToDeletion(automation.id)}
            >
              {' '}
              highlight_off
            </i>
          </div>
        </div>
      ));
      this.setState({ automations: toSet });
    }
  }

  /**
   * Redirection to /editAutomation
   */
  redirectToEditAutomation = (automationID) => {
    window.location.href = `/editAutomation?id=${automationID}`;
  }

  /**
   * Changes the display view to show confirmation of the deletion of the selected user
   * @param {user array} automationID: username of the automation to delete
   */
  moveToDeletion = (automationID) => {
    this.setState({ automationToDelete: automationID });
    document.getElementById('automationList').hidden = true;
    document.getElementById('deleteAutomationConfirmation').hidden = false;
  }

  /**
   * Changes the display view to the list of shared
   */
  moveToAutomationsList = () => {
    this.setState({ automationToDelete: '' });
    document.getElementById('automationList').hidden = false;
    document.getElementById('deleteAutomationConfirmation').hidden = true;
  }

  /**
   * Fetches a DELETE request to /automations/:id with the id of the Automation to delete
   * If successfull, calls this.moveToAutomationList and reloads the page in order to receive the updated list of automations
   * If unsuccessfull, changes the value of this.state.error
   */
  deleteAutomation = () => {
    this.setState({ isLoading: true, error: false });
    fetch(`http://localhost:8080/automations/${this.state.automationToDelete}`, {
      method: 'DELETE',
      headers: {
        user: this.props.username,
        'session-token': this.props.session_token,
      },
    })
    .then((res) => {
      this.setState({ isLoading: false });
      if (res.status === 203) {
        this.moveToAutomationList();
        window.location.href = '/automations';
      } else if (res.status === 401) {
        this.props.logOut(1);
      } else {
        this.setState({ error: true });
        return res.json();
      }
      return null;
    })
    .then((data) => {
      if (data !== null) this.setState({ errorType: data.message });
    })
    .catch((e) => {
      this.setState({ isLoading: false });
      this.setState({ error: true, errorType: e.toString() });
    });
  }

  /**
   * Returns HTML with error message to display based on this.state.error
   */
  showError = () => {
    if (this.state.error) {
      return (<span className="error-message">{this.state.errorType}</span>);
    }
  }

  /**
   * Renders the list of automations
   */
  render() {
    return (
      <div className="container">
        <div id="automationList" className="rooms-content-box z-depth-2">
          <div className="headline-box row row-collapsible row row-collapsible-custom">
            <h2 className="col l11 left-align headline-title">My automations</h2>
            <a href="/addAutomation">
              <i
                className="col col-custom l1 btn waves-effect waves-light btn-primary-circular right material-icons"
              >
                add
              </i>

            </a>
          </div>

          <div className="row rooms-headline">
            <div className="col l1" />
            <div className="col l5">Name</div>
            <div className="col l4" />
          </div>
          {this.state.automations}
        </div>

        <div hidden id="deleteAutomationConfirmation" className="content-box">
          <h2 className="title">Are you sure that you want to remove this automation?</h2>
          <div className="message-two-lines center-text">
            <span>
              <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
            </span>
            {this.showError()}
          </div>
          <button
            type="button"
            name="button"
            className="btn-secondary btn waves-effect waves-light"
            onClick={this.moveToAutomationsList}
          >
            No
          </button>
          <button
            type="button"
            name="button"
            className="Handle-btn-primary btn waves-effect waves-light"
            onClick={this.deleteAutomation}
          >
            Yes
          </button>
        </div>
      </div>
    );
  }
}

export default Automations;
