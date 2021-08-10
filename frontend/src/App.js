import React from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { withState } from './blog-content';
import Layout from './components/Layout/Layout';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import Toolbar from './components/Toolbar/Toolbar';
import LoginPage from './pages/Auth/Login';
import FeedPage from './pages/Feed/Feed';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import SignupPage from './pages/Auth/Signup';
import SinglePost from './pages/Feed/SinglePost/SinglePost';
import { SET_AUTH_DATA, LOGOUT, REMOVE_ERROR } from './store/actionTypes';
import './App.css';


class App extends React.Component {


  componentDidMount() {

    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }

    if (new Date(expiryDate) <= new Date()) {
      this.props.dispatch({ type: LOGOUT });
      this.logoutHandler();
      return;
    }

    const userId = localStorage.getItem('userId');
    const remainingMilliseconds = new Date(expiryDate).getDate() - new Date().getTime();
    this.props.dispatch({ type: SET_AUTH_DATA, userId: userId, token: token, isAuth: true });
    this.setAutoLogout(remainingMilliseconds);
  };

  logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiryDate');
  };

  setAutoLogout = millisecs => {
    setTimeout(() => {
      this.props.dispatch({ type: LOGOUT });
      this.logoutHandler();
    }, millisecs);
  };

  errorHandler = () => {
    this.props.dispatch({ type: REMOVE_ERROR });
  }

  render() {
    let routes = (
      <Switch>
        <Route path="/" exact render={props => (<LoginPage  {...props} logout={(secs) => this.setAutoLogout(secs)} />)} />
        <Route path="/signup" exact render={props => (<SignupPage  {...props} logout={(secs) => this.setAutoLogout(secs)} />)} />
        <Redirect to="/" />
      </Switch>
    );
  
    if (this.props.state.isAuth) {
      routes = (
        <Switch>
          <Route path="/" exact component={FeedPage} />
          <Route path="/:postId" exact component={SinglePost} />
        </Switch>
      )
    }

    return (
      <React.Fragment>
        <ErrorHandler error={this.props.state.error} onHandle={this.errorHandler} />
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onLogout={this.logoutHandler}
              />
            </Toolbar>
          }
        />
        {routes}
      </React.Fragment>
    );
  }

}

export default withRouter(withState(App));
