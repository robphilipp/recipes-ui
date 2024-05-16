import React, {JSX} from "react";
import {useNotifications} from "../../lib/useNotifications";
import pluralize from "pluralize";
import {IconButton, Tooltip} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";

export default function Notifications(): JSX.Element {
    const {notifications, numErrors, numWarnings, numInfo} = useNotifications()

    const errors = numErrors()
    const warnings = numWarnings()
    const infos = numInfo()

    function iconColor(): string {
        if (errors > 0) return "#b10101"
        if (warnings > 0) return "#ff0"
        if (infos > 0) return "#fff"
        return "#3a3a38"
    }

    if (notifications.length > 0) {
        const messages: Array<string> = []
        if (errors > 0) messages.push(`${errors} ${pluralize("error", errors)}`)
        if (warnings > 0) messages.push(`${warnings} ${pluralize("warnings", warnings)}`)
        if (infos > 0) messages.push(`${infos} ${pluralize("info", infos)}`)

        return (
            <Tooltip title={messages.join(";")}>
                <IconButton aria-label="Notifications" sx={{color: iconColor()}}>
                    <ErrorOutline/>
                </IconButton>
            </Tooltip>
        )
    }
    return <div/>
}
