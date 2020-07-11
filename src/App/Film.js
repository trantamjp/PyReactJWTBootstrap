import React from 'react'
import { useTable, usePagination, useSortBy, useFilters } from 'react-table'
import { Table as BTable, Form, Image, Container, Button, Spinner, Modal, Pagination } from "react-bootstrap";
import { isEqual } from 'lodash';

import { useConfigContext, useSessionContext } from "../Session";

// Define a default UI for filtering
function DefaultColumnFilter({ column: { filterValue, Header, setFilter } }) {

    return (
        <>
            <Form.Control
                type="text"
                size="sm"
                value={filterValue || ""}
                placeholder={`Search ${Header}`}
                onClick={e => { e.stopPropagation(); }}
                onChange={e => {
                    setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
                }}
            />
        </>
    );
}

function Loading({ loading }) {
    return (
        <Modal
            show={loading}
            size="sm"
            centered
            backdrop="static"
            onHide={() => { }}>
            <Modal.Body><Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                className="mr-2"
                aria-hidden="true" />Loading...</Modal.Body>
        </Modal>
    );
}

function FetchError({ show }) {

    const [showModal, setshowModal] = React.useState(show);
    const handleClose = () => setshowModal(false);

    return (
        <Modal
            show={showModal}
            size="sm"
            centered
            backdrop="static"
            onHide={handleClose}>
            <Modal.Body>
                <p>Failed to fetch data. Please try again!</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}

function Paging({ pageIndex, pageCount, gotoPage, setPageSize }) {
    return (
        <Pagination>
            <Pagination.First onClick={() => gotoPage(0)} disabled={pageIndex + 1 <= 1} />
            <Pagination.Prev onClick={() => gotoPage(pageIndex - 1)} disabled={pageIndex + 1 <= 1} />

            {pageIndex - 2 >= 1 ?
                <Pagination.Ellipsis disabled />
                : null}

            {pageIndex - 1 >= 1 ?
                <Pagination.Item onClick={() => gotoPage(pageIndex - 2)} >{pageIndex - 1}</Pagination.Item>
                : null}
            {pageIndex >= 1 ?
                <Pagination.Item onClick={() => gotoPage(pageIndex - 1)} >{pageIndex}</Pagination.Item>
                : null}
            <Pagination.Item active>{pageIndex + 1}</Pagination.Item>
            {pageIndex + 2 <= pageCount ?
                <Pagination.Item onClick={() => gotoPage(pageIndex + 1)} >{pageIndex + 2}</Pagination.Item>
                : null}
            {pageIndex + 3 <= pageCount ?
                <Pagination.Item onClick={() => gotoPage(pageIndex + 2)} >{pageIndex + 3}</Pagination.Item>
                : null}

            {pageIndex + 4 <= pageCount ?
                <Pagination.Ellipsis disabled />
                : null}

            <Pagination.Next onClick={() => gotoPage(pageIndex + 1)} disabled={pageIndex + 2 > pageCount} />
            <Pagination.Last onClick={() => gotoPage(pageCount - 1)} disabled={pageIndex + 2 > pageCount} />

            <Form inline>
                <span className="mx-2">Page {pageIndex + 1} of {pageCount}. Go to page:</span>
                <Form.Control
                    type="number"
                    size="sm"
                    className="mr-2"
                    value={pageIndex + 1}
                    onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                        gotoPage(page)
                    }}
                />
                <Form.Control
                    as="select"
                    size="sm"
                    className="mr-2"
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </Form.Control>
            </Form>

        </Pagination>

    );
}

// Let's add a fetchData method to our Table component that will be used to fetch
// new data when pagination state changes
// We can also add a loading state to let our table know it's loading new data
function Table({
    columns: originalColumns,
    apiData,
    fetchData,
}) {
    const fetchDelay = 1000; // delay fetching after each filter input in ms
    const typingTimeout = React.useRef(0); // store timeout handler to delay filter by fetchDelay ms
    const prevFetchedProps = React.useRef({}); // store previous fetching props. Only re-filter when changed
    const [loading, setLoading] = React.useState(false)

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter
        }),
        []
    );

    if (!apiData.hasOwnProperty('data')) {
        apiData['data'] = [];
    }

    const controlledPageCount = apiData['pageCount'] || 0;

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        pageCount,
        gotoPage,
        setPageSize,
        allColumns,
        // Get the state from the instance
        state: { pageIndex, pageSize, filters, sortBy },
    } = useTable(
        {
            columns: originalColumns,
            data: apiData.data,
            defaultColumn,
            initialState: { pageIndex: 0, pageSize: 10 },
            manualPagination: true,
            pageCount: controlledPageCount,
            manualFilters: true,
            manualSortBy: true,
        },
        useFilters,
        useSortBy,
        usePagination,
    )

    // Listen for changes in filters and use the state to fetch our new data
    React.useEffect(() => {
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
            typingTimeout.current = null;
        }

        if (
            prevFetchedProps.current.pageIndex !== pageIndex ||
            prevFetchedProps.current.pageSize !== pageSize ||
            prevFetchedProps.current.sortBy !== sortBy
        ) {
            setLoading(true);
            // Those changes need to fetch the new data right away
            prevFetchedProps.current = { pageIndex, pageSize, filters, sortBy };
            fetchData({ allColumns, pageIndex, pageSize, filters, sortBy })
                .finally(() => { setLoading(false) });
        } else if (!isEqual(filters, prevFetchedProps.current.filters)) {
            // only re-filter when filters changed
            typingTimeout.current = setTimeout(function () {
                setLoading(true);
                prevFetchedProps.current = { pageIndex, pageSize, filters, sortBy };
                fetchData({ allColumns, pageIndex, pageSize, filters, sortBy })
                    .finally(() => { setLoading(false) });
            }, fetchDelay);
        }
    },
        [fetchData, allColumns, filters, pageIndex, pageSize, sortBy])

    // Render the UI for your table
    return (
        <Container fluid>
            <h2>Film List</h2>
            <BTable {...getTableProps()} striped bordered hover>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(
                                    column.getSortByToggleProps({
                                        title: 'Toggle sort by ' + column.Header
                                    }),
                                )}>
                                    <div>
                                        {
                                            column.canSort ?
                                                (column.isSorted ?
                                                    (column.isSortedDesc ? <Image src="images/sort_desc.png" /> : <Image src="images/sort_asc.png" />)
                                                    : <Image src="images/sort_both.png" />)
                                                : ''
                                        }
                                        {column.render('Header')}
                                    </div>
                                    <div>{column.canFilter ? column.render("Filter") : null}</div>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                    <tr>
                        {
                            apiData.error ? (
                                <td colSpan="10000">
                                    Failed to fetch data.
                                </td>
                            ) :
                                (
                                    <td colSpan="10000">
                                        Showing {pageIndex * pageSize + 1} to {pageIndex * pageSize + apiData.data.length} of {apiData.recordsFiltered} entries
                                        {apiData.recordsFiltered < apiData.recordsTotal ? "(filtered from " + apiData.recordsTotal + " total entries)" : ""}
                                    </td>
                                )
                        }
                    </tr>
                </tbody>
            </BTable>
            {/* Pagination */}
            <Paging
                pageIndex={pageIndex}
                pageCount={pageCount}
                gotoPage={gotoPage}
                setPageSize={setPageSize}
            />

            <Loading loading={loading} />
            {apiData.error ? <FetchError show={!!apiData.error} /> : null}
        </Container>
    )
}

function FilmTable(props) {

    const { BearerToken } = useSessionContext();
    const { FILM_API_URL } = useConfigContext();

    const columns = React.useMemo(
        () => [
            {
                Header: 'Title',
                accessor: 'title',
            },
            {
                Header: 'Category',
                accessor: ((originalRow, rowIndex) =>
                    originalRow.categories.map(category => category.name).join(', ')
                ),
                id: 'categories.category',
                disableSortBy: true,
            },
            {
                Header: 'Actors',
                accessor: ((originalRow, rowIndex) =>
                    originalRow.actors.map(actor => actor.full_name).join(', ')
                ),
                id: 'actors.full_name',
                disableSortBy: true,
            },
            {
                Header: 'Length',
                accessor: 'length',
            },
            {
                Header: 'Rating',
                accessor: 'rating',
            },
            {
                Header: 'Lang',
                accessor: 'language.name',
            },
            {
                Header: 'Price',
                accessor: 'rental_rate',
            },
        ],
        []
    )

    // We'll start our table without any data
    const [apiData, setApiData] = React.useState({ data: [], recordsFiltered: 0, recordsTotal: 0 })
    const fetchIdRef = React.useRef(0)

    // return Promise
    const fetchData = React.useCallback(({ allColumns, pageSize, pageIndex, filters, sortBy }) => {
        // Give this fetch an ID
        const fetchId = ++fetchIdRef.current;

        const apiSortBy = sortBy.map(entry => (
            {
                ...entry,
                sort_type: allColumns.find(col => col.id === entry.id && col.sortedIndex >= 0)["sortType"]
            }
        ));

        const apiFilters = filters.map(entry => (
            {
                ...entry,
                filter: allColumns.find(col => col.id === entry.id)['filter']
            }
        ));

        return fetch(FILM_API_URL,
            {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': BearerToken()
                },
                body: JSON.stringify({
                    fetch_id: fetchId,
                    limit: pageSize,
                    offset: pageIndex * pageSize,
                    filters: apiFilters,
                    orders: apiSortBy,
                })
            }).then(res => res.json())
            .then(response => {
                if (response.fetch_id === fetchIdRef.current) {
                    setApiData({
                        data: response.data,
                        recordsFiltered: response.records_filtered,
                        recordsTotal: response.records_total,
                        pageCount: Math.ceil(response.records_filtered / pageSize)
                    });
                }
            })
            .catch(function (error) {
                if (typeof (error) != "string") {
                    error = error.toString()
                }
                setApiData({ error: error });
            });

    }, [FILM_API_URL, BearerToken]);

    return (
        <Table
            columns={columns}
            apiData={apiData}
            fetchData={fetchData}
        />
    )
}

export default FilmTable
