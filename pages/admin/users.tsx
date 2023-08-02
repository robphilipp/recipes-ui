import React, {JSX, useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {useRouter} from "next/router";
import Centered from "../../components/Centered";
import {
    alpha,
    Box,
    Card,
    CardHeader,
    Checkbox,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {RecipesUser} from "../../components/users/RecipesUser";
import Link from "next/link";
import Date from "../../components/Date";
import {RoleType} from "../../components/users/Role";
import {DateTime} from "luxon";
import {visuallyHidden} from "@mui/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList'
import {Long} from "mongodb";

type Row = {
    email: string
    username: string
    createdOn: DateTime
    emailVerified: DateTime | null
    modifiedOn: DateTime | null
    deletedOn: DateTime | null
    role: RoleType
}

type HeaderCell = {
    id: keyof Row
    label: string
    numeric: boolean
    disablePadding: boolean
}

const headCells: readonly HeaderCell[] = [
    {id: 'email', numeric: false, disablePadding: true, label: 'Email'},
    {id: 'username', numeric: false, disablePadding: true, label: 'Username'},
    {id: 'role', numeric: false, disablePadding: true, label: 'Role'},
    {id: 'createdOn', numeric: false, disablePadding: true, label: 'Created'},
    {id: 'emailVerified', numeric: false, disablePadding: true, label: 'Email verified'},
    {id: 'modifiedOn', numeric: false, disablePadding: true, label: 'Last Modified'},
    {id: 'deletedOn', numeric: false, disablePadding: true, label: 'Deleted'},
]

type EnhancedTableProps = {
    numSelected: number
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Row) => void
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
    order: Order
    orderBy: string
    rowCount: number
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const {
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort
    } = props

    const createSortHandler =
        (property: keyof Row) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property)
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

type EnhancedTableToolbarProps = {
    numSelected: number
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    City Users
                </Typography>
            )}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Filter list">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

type TableProps = {
    rows: Array<Row>
}
function EnhancedTable(props: TableProps) {
    const {rows} = props

    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof Row>('email');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Row) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.email);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDense(event.target.checked);
    };

    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
        () => rows.slice()
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
            // stableSort(rows, getComparator(order, orderBy)).slice(
            //     page * rowsPerPage,
            //     page * rowsPerPage + rowsPerPage,
            // ),
        [rows, order, orderBy, page, rowsPerPage],
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.email);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row.email)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.email}
                                        selected={isItemSelected}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                        >
                                            {row.email}
                                        </TableCell>
                                        <TableCell align="right">{row.username}</TableCell>
                                        <TableCell align="right">{row.role}</TableCell>
                                        <TableCell align="right">{row.createdOn.toMillis()}</TableCell>
                                        <TableCell align="right">{row.emailVerified?.toMillis()}</TableCell>
                                        <TableCell align="right">{row.modifiedOn?.toMillis()}</TableCell>
                                        <TableCell align="right">{row.deletedOn?.toMillis()}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            <FormControlLabel
                control={<Switch checked={dense} onChange={handleChangeDense} />}
                label="Dense padding"
            />
        </Box>
    );
}

export default function ManageUsers(): JSX.Element {
    const router = useRouter()

    const {isLoading, error, data} = useQuery(
        ['users-all'],
        () => axios.get<Array<RecipesUser>>(`/api/users`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject([])
            })
    )

    if (isLoading) {
        return <Centered><Typography>Looking for Booboo&apos;s friends...</Typography></Centered>
    }
    if (error) {
        return <Centered><Typography>Unable to locate Booboo&apos;s friends!</Typography></Centered>
    }

    const users: Array<RecipesUser> = data?.data || []
    const convertTimestamp = (time: number | Long | null) => time === null ? null : DateTime.fromMillis(time as number)

    const rows: Array<Row> = users.map(user => ({
        email: user.email || "",
        username: user.name || "",
        role: user.role?.name,
        emailVerified: convertTimestamp(user.emailVerified),
        createdOn: convertTimestamp(user.createdOn) || DateTime.utc(),
        modifiedOn: convertTimestamp(user.modifiedOn),
        deletedOn: convertTimestamp(user.deletedOn)
    }))

    return (<>
        <Typography>Manage Users</Typography>
        {/*<List>*/}
        {/*    {users.map((user, index) => <UserCard key={user.email} index={index} user={user}/>)}*/}
        {/*</List>*/}
        <EnhancedTable rows={rows}/>
    </>)
}

type UserCardProps = {
    index: number
    user: RecipesUser
}

function UserCard(props: UserCardProps): JSX.Element {
    const {user, index} = props
    const theme = useTheme()

    return (
        <Card
            key={`${user.email}-card`}
            variant="outlined"
            sx={{
                maxWidth: {
                    xs: 500,
                    md: 500
                },
                marginBottom: 1
            }}
        >
            <CardHeader
                title={<Link href={`/recipes/${user.id}`}
                             style={{textDecoration: 'none', color: theme.palette.primary.main}}>
                    {user.email}
                </Link>}
                subheader={<div>
                    <Typography sx={{fontSize: '0.7em', marginTop: '-0.2em'}}>
                        Created on: <Date epochMillis={
                        (user.createdOn) as number
                    }/>
                    </Typography>
                    {user.modifiedOn && <Typography sx={{fontSize: '0.7em', marginTop: '-0.2em'}}>
                        Last modified On: <Date epochMillis={
                        (user.modifiedOn) as number
                    }/>
                    </Typography>}
                    <Typography sx={{fontSize: '0.9em', marginTop: '-0.2em'}}>
                        {user.name ?
                            <span style={{marginRight: 25}}>Username: {user.name}</span> :
                            <span/>
                        }
                    </Typography>
                </div>}
                // action={user.id ? renderEditDelete(recipe.id) : <></>}
            />
        </Card>
    )

}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string | DateTime | null },
    b: { [key in Key]: number | string | DateTime | null },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}