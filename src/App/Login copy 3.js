import React, { useState } from "react";
import { Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSessionContext } from "../contextLib";
import jwt from 'jwt-decode'

import styled from 'styled-components'

const Styles = styled.div`

padding: 60px 0;

form {
  margin: 0 auto;
  max-width: 320px;

  div {

  }
}
`

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submiting, setSubmiting] = React.useState();

    const { setIsAuthenticated, setUserInfo, setRefreshToken } = useSessionContext();

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    // React.useEffect(() => {
    //     let isMounted = true;
    //     if (submiting) {
    //         fetchData()
    //     }
    //     return () => { isMounted = false };
    // },
    //     // eslint-disable-next-line
    //     [submiting])

    function fetchData() {

        fetch('http://127.0.0.1:5005/auth/login',
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            }).then(res => res.json())
            .then(response => {
                console.log('response:', response);
                const accessToken = jwt(response.access_token);
                console.log('accessToken:', accessToken);
                const userInfo = { 'username': accessToken['identity'], ...(accessToken['user_claims']) };
                console.log('userInfo:', userInfo);
                setUserInfo(userInfo);

                setSubmiting(false);
                setIsAuthenticated(true);
            })
            .catch(function (error) {
                console.log("Login failed", error);
                alert(error.msg);
                setSubmiting(false);
            });
    }

    function handleSubmit(event) {
        setSubmiting(true);
        event.preventDefault();
        event.stopPropagation();
    }
    return (
        <Styles>
            <form onSubmit={handleSubmit}>
                <FormGroup controlId="username" bssize="large">
                    <FormLabel>Username</FormLabel>
                    <FormControl
                        autoFocus
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </FormGroup>
                <FormGroup controlId="password" bssize="large">
                    <FormLabel>Password</FormLabel>
                    <FormControl
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                </FormGroup>
                <Button block bssize="large" disabled={!validateForm() || submiting} type="submit">
                    Login
        </Button>
            </form>
        </Styles>
    );
}