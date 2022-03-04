import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import './App.css';
import NavBar from './components/NavBar';
//import { Route, Switch } from 'react-router-dom';
import { Route } from 'react-router-dom';
import SentenceView from  './components/SentenceView';
import 'bootstrap/dist/css/bootstrap.min.css';
//import Error from  './components/Error';


class App extends Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>Babelwriter 0.1</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>
          <link  rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
            crossorigin="anonymous" />
        </Helmet>
        <NavBar />
        <Route path="/" exact render={props => <SentenceView />} />

      </div>
    )
    //<Switch>
    // <Route path="/" exact render={props => <SentenceView />} />
    //<Route component={Error} />
    //</Switch>

  }
}

export default App;
