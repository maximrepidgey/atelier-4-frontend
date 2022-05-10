import React from 'react';
import './css/App.css';
import 'materialize-css'; // It installs the JS asset only
import 'materialize-css/dist/css/materialize.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Header from './components/Header';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import Verification from './components/Verification';
import ChangePassword from './components/ChangePassword';
import Dashboard from './components/Dashboard';
import House from './components/House';
import EditRoom from './components/EditRoom';
import AddRoom from './components/AddRoom';
import Room from './components/Room';
import Devices from './components/Devices';
import CoupleDevices from './components/devices/CoupleDevices';
import EditDevice from './components/EditDevice';
import AddDevice from './components/AddDevice';
import MyGuests from './components/MyGuests';
import AddGuest from './components/AddGuest';
import SharedWithMe from './components/shared/SharedWithMe';
import SharedWithGuests from './components/shared/SharedWithGuests';
import Scenes from './components/Scenes';
import AddScene from './components/AddScene';
import EditScene from './components/EditScene';
import Automations from './components/automation/Automations';
import AddAutomation from './components/AddAutomation';
import EditAutomation from './components/EditAutomation';
import EditSensor from './components/EditSensor';
import EditSecurityCamera from './components/EditSecurityCamera';
import Simulations from './components/Simulations';
import LogOut from './components/LogOut';
import ResendEmail from './components/ResendEmail';
import Error404 from './components/Error404';


import Footer from './components/Footer';

class App extends React.Component {
  constructor(props) {
    super(props);
    let username = '';
    let sessionToken = '';

    try {
      username = localStorage.getItem('username');
      sessionToken = localStorage.getItem('session_token');
    } catch (e) {
      console.log(e);
    }

    this.state = {
      loggedIn: true,
      username,
      session_token: sessionToken,

      loginAccess: true,
    };
  }

  /**
   * Checks localStorage values and updates the state accordingly
   */
  componentDidMount() {
    const newUsername = localStorage.getItem('username');
    const newSessionToken = localStorage.getItem('session_token');
    const newLoggedIn = localStorage.getItem('loggedIn');

    if (newLoggedIn === 'true') {
      fetch('http://localhost:8080/auth/validate/', {
        method: 'POST',
        headers: {
          user: newUsername,
          'session-token': newSessionToken,
        },
      })
      .then((res) => (res.status === 200
        ? this.setState({
          username: newUsername,
          session_token: newSessionToken,
          loggedIn: newLoggedIn,
          loginAccess: false,
        })
        : this.logOut(0)));
    } else {
      this.setState({
        username: '', session_token: '', loggedIn: false, loginAccess: true,
      });
    }
  }

  /**
   * Used to set username and session token
   * If logged in, redirects to /
   */
  logIn = (user, token) => {
    this.setState({
      username: user,
      session_token: token,
      loggedIn: true,
    });

    localStorage.setItem('username', user);
    localStorage.setItem('session_token', token);
    localStorage.setItem('loggedIn', 'true');

    if (this.state.loggedIn) {
      window.location.href = '/';
    }
  }

  /**
   * Used to log out.
   * Redirects to /
   * @param {number} exitCode - if 0, normal log out. If 1, expired session token.
   */
  logOut = (exitCode) => {
    this.setState({
      username: '',
      session_token: '',
      loggedIn: false,
      loginAccess: true,
    });

    localStorage.setItem('username', '');
    localStorage.setItem('session_token', '');
    localStorage.setItem('loggedIn', 'false');

    if (exitCode === 1) {
      alert('Session expired. Please log in again.');
    }

    window.location.href = '/';
  }

  /**
   * It returns the "Access Denied" page
   */
  accessDenied = () => (
    <div id="content" className="container">
      <section className="content-box z-depth-2">
        <div>
          <p><b>Access Denied</b></p>
        </div>
      </section>
    </div>
  )

  /**
   * Return Device icon path
   * @param {string} type - the device type
   * @return {string} the path to the device icon
   */
  findPathDevice = (type) => {
    let path = '/img/icons/devices/';
    if (type === '1') path += 'bulb-regular';
    else if (type === '2') path += 'bulb-led';
    else if (type === '3') path += 'switch';
    else if (type === '4') path += 'dimmer-state';
    else if (type === '5') path += 'dimmer-regular';
    else if (type === '6') path += 'smart-plug';
    else if (type === '7') path += 'sensor-humidity';
    else if (type === '8') path += 'sensor-light';
    else if (type === '9') path += 'sensor-temperature';
    else if (type === '10') path += 'sensor-motion';
    else if (type === '11') path += 'automation-thermostat';
    else if (type === '12') path += 'smart-curtains';
    else if (type === '13') path += 'security-camera';
    else path += 'unknown-device';
    path += '.svg';
    return path;
  }

  /**
   * Return Room icon/background path
   * @param {string} type
   * @param {boolean} flag: if false icon, if true background
   */
  findPathRoom = (type, flag) => {
    let path = './img/';
    if (flag) {
      path += 'backgrounds/rooms/background-';
    } else {
      path += 'icons/rooms/icon-';
    }
    path += type;
    path += '.svg';
    return path;
  }


  /**
   * Take cares of switching from one path to the other, adding the Header and the Footer.
   * It only calls different components and deciding which ones to call, it has no pure html.
   */
  render() {
    return (
      <Router>

        <div id="wrapper">
          <Header
            loggedIn={this.state.loggedIn}
          />

          <main>
            <Switch>

              <Route path="/login">
                {this.state.loginAccess
                  ? (
                    <Login
                      logIn={this.logIn}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/signup">
                {this.state.loggedIn ? this.accessDenied()
                  : <Signup />}
              </Route>

              <Route path="/reset">
                <ResetPassword />
              </Route>

              <Route path="/verification">
                <Verification />
              </Route>

              <Route path="/changepassword">
                <ChangePassword />
              </Route>

              <Route path="/house">
                {this.state.loggedIn
                  ? (
                    <House
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editRoom">
                {this.state.loggedIn
                  ? (
                    <EditRoom
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                      findPathRoom={this.findPathRoom}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/addRoom">
                {this.state.loggedIn
                  ? (
                    <AddRoom
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                      findPathRoom={this.findPathRoom}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/room">
                {this.state.loggedIn
                  ? (
                    <Room
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/devices">
                {this.state.loggedIn
                  ? (
                    <Devices
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editDevice">
                {this.state.loggedIn
                  ? (
                    <EditDevice
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                      findPathDevice={this.findPathDevice}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/addDevice">
                {this.state.loggedIn
                  ? (
                    <AddDevice
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                      findPathDevice={this.findPathDevice}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/devicesCoupling">
                {this.state.loggedIn
                  ? (
                    <CoupleDevices
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                      findPathDevice={this.findPathDevice}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/scenes">
                {this.state.loggedIn
                  ? (
                    <Scenes
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/addScene">
                {this.state.loggedIn
                  ? (
                    <AddScene
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editScene">
                {this.state.loggedIn
                  ? (
                    <EditScene
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/automations">
                {this.state.loggedIn
                  ? (
                    <Automations
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/addAutomation">
                {this.state.loggedIn
                  ? (
                    <AddAutomation
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editAutomation">
                {this.state.loggedIn
                  ? (
                    <EditAutomation
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/guests">
                {this.state.loggedIn
                  ? (
                    <MyGuests
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/addGuest">
                {this.state.loggedIn
                  ? (
                    <AddGuest
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/sharedWithMe">
                {this.state.loggedIn
                  ? (
                    <SharedWithMe
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/shared">
                {this.state.loggedIn
                  ? (
                    <SharedWithGuests
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/simulations">
                {this.state.loggedIn
                  ? (
                    <Simulations
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editSensor">
                {this.state.loggedIn
                  ? (
                    <EditSensor
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/editCamera">
                {this.state.loggedIn
                  ? (
                    <EditSecurityCamera
                      username={this.state.username}
                      session_token={this.state.session_token}
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/logout">
                {this.state.loggedIn
                  ? (
                    <LogOut
                      logOut={this.logOut}
                    />
                  )
                  : this.accessDenied()}
              </Route>

              <Route path="/changepassword">
                <ChangePassword />
              </Route>

              <Route path="/resend">
                <ResendEmail />
              </Route>

              <Route exact path="/">
                {this.state.loggedIn
                  ? (
                    <Dashboard
                      username={this.state.username}
                      session_token={this.state.session_token}
                    />
                  )
                  : <Homepage />}
              </Route>

              <Route path="*">
                <Error404 />
              </Route>


            </Switch>
          </main>

          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
