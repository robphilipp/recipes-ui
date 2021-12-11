import {alpha, InputBase, styled} from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import {useSearch} from "../lib/useSearch";

const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

export default function RecipeSearch(): JSX.Element {
    const {
        current, updateCurrent, clearCurrent,
        accumulated, addAccumulated
    } = useSearch()

    // const [search, setSearch] = useState<string>()
    // const [searchTokens, setSearchTokens] = useState<Array<string>>([])

    async function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        switch (event.key) {
            case 'Enter':
                // setSearchTokens(tokens => [...tokens, search])
                // setSearch('')
                addAccumulated(current)
                clearCurrent()
                console.log("recipe search; current", current, "accumulated", accumulated)
                break
            case 'Escape':
                // setSearch('')
                clearCurrent()
                break
            default:
        }
    }

    async function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const searchValue = event.currentTarget.value
        // setSearch(searchValue)
        console.log("recipe search", searchValue)
        updateCurrent(searchValue)
    }

    console.log("recipe summaries (render); current", current, "accumulated", accumulated)
    return (
        <Search>
            <SearchIconWrapper><SearchIcon/></SearchIconWrapper>
            <StyledInputBase
                placeholder="Search…"
                value={current || ''}
                // value={search}
                inputProps={{'aria-label': 'search'}}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
            />
        </Search>
    )
}