import React from 'react';
import '../css/App.css';
import '../css/loginSignup.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class ResendEmail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            successOrError: -1, // if -1 nothing, if 0 display success, if 1 display incomplete, if 2 everything else
            errorType: '',
            isLoading: false,
        };
    }

    /**
     * Adds an event listener to call sendDatas when key "Enter" is pressed
     */
    componentDidMount() {
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') this.sendDatas(evt);
        });
    }

    /**
     * If all informations aren't filled in, it displays an error message, otherwise:
     * Fetches POST request to /auth/resend/:email
     * Displays a message based on successful or not response
     */
    sendDatas = (evt) => {
        evt.preventDefault();
        if (this.state.email === '') {
            this.setState({ successOrError: 1 });
            return;
        }
        this.setState({ isLoading: true, successOrError: -1 });

        fetch(`http://localhost:8080/auth/resend/${this.state.email}`, {
            method: 'POST',
        })
        .then((res) => {
            this.setState({ isLoading: false });
            if (res.status === 204) {
                this.setState({ successOrError: 0 });
            } else {
                this.setState({ successOrError: 2 });
                return res.json();
            }
            return null;
        })
        .then((data) => {
            if (data !== null) this.setState({ errorType: data.message });
        })
        .catch((e) => {
            this.setState({ isLoading: false });
            this.setState({ successOrError: 2, errorType: e.toString() });
        });
    };

    /**
     * Handles changes in Email input
     */
    handleEmailChange = (evt) => {
        this.setState({ email: evt.target.value });
    };

    /**
     * Adds a new line in the page depending on the value of this.state.successOrError
     */
    displayResult = () => {
        if (this.state.successOrError === 0) {
            return (
              <>
                <span className="success-message">Verification email sent!</span>
                <br />
                <span className="success-message">Please check your inbox and follow the link to verify your account.</span>
              </>
            );
        }
        if (this.state.successOrError === 1) {
            return (<span className="error-message">Insert email.</span>);
        }
        if (this.state.successOrError === 2) {
            return (<span className="error-message">{this.state.errorType}</span>);
        }
    };

    /**
     * State: email
     * isEnabled: boolean to enable button
     */
    render() {
        const { email } = this.state;
        const isEnabled = email.length > 1;

        return (
          <div id="wrapper" className="homepage img-homepage-headline main-img-background">
            <article>
              <div id="content" className="container">
                <div className="password-reset-box z-depth-2">
                  <h2 className="title">Resend verification email</h2>

                  <p className="center-text top-bottom-margins">
                    Type the email address registered to your account. If we find it in our records,
                    you’ll receive the instructions to verify your account.
                  </p>

                  <div>
                    <input
                      type="email"
                      required
                      name="email"
                      value={this.state.email}
                      onChange={this.handleEmailChange}
                      placeholder="Email"
                    />
                  </div>

                  <div className="message-two-lines center-text">
                    <span>
                      <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
                    </span>
                    {this.displayResult()}
                  </div>

                  <div className="center">

                    <button
                      type="button"
                      name="button"
                      className="btn-secondary waves-effect waves-light btn"
                      onClick={() => window.location.href = '/login'}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      name="button"
                      disabled={!isEnabled}
                      className="btn-primary waves-effect waves-light btn"
                      onClick={this.sendDatas}
                    >
                      Resend
                    </button>

                  </div>
                </div>
              </div>
            </article>
          </div>
        );
    }
}


export default ResendEmail;
