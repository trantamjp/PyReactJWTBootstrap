import React, { useContext, createContext } from "react";
import jwt from 'jwt-decode';

import { AUTH_LOGIN_URL, AUTH_LOGOUT_URL, AUTH_TOKEN_REFRESH_URL } from './config';

class AuthToken {
    constructor(type, token) {
        if (type in ['accessToken', 'refreshToken']) {
            throw new Error(`AuthToken type ${type} invalid`);
        }
        let decoded = {};
        if (token) {
            try { decoded = jwt(token) } catch (e) {
                console.error('JWT token invalid. Can not decode!');
            };
        }

        this.type = type;
        this.token = token;
        this.decoded = decoded;
        this._authUser = null;
        this.timeoutHandler = null;
    }

    exp() { // return timestampe
        return this.decoded['exp'] || null;
    }
    expDate() { // return Date object
        const exp = this.exp();
        return exp ? new Date(exp) : null;
    }
    expireIn() {
        return this.exp() * 1000 - Date.now();
    }
    isExpired() {
        return this.expireIn() < 0;
    }

    isNull() {
        return !this.token; // return true if null, undefined and ''
    }

    authUser() {
        if (!this._authUser) {
            this._authUser =
                Object.keys(this.decoded).length !== 0 ? {
                    'username': this.decoded['identity'],
                    ...this.decoded['user_claims'],
                } : {};
        }
        return this.isExpired() ? {} : this._authUser;
    }
}

const useAuthToken = (type) => {
    const [authToken, setAuthToken] = React.useState(() => {
        return new AuthToken(type, localStorage.getItem(type));
    });

    if (authToken.isExpired())
        localStorage.removeItem(type);

    React.useEffect(() => {
        if (authToken.isNull()) {
            localStorage.removeItem(type);
        } else {
            localStorage.setItem(type, authToken.token);
        }
    }, [authToken, type]);

    const setEncodedAuthToken = React.useCallback((token) => {
        setAuthToken(new AuthToken(type, token));
    }, [type]);

    return [authToken, setAuthToken, setEncodedAuthToken];
}

export const SessionContext = createContext(null);

export function useSessionContext() {
    return useContext(SessionContext);
}

export function SessionProvider(props) {

    const [refreshToken, , setEncodedRefreshToken] = useAuthToken('refreshToken');
    const [accessToken, , setEncodedAccessToken] = useAuthToken('accessToken');
    const sessionUser = () => accessToken.authUser();
    const isAuthenticated = () => Object.keys(sessionUser()).length !== 0;
    const BearerToken = () => 'Bearer ' + accessToken.token;
    const timeoutHandlerRef = React.useRef(null);

    const isFetchingRef = React.useRef(false);

    // return Promise
    const renewAccessToken = React.useCallback(() => {
        // reset the handler since we are handling it now.
        timeoutHandlerRef.current = null;

        // No refresh token => do nothing
        if (refreshToken.isExpired()) return;

        // return if we are currently working on it
        if (isFetchingRef.current) return;

        // declair that we are working on it
        isFetchingRef.current = true;

        fetch(AUTH_TOKEN_REFRESH_URL,
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + refreshToken.token
                },
            }).then(res => {
                if (!res.ok) {
                    throw res;
                }
                return res.json()
            })
            .then(authToken => {
                setEncodedAccessToken(authToken.access_token);
            })
            .catch((error) => {
                console.error('Error:', error);
            }).finally(() => {
                // declair that we have finished
                isFetchingRef.current = false;
            });

    }, [setEncodedAccessToken, refreshToken]);

    React.useEffect(() => {
        if (timeoutHandlerRef.current) {
            clearTimeout(timeoutHandlerRef.current);
            timeoutHandlerRef.current = null;
        }
        if (!accessToken.isNull()) {
            // set timer to refresh the access token 5 seconds before expiring
            timeoutHandlerRef.current = setTimeout(function () { renewAccessToken() }, accessToken.expireIn() - 5000);
        }
    }, [accessToken, renewAccessToken]);

    if (accessToken.isNull() && !refreshToken.isNull()) renewAccessToken();


    React.useEffect(() => {
        if (refreshToken.isExpired()) setEncodedAccessToken(null);
    }, [refreshToken, setEncodedAccessToken]);

    // Return a promise
    function login(credentials) {

        return fetch(AUTH_LOGIN_URL,
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            }).then(res => {
                if (!res.ok) {
                    throw res;
                }
                return res.json()
            })
            .then(authToken => {
                setEncodedRefreshToken(authToken.refresh_token);
                setEncodedAccessToken(authToken.access_token);
            })
            .catch((error) => {
                console.error('Error:', error);
                throw error;
            });
    }

    function logout() {
        fetch(AUTH_LOGOUT_URL,
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
        setEncodedRefreshToken(null);
    }

    return (
        <SessionContext.Provider value={{ login, logout, sessionUser, isAuthenticated, BearerToken }}>
            {props.children}
        </SessionContext.Provider>
    )
}
