import React from "react";
import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {useStatus} from "../lib/useStatus";
import {Recipe, Step} from "./Recipe";

type Props = {
    recipeId: string
    recipe: Recipe
}

/**
 * Renders the list of steps, organizing them by sections, if specified, and returns the
 * list as a component
 * @constructor
 */
export function StepsView(props: Props): JSX.Element {
    const {recipeId, recipe} = props

    const {isStepSelected, selectStep, unselectStep} = useStatus()

    function handleToggleStepStatus(step: string) {
        if (isStepSelected(recipeId, step)) {
            unselectStep(recipeId, step)
        } else {
            selectStep(recipeId, step)
        }
    }

    // organize steps by section. any step without a section takes on the current
    // section, any step with a section gets added to that section
    type Accumulator = { currentSection: string, accumulated: Map<string, Array<Step>> }
    const initial: Accumulator = {currentSection: "", accumulated: new Map<string, Array<Step>>()}
    const organizedSteps = recipe.steps.reduce(
        (accum, step) => {
            // when the step has an explicit section, then add the step to the steps
            // in that section and update the current section to the new section,
            // otherwise add it to the current section
            if (step.title !== null && step.title !== '') {
                accum.currentSection = step.title;
                const accumSteps = accum.accumulated.get(step.title) || []
                accumSteps.push(step)
                accum.accumulated.set(step.title, accumSteps)
            } else {
                const accumSteps = accum.accumulated.get(accum.currentSection) || []
                accumSteps.push(step)
                accum.accumulated.set(accum.currentSection, accumSteps)
            }
            return accum
        },
        initial
    )

    return (
        <List sx={{width: '100%', maxWidth: 650, marginTop: -1}}>
            {Array.from(organizedSteps.accumulated).map(([section, steps]) => {
                return <>
                    {section !== null && section !== '' ?
                        <ListItemText
                            key={`step-list-section-${section}`}
                            sx={{marginBottom: -1, fontWeight: 550, marginLeft: 2}}
                        >
                            <Typography sx={{fontSize: `1.1em`, marginTop: 2, marginBottom: 1}}>
                                {section}
                            </Typography>
                        </ListItemText> :
                        <span/>
                    }
                    {steps.map(step => {
                        const labelId = `${recipe.name}-step-list-item-${step.text}`
                        return (
                            <ListItem key={labelId} disablePadding>
                                <ListItemButton
                                    role={undefined}
                                    onClick={() => handleToggleStepStatus(step.text)}
                                    dense
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={isStepSelected(recipeId, step.text)}
                                            tabIndex={-1}
                                            disableRipple
                                            size="small"
                                            inputProps={{'aria-labelledby': labelId}}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={labelId}>
                                        {step.text}
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </>
            })}
        </List>
    )
}