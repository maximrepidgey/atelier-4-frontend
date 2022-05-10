import React from 'react';
import '../css/App.css';
import '../css/loginSignup.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            successOrError: -1, // if -1 nothing, if 0 display success, if 1 display incomplete, if 2 bad request,
                                // if 3 email or username already in use, if 4 unexpected error
            errorType: '',
            isLoading: false,
            passwordMismatch: false,
            isEnabled: false,
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
     * Fetches POST request to /user/:username with this.state.username, email, firstname, lastname and password
     * Displays a message based on successful or not response
     */
    sendDatas = (evt) => {
        evt.preventDefault();

        if (this.state.firstname === '' || this.state.lastname === '' || this.state.username === ''
            || this.state.email === '' || this.state.password === '' || this.state.confirmPassword === '') {
            this.setState({ successOrError: 1 });
            return;
        }
        if (this.state.password !== '' && this.state.confirmPassword !== '' && this.state.password !== this.state.confirmPassword) return;

        this.setState({ isLoading: true, successOrError: -1, isEnabled: false });

        fetch(`http://localhost:8080/user/${this.state.username}`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    username: this.state.username,
                    email: this.state.email,
                    fullname: `${this.state.firstname} ${this.state.lastname}`,
                    password: this.state.password,
                },
),
        })
        .then((res) => {
            this.setState({ isLoading: false });
            if (res.status === 201) {
                this.setState({ successOrError: 0 });
                document.getElementById('createButton').disabled = true;
                return null;
            }

                return res.json();
        })
        .then((data) => {
            if (data != null) {
                this.setState({ successOrError: 2, errorType: data.message });
                this.updateIsEnabled('', -1);
            }
        })
        .catch((e) => {
            this.setState({ isLoading: false });
            this.setState({ successOrError: 4, errorType: e.toString() });
        });
    };

    /**
     * Adds a new line in the page depending on the value of this.state.success
     */
    displayResult = () => {
        if (this.state.successOrError === 0) {
            return (
              <>
                <span className="success-message">Account created successfully!</span>
                <br />
                <span className="success-message">Please check your inbox and confirm your email account.</span>
              </>
            );
        }
        if (this.state.successOrError === 1) {
            return (<span className="error-message">Insert all informations.</span>);
        }
        if (this.state.successOrError === 2) {
            return (<span className="error-message">{this.state.errorType}</span>);
        }
    };

    /**
     * Displays an error while the passwords in the two password inputs don't match
     */
    passwordMatch = () => {
        if (this.state.password !== '' && this.state.confirmPassword !== '' && this.state.password !== this.state.confirmPassword) {
            return (
              <span>
                The two passwords don't match.
                <br />
              </span>
);
        }
    }

    passwordLength = () => {
        if (this.state.password.length > 0 && this.state.password.length < 6) {
            return (<span>Password is too short (minimum 6 characters).</span>);
        }
    }

    /**
     * Handles changes in Username input
     */
    handleUsernameChange = (evt) => {
        this.setState({ username: evt.target.value });
        this.updateIsEnabled(evt.target.value, 0);
    };

    /**
     * Handles changes in First Name input
     */
    handleFirstnameChange = (evt) => {
        this.setState({ firstname: evt.target.value });
        this.updateIsEnabled(evt.target.value, 1);
    };

    /**
     * Handles changes in Last Name input
     */
    handleLastnameChange = (evt) => {
        this.setState({ lastname: evt.target.value });
        this.updateIsEnabled(evt.target.value, 2);
    };

    /**
     * Handles changes in Email input
     */
    handleEmailChange = (evt) => {
        this.setState({ email: evt.target.value });
        this.updateIsEnabled(evt.target.value, 3);
    };

    /**
     * Handles changes in Password input
     */
    handlePasswordChange = (evt) => {
        this.setState({ password: evt.target.value });
        this.updateIsEnabled(evt.target.value, 4);
    };

    /**
     * Handles changes in Confirm Password input
     */
    handleConfirmPasswordChange = (evt) => {
        this.setState({ confirmPassword: evt.target.value });
        this.updateIsEnabled(evt.target.value, 5);
    };

    /**
     * Changes this.state.isEnabled
     * @param {string} newInput: modified element in the inputs
     * @param {number} flag: 0 = username, 1 = firstname, 2 = lastname, 3 = email, 4 = password, 5 = confirmPassword, anything else is just reset
     */
    updateIsEnabled = (newInput, flag) => {
        let {
username, firstname, lastname, email, password, confirmPassword,
} = this.state;
        if (flag === 0) username = newInput;
        else if (flag === 1) firstname = newInput;
        else if (flag === 2) lastname = newInput;
        else if (flag === 3) email = newInput;
        else if (flag === 4) password = newInput;
        else if (flag === 5) confirmPassword = newInput;
        this.setState({ isEnabled: (email.length > 0 && password.length >= 6 && username.length > 0 && firstname.length > 0 && lastname.length > 0 && confirmPassword.length > 0 && confirmPassword === password) });
    };

    /**
     * State: firstname, lastname, username, email, password, confirmPassword
     * isEnabled: boolean to enable button
     */
    render() {
        return (
          <div id="wrapper" className="homepage img-homepage-headline main-img-background">

            <article>
              <div id="content" className="container">
                <div className="signup-box z-depth-2">
                  <h2 className="title">Create account</h2>
                  <p>All fields are required</p>

                  <div className="row">

                    <div className="col l6 m12">
                      <input
                        required
                        name="firstname"
                        value={this.state.firstname}
                        onChange={this.handleFirstnameChange}
                        type="text"
                        placeholder="First name"
                      />
                    </div>

                    <div className="col l6 m12">
                      <input
                        required
                        name="lastname"
                        value={this.state.lastname}
                        onChange={this.handleLastnameChange}
                        type="text"
                        placeholder="Last name"
                      />
                    </div>

                    <div className="col l6 m12">
                      <input
                        required
                        name="email"
                        value={this.state.email}
                        onChange={this.handleEmailChange}
                        type="email"
                        placeholder="Email"
                      />
                    </div>

                    <div className="col l6 m12">
                      <input
                        required
                        name="username"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                        type="text"
                        placeholder="Username"
                      />
                    </div>

                    <div className="col l6 m12">
                      <input
                        required
                        name="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                        type="password"
                        placeholder="Password"
                      />
                    </div>

                    <div className="col l6 m12">
                      <input
                        required
                        name="confirmPassword"
                        value={this.state.confirmPassword}
                        onChange={this.handleConfirmPasswordChange}
                        type="password"
                        placeholder="Confirm Password"
                      />
                    </div>

                  </div>

                  <div className="message-two-lines center-text">
                    {this.passwordMatch()}
                    {this.passwordLength()}
                    <br />
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
                      Sign in
                    </button>

                    <button
                      type="button"
                      disabled={!this.state.isEnabled}
                      name="button"
                      className="btn-primary waves-effect waves-light btn"
                      id="createButton"
                      onClick={this.sendDatas}
                    >
                      Create
                    </button>

                  </div>
                </div>
              </div>
            </article>
          </div>
        );
    }
}


export default Signup;
