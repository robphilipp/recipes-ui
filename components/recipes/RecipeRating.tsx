import {IconButton, Rating, styled} from "@mui/material";
import React, {JSX, useState} from "react";
import {Dining, DiningOutlined, ThumbsUpDown} from "@mui/icons-material";
import {Rating as RatingValue} from './Recipe'

const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
        color: 'rgb(59,59,56)'
    },
    '& .MuiRating-iconHover': {
        color: '#f36215'
    }
})

function noop(): void {
}

enum Mode { VIEW, UPDATE }

type Props = {
    rating: RatingValue
    precision?: number
    handleRatingChange?: (rating: number) => void
}

export default function RecipeRating(props: Props): JSX.Element {
    const {rating, handleRatingChange = noop, precision = 1} = props

    const [mode, setMode] = useState(Mode.VIEW)

    function handleUpdate(value: number | null): void {
        if (value !== null) handleRatingChange(value)
    }

    function RatingView(): JSX.Element {
        switch (mode) {
            case Mode.VIEW:
                return (
                    <StyledRating
                        name="recipe-rating"
                        defaultValue={0}
                        precision={precision}
                        value={rating.mean}
                        icon={<Dining fontSize="inherit"/>}
                        emptyIcon={<DiningOutlined fontSize="inherit"/>}
                        readOnly
                    />
                )
            case Mode.UPDATE:
                return (
                    <StyledRating
                        name="recipe-rating"
                        defaultValue={0}
                        precision={1}
                        value={0}
                        icon={<Dining fontSize="inherit"/>}
                        emptyIcon={<DiningOutlined fontSize="inherit"/>}
                        onChange={(event, newValue) => handleUpdate(newValue)}
                        readOnly={handleRatingChange === noop}
                    />
                )
        }
    }

    return (
        <>
            <RatingView/>
            {handleRatingChange !== noop && mode === Mode.VIEW &&
                <IconButton
                    color='primary'
                    size='small'
                    sx={{marginLeft: '1em'}}
                    onClick={() => setMode(Mode.UPDATE)}
                >
                    <ThumbsUpDown sx={{width: 18, height: 18}}/>
                </IconButton>
            }
        </>
    )
}
