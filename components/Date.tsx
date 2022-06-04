
import {DateTime} from "luxon"

type Props = {
    dateString?: string
    epochMillis?: number
}

export default function Date(props: Props): JSX.Element {
    const {dateString, epochMillis} = props
    const date = dateString ?
        DateTime.fromISO(dateString, {zone: 'utc'}) :
        DateTime.fromMillis(epochMillis || 0, {zone: 'utc'})

    return (
        <time dateTime={dateString}>
            {date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
        </time>
    )
}