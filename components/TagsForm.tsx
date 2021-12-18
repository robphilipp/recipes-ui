import React, {useState} from 'react'
import {Chip, IconButton, TextField} from "@mui/material";
import {DisplayMode} from "./FormMode";
import AddCircleIcon from "@mui/icons-material/AddCircle";

function noop() {
}

type Props = {
    tags: Array<string>
    displayMode?: DisplayMode
    onAdd?: (tag: string) => void
    onRemove?: (tag: string) => void
}

export function TagsForm(props: Props): JSX.Element {
    const {
        tags,
        displayMode = DisplayMode.VIEW,
        onAdd = noop,
        onRemove = noop
    } = props

    const [newTag, setNewTag] = useState<string>('')

    function handleSubmit(): void {
        onAdd(newTag)
        setNewTag('')
    }

    function canAdd(tag: string): boolean {
        return tag !== '' && tags.findIndex(t => t === tag) < 0
    }

    function handleRemove(tag: string): void {
        onRemove(tag)
    }

    if (displayMode === DisplayMode.VIEW) {
        return <>
            {tags.map(tag => (
                <Chip
                    key={tag}
                    label={tag}
                    variant='outlined'
                    size='small'
                    sx={{marginRight: 1}}
                />
            ))}
        </>
    }

    return (
        <>
            <TextField
                id="recipe-tags-input"
                label="Add tag"
                size='small'
                value={newTag}
                onChange={event => setNewTag(event.target.value)}
            />
            <IconButton onClick={handleSubmit} color='primary' disabled={!canAdd(newTag)}>
                <AddCircleIcon/>
            </IconButton>
            {tags.map(tag => (
                <Chip
                    key={tag}
                    label={tag}
                    variant='outlined'
                    size='small'
                    sx={{marginRight: 1}}
                    onDelete={() => handleRemove(tag)}
                />
            ))}
        </>
    )
}