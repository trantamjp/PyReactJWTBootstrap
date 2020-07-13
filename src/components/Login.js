import React from "react";
import { Button, FormGroup, FormControl, FormLabel, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { useSessionContext } from "../session";
import { Modal, Alert } from 'react-bootstrap';

export function Logout(props) {

    const history = useHistory();
    const { logout } = useSessionContext();

    React.useEffect(
        () => {
            logout();
            history.push("/home");
        },
        [history, logout]
    );

    return <div>Logging out!</div>;
}

function LoginError(props) {
    return (
        <Modal
            {...props}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.title ? props.title : 'Login Error'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>{props.messageHeader}</h4>
                <p>
                    {props.message}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export function Login(props) {

    const history = useHistory();
    const { login } = useSessionContext();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const [errorShowing, setErrorShowing] = React.useState(false);
    const [loginErrorMessage, setLoginErrorMessage] = React.useState(null);

    let prevLocation = props.location ? props.location.pathname : '/home';
    if (prevLocation === '/login')
        prevLocation = '/home';

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        login({
            username: username,
            password: password,
        })
            .then(() => {
                history.push(prevLocation);
            })
            .catch(function (error) {
                if (error instanceof Response) {
                    setLoginErrorMessage('Your username and/or password do not match! Please try again.');
                } else {
                    setLoginErrorMessage('Connection failed. Please check your internet connection!');
                }
                setErrorShowing(true);
            }).finally(() => { setLoading(false); });
    }

    function isSubmitBtnCanClick() {
        return username.length > 0 && password.length > 0;
    }

    return (
        <Container fluid style={{ maxWidth: 460 }}>
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <FormGroup>
                    <FormLabel>Username</FormLabel>
                    <FormControl
                        autoFocus
                        type="email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <FormLabel>Password</FormLabel>
                    <FormControl
                        type="password"
                        value={password}
                        xs="{2}"
                        onChange={e => setPassword(e.target.value)}
                    />
                </FormGroup>
                <Button block
                    type="submit"
                    disabled={!isSubmitBtnCanClick() || loading}>
                    Login
                    </Button>
            </form>
            <LoginError
                show={errorShowing}
                onHide={() => setErrorShowing(false)}
                message={loginErrorMessage ? loginErrorMessage : 'Network response was not ok'}
                backdrop="static"
            />
            <div className="mt-5">
                <h5>Test login accounts</h5>
                <Alert variant="warning">
                    <div>Username: Mike.Hillyer@sakilastaff.com</div>
                    <div>Password: 12345</div>
                </Alert>
                <Alert variant="warning">
                    <div>Username: Jon.Stephens@sakilastaff.com</div>
                    <div>Password: 67890</div>
                </Alert>
            </div>
        </Container>
    );
}
