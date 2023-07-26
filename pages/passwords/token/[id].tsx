type Props = {
    token: string
}

export default function PasswordByToken(props: Props): JSX.Element {
    return <>{props.token}</>
}