import React from 'react';
import '../css/App.css';
import '../css/loginSignup.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import withStyles from '@material-ui/core/styles/withStyles';

const ColorCircularProgress = withStyles({ root: { color: '#580B71' } })(CircularProgress);

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameOrEmail: '',
      password: '',
      sessionToken: '',
      statusCode: '',
      isLoading: false,
      error: -1, // -1 nothing, 0 incomplete, 1 not verified, 2 everything else
      errorType: '',
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
   * Fetches POST request to /auth/login/:username with this.state.password
   * If successful, fetches POST request to /auth/login/:email
   * If both are successful, it calls this.props.login
   * If one of them is not, it display an error message
   */
  sendDatas = (evt) => {
    evt.preventDefault();

    if (this.state.usernameOrEmail === 'mario@usi.ch') {
      window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      return;
    }

    if (this.state.usernameOrEmail === '' || this.state.password === '') {
      this.setState({ error: 0 });
      return;
    }

    this.setState({ isLoading: true, error: -1, statusCode: '' });

    fetch(`http://localhost:8080/auth/login/${this.state.usernameOrEmail}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: this.state.password,
    })
    .then((res) => {
      this.setState({ statusCode: res.status });

      if (res.status === 200) {
        return res.text();
      }
      if (res.status === 403) {
        this.setState({ error: 1 });
      } else {
        this.setState({ error: 2 });
        return res.json();
      }
      return null;
    })
    .then((data) => {
      if (data != null) {
        if (this.state.error === 2) {
          this.setState({ errorType: data.message });
          return null;
        }

        this.setState({ sessionToken: data });
        return fetch('http://localhost:8080/auth/validate', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            user: this.state.usernameOrEmail,
            'session-token': data,
          },
        });
      }
      return null;
    })
    .then((res) => {
      if (res != null) {
        this.setState({ statusCode: res.status });

        if (res.status === 200) {
          return res.text();
        }
        if (res.status === 403) {
          this.setState({ error: 1 });
        } else {
          this.setState({ error: 2 });
          return res.json();
        }
        return null;
      }
      return null;
    })
    .then((data) => {
      this.setState({ isLoading: false });
      if (data !== null) {
        if (this.state.error === 2) {
          this.setState({ errorType: data.status });
          return null;
        }
        this.props.logIn(data, this.state.sessionToken);
      }
    })
    .catch((e) => {
      this.setState({ isLoading: false });
      this.setState({ error: 2, errorType: e.toString() });
    });
  };

  /**
   * Display an error message based on the value of this.state.error
   */
  showError = () => {
    if (this.state.error === 0) {
      return (<span className="error-message">Please fill all the information</span>);
    }
    if (this.state.error === 1) {
      return (
        <span className="error-message">
                Account not verified.
                <a className="primary-link" href="/resend">Resend email</a>
              </span>
      );
    }
    if (this.state.error === 2) {
      return (<span className="error-message">{this.state.errorType}</span>);
    }
  }

  /**
   * Handles changes in Username input
   */
  handleUsernameChange = (evt) => {
    this.setState({ usernameOrEmail: evt.target.value });
  };

  /**
   * Handles changes in Password input
   */
  handlePasswordChange = (evt) => {
    this.setState({ password: evt.target.value });
  };

  /**
   * State: username, password
   * isEnabled: boolean to enable button
   */
  render() {
    const { usernameOrEmail, password } = this.state;
    const isEnabled = usernameOrEmail.length > 0 && password.length > 0;
    return (
      <div id="wrapper" className="homepage img-homepage-headline main-img-background">

        <article>
          <div id="content" className="container">
            <div className="login-box z-depth-2">

              <h2 className="title">Log in</h2>

              <p>All fields are required</p>

              <div
                className="dates-input1"
              >
                <input
                  type="text"
                  required
                  name="username"
                  value={this.state.usernameOrEmail}
                  onChange={this.handleUsernameChange}
                  placeholder="Username or email"
                />
              </div>

              <div className="dates-input1">
                <input
                  type="password"
                  name="password"
                  required
                  value={this.state.password}
                  onChange={this.handlePasswordChange}
                  placeholder="Password"
                />
              </div>

              <div className="center-text forgot-password">
                <a className="primary-link" href="/reset">Forgot your password?</a>
              </div>

              <div className="message-two-lines center-text">
                    <span>
                      <ColorCircularProgress className={this.state.isLoading ? 'loading-spinner' : 'hidden'} />
                    </span>
                <span>
                      {this.showError()}
                    </span>
              </div>

              <div className="center">
                <button
                  type="button"
                  name="button"
                  className="btn-secondary waves-effect waves-light btn"
                  onClick={() => window.location.href = '/signup'}
                >
                  Create account
                </button>

                <button
                  type="button"
                  disabled={!isEnabled}
                  name="button"
                  className="btn-primary waves-effect waves-light btn"
                  onClick={this.sendDatas}
                >
                  Log in
                </button>
              </div>
            </div>
          </div>

        </article>
      </div>
    );
  }
}


export default Login;
