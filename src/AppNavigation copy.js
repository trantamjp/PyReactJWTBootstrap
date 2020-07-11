import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components'
import { useSessionContext } from "./Session";

const Styles = styled.div`
  nav ul {
    list-style: none;
    display: flex;
    background-color: black;
    margin-bottom: 20px;
    position: relative;

    li {
      padding: 20px;

      a {
        color: white;
        text-decoration: none;
      }

      .logged-in {
        right: 0;
        position: absolute;
        font-style: italic;
        padding: 10px;
        background-color: antiquewhite;
        a {
          color: black;
        }    
      }
    }
  }

  // nav ul > li:last-child {
  //   right: 0;
  //   position: absolute;
  // }

  // nav ul li {
  //   padding: 20px;
  // }

  // nav ul li a {
  //   color: white;
  //   text-decoration: none;
  // }

  // nav ul li .userinfo {
  //   color: bisque;
  //   font-style: italic;
  //   padding: 10px;

  //   .logout {
  //     background-color: antiquewhite;
  //   }
  // }

  // nav ul li .logout {
  //   font-style: italic;
  //   padding: 10px;
  //   background-color: antiquewhite;
  //   a {
  //     color: black;
  //   }
  // }

  .current {
    border-bottom: 4px solid white;
  }
`;

const Navigation = () => {

  const { getSessionUser } = useSessionContext();
  const sessionUser = getSessionUser();

  return (
    <Styles>
      <nav>
        <ul>
          <li><NavLink activeClassName="current" to='/home'>Home</NavLink></li>
          <li><NavLink activeClassName="current" to='/customers'>Customer (Protected Area)</NavLink></li>
          <li><NavLink activeClassName="current" to='/films'>Film (Protected Area)</NavLink></li>

          {sessionUser ?
            (
              <li className="logged-in">
                <span className="userinfo">Logged-in as {sessionUser.username}</span>
                <span className="logout-btn">
                  <NavLink activeClassName="current" to="/logout">Logout</NavLink>
                </span>
              </li>
            ) :
            (
              <li className="login">
                <span className="login-btn">
                  <NavLink activeClassName="current" to="/login">Login</NavLink>
                </span>
              </li>
            )
          }
        </ul>
      </nav>
    </Styles>
  )
};

export default Navigation;
