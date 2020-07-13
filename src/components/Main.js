import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Nav, Navbar, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { useSessionContext } from "../session";
import Home from './Home';
import CustomerTable from './Customer';
import FilmTable from './Film';
import { Login, Logout } from './Login';

const Main = () => {

  const { sessionUser, isAuthenticated } = useSessionContext();

  return (
    <>
      <Navbar bg="light" variant="light" className="mb-3">
        {/* <Navbar.Brand>Menu</Navbar.Brand> */}
        <Nav className="mr-auto">
          <LinkContainer to="/home">
            <Button variant="outline-info" className="mr-3">Home</Button>
          </LinkContainer>
          <LinkContainer to="/customers">
            <Button variant="outline-info" className="mr-3">Customers</Button>
          </LinkContainer>
          <LinkContainer to="/films">
            <Button variant="outline-info" className="mr-3">Films</Button>
          </LinkContainer>
          {isAuthenticated() ? '' :
            <LinkContainer to="/login">
              <Button variant="warning">Login</Button>
            </LinkContainer>}
        </Nav>
        {!isAuthenticated() ? '' :
          <Nav className="justify-content-end">
            <Nav.Link as="span">{sessionUser().username}</Nav.Link>
            <LinkContainer to="/logout" >
              <Button variant="success">Logout</Button>
            </LinkContainer>
          </Nav>
        }
      </Navbar>

      <Switch>
        <Route exact path='/customers'
          render={routeProps => (
            isAuthenticated() ? <CustomerTable {...routeProps} /> : <Login {...routeProps} />
          )} />
        <Route exact path='/films'
          render={routeProps => (
            isAuthenticated() ? <FilmTable {...routeProps} /> : <Login {...routeProps} />
          )} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/logout' component={Logout} />
        {/* Anything else */}
        <Route exact path='/home' component={Home} />
        <Redirect to="/home" />
      </Switch>
    </>
  );
};

export default Main;
