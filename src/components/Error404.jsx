import React from 'react';
import '../css/App.css';

class Error404 extends React.Component {
    /**
     * Renders Error404 page
     */
    render() {
        return (
          <article>
            <div id="content" className="container">
              <section className="content-box z-depth-2">
                <div className="row">
                  <h3 className="col center">404 error</h3>
                </div>

                <div>
                  <p>The requested page cannot be found.</p>
                </div>

                <div className="center">
                  <a href="/" className="waves-effect waves-light btn btn-primary col l5">Home</a>
                </div>
              </section>
            </div>
          </article>
        );
    }
}

export default Error404;
