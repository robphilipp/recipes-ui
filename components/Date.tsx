import {parseISO, format} from 'date-fns'

type Props = {
    dateString: string
}

export default function Date(props: Props): JSX.Element {
    const {dateString} = props
    const date = parseISO(dateString)
    return (
        <time dateTime={dateString}>
            {format(date, 'LLLL d, yyyy')}
        </time>
    )
}