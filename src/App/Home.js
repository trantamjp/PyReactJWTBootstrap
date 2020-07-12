import React from 'react';
import { Container } from "react-bootstrap";
import { useConfigContext } from "../Session";

const Home = () => {
    const { CUSTOMER_API_URL, FILM_API_URL } = useConfigContext();

    return (
        <Container fluid>
            <h2 className="mt-2">Github</h2>
            <a href="https://github.com/trantamjp/PyReactJWTBootstrap" target="_blank" rel="noopener noreferrer">
                https://github.com/trantamjp/PyReactJWTBootstrap</a>
            <h2 className="mt-2">Sample Data</h2>
            <p>Download from here <a href="https://www.postgresqltutorial.com/postgresql-sample-database/" target="_blank" rel="noopener noreferrer">
                https://www.postgresqltutorial.com/postgresql-sample-database/</a></p>
            <p className="mt-4">Please click the link from the top menu</p>
            <ol>
                <li>
                    <p>Customer List</p>
                    <p>DataTable with server-side processing, pulling customer data from the API from {CUSTOMER_API_URL}.
                </p>
                </li>
                <li>
                    <p>Films List</p>
                    <p>DataTable with server-side processing, pulling customer data from the API from {FILM_API_URL}.
                </p>
                </li>
            </ol>
        </Container>
    )
};

export default Home;
