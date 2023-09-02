import React, {useMemo, useState} from "react"
import {
    alpha,
    Box,
    Button,
    Checkbox,
    IconButton,
    Paper,
    Stack,
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
    Typography
} from "@mui/material"
import {DateTime} from "luxon"
import {visuallyHidden} from "@mui/utils"
import DeleteIcon from "@mui/icons-material/Delete"
import FilterListIcon from '@mui/icons-material/FilterList'
import {Mail, PersonAdd, PersonOff, TaskAlt} from "@mui/icons-material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";

export type UsersTableRow = {
    email: string
    username: string
    createdOn: DateTime
    emailVerified: boolean
    emailVerifiedOn: DateTime | null
    modifiedOn: DateTime | null
    deletedOn: DateTime | null
    role: string
}

type HeaderCell = {
    id: keyof UsersTableRow
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
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof UsersTableRow) => void
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
        (property: keyof UsersTableRow) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property)
        }

    return (
        <TableHead>
            <TableRow>
                <TableCell/>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='center'
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
    )
}

type EnhancedTableToolbarProps = {
    numSelected: number
    onDelete: () => void
    onEdit: () => void
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const {numSelected, onDelete, onEdit} = props

    return (
        <Toolbar
            sx={{
                pl: {sm: 2},
                pr: {xs: 1, sm: 1},
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{flex: '1 1 100%'}}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    City Users
                </Typography>
            )}
            {numSelected === 1 && <Tooltip title="Edit User">
                <IconButton onClick={onEdit}>
                    <ModeEditIcon/>
                </IconButton>
            </Tooltip>}
            {numSelected > 0 ? (
                <Tooltip title="Delete User">
                    <IconButton onClick={onDelete}>
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Filter list">
                    <IconButton>
                        <FilterListIcon/>
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    )
}

function formatDatetime(dateTime: DateTime | null, format: string = 'yyyy-MM-dd HH:mm'): string {
    if (dateTime == null) {
        return ""
    }
    return dateTime.toFormat(format)
}

type TableProps = {
    rows: Array<UsersTableRow>
    onResendEmail: (user: UsersTableRow) => void
    onEdit: (user: UsersTableRow) => void
    onAddUser: () => void
    onDeleteUsers: (users: readonly UsersTableRow[]) => void
    isAddingUser: boolean
}

export default function UsersTable(props: TableProps) {
    const {rows, onResendEmail, onEdit, onAddUser, onDeleteUsers, isAddingUser} = props

    const [order, setOrder] = useState<Order>('asc')
    const [orderBy, setOrderBy] = useState<keyof UsersTableRow>('email')
    const [selected, setSelected] = useState<readonly UsersTableRow[]>([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    function handleRequestSort(event: React.MouseEvent<unknown>, property: keyof UsersTableRow): void {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    // function handleSelectAllClick(event: React.ChangeEvent<HTMLInputElement>): void {
    //     if (event.target.checked) {
    //         const newSelected = rows.map((n) => n.email)
    //         setSelected(newSelected)
    //         return
    //     }
    //     setSelected([])
    // }

    function handleSelectUser(row: UsersTableRow): void {
        const selectedIndex = selected.map(user => user.email).indexOf(row.email)
        let newSelected: readonly UsersTableRow[] = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, row)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            )
        }

        setSelected(newSelected)
    }

    function handleChangePage(event: unknown, newPage: number): void {
        setPage(newPage)
    }

    function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const isSelected = (row: UsersTableRow) =>
        selected.findIndex(user => user.email === row.email) !== -1

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

    const visibleRows = useMemo(
        () => rows.slice()
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage]
    )

    return (
        <Box sx={{width: '100%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    onDelete={() => onDeleteUsers(selected)}
                    onEdit={() => onEdit(selected[0])}
                />
                <TableContainer>
                    <Table
                        sx={{minWidth: 750}}
                        aria-labelledby="tableTitle"
                        size='small'
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={() => {}}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row)
                                const labelId = `enhanced-table-checkbox-${index}`

                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.email}
                                        selected={isItemSelected}
                                        sx={{cursor: 'pointer'}}
                                    >
                                        <TableCell
                                            padding="checkbox"
                                            onClick={() => handleSelectUser(row)}
                                        >
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
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            {row.email}
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            {row.username}
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            {row.role}
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            <Tooltip title={`User created on ${formatDatetime(row.createdOn)}`}>
                                                <span>{formatDatetime(row.createdOn, 'yyyy-MM-dd')}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell
                                            align='center'
                                            onClick={() => {if (row.emailVerified) handleSelectUser(row)}}
                                        >
                                            <Tooltip title={`Email verified on ${formatDatetime(row.emailVerifiedOn)}`}>
                                                <span>
                                                    {row.emailVerified ?
                                                        <TaskAlt sx={{color: "#308330"}}/> :
                                                        <Button
                                                            key={row.email}
                                                            variant="outlined"
                                                            startIcon={<Mail/>}
                                                            size='small'
                                                            sx={{textTransform: 'none'}}
                                                            onClick={event => {
                                                                event.preventDefault()
                                                                onResendEmail(row)
                                                            }}
                                                        >
                                                            Resend
                                                        </Button>
                                                    }
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            <Tooltip title={`Last modified on ${formatDatetime(row.modifiedOn)}`}>
                                                <span>{formatDatetime(row.modifiedOn, 'yyyy-MM-dd')}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell
                                            onClick={() => handleSelectUser(row)}
                                        >
                                            {row.deletedOn === null ?
                                                <span></span> :
                                                <Tooltip title={`User deleted on ${formatDatetime(row.deletedOn)}`}>
                                                    <PersonOff sx={{color: "#b70a0a"}}/>
                                                </Tooltip>
                                            }
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 33 * emptyRows,
                                        // height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack direction='row'>
                    <Button
                        startIcon={<PersonAdd/>}
                        sx={{textTransform: 'none', minWidth: 150}}
                        onClick={onAddUser}
                        disabled={isAddingUser}
                    >
                        Add User
                    </Button>
                    <TablePagination
                    sx={{flex: '1 2 100%'}}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </Stack>
            </Paper>
        </Box>
    )
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

type Order = 'asc' | 'desc'

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string | DateTime | boolean | null },
    b: { [key in Key]: number | string | DateTime | boolean | null },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy)
}