import React from 'react';
import '../css/App.css';
import * as qs from 'query-string';

class Verification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: 0, // If 0, the page will send the code to the backend. If 1, display "account verified". If 2, display error
            errorType: '',
            username: '',
            code: '',
        };
    }

    /**
     * Parses the URL and fetches a request to /auth/verify with what has been parsed
     * Displays a message if successful or not response
     */
    componentDidMount() {
        const parsed = qs.parse(window.location.search);

        if (!Object.keys(parsed).includes('code') || !Object.keys(parsed).includes('email')) {
            this.setState({ show: 2 });
            return;
        }
        fetch(`http://localhost:8080/auth/verify/${parsed.email}`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: parsed.code,
        })
        .then((res) => {
            if (res.status === 200) {
                this.setState({ show: 1 });
                return null;
            }
                this.setState({ show: 2 });
                return res.json();
        })
        .then((data) => {
            if (data !== null) this.setState({ errorType: data.message });
        })
        .catch((e) => this.setState({ show: 2, errorType: e.toString() }));
    }

    /**
     * Depending on the value of this.state.show, returns either the form to fill, or the result of the authentication.
     */
    showValidation = () => {
        if (this.state.show === 1) {
            return (
              <span className="success-message">
                Account verified.
                <a href="/login">Click here</a>
                {' '}
                to log in.
              </span>
);
        }
        if (this.state.show === 2) {
            return (<span className="error-message">{this.state.errorType}</span>);
        }
    }

    /**
     * This page will feature a form that will be sent to the backend.
     * Depending on the backend response, it will feature different messages.
     */
    render() {
        return (
          <article>
            <div id="content" className="container">
              <div className="content-box1 content-box z-depth-2">
                {this.showValidation()}
              </div>
            </div>
          </article>
        );
    }
}

export default Verification;
