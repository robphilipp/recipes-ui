import {parseISO, format, fromUnixTime} from 'date-fns'

type Props = {
    dateString?: string
    epochMillis?: number
}

export default function Date(props: Props): JSX.Element {
    const {dateString, epochMillis} = props
    const date = dateString ? parseISO(dateString) : fromUnixTime(epochMillis / 1000 || 0)

    return (
        <time dateTime={dateString}>
            {format(date, 'LLLL d, yyyy')}
        </time>
    )
}