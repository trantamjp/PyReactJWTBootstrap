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

function LoginForm({
    username,
    password,
    handleSubmit,
    loading,
}) {

    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");

    function validateForm() {
        return formUsername.length > 0 && formPassword.length > 0;
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
                        onChange={e => setFormUsername(e.target.value)}
                    />
                </FormGroup>
                <FormGroup controlId="password" bssize="large">
                    <FormLabel>Password</FormLabel>
                    <FormControl
                        value={password}
                        onChange={e => setFormPassword(e.target.value)}
                        type="password"
                    />
                </FormGroup>
                <Button block bssize="large" disabled={!validateForm() || loading} type="submit">
                    Login
        </Button>
            </form>
        </Styles>
    );
}
export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = React.useState(false)

    const { setIsAuthenticated, setUserInfo, setRefreshToken } = useSessionContext();

    const handleSubmit = React.useCallback((username, password) => {

        // useEffect(() => {
        //     let isMounted = true; // track whether component is mounted


        setLoading(true);

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

                setLoading(false);
                setIsAuthenticated(true);
            })
            .catch(function (error) {
                console.log("Login failed", error);
                alert(error.msg);
                setLoading(false);
            });

        // return () => {
        //     isMounted = false;
        // };
        // });
    });

    return (
        <Styles>
            <LoginForm
                username={username}
                password={password}
                handleSubmit={handleSubmit}
                loading={loading}
            />
        </Styles>
    );
}