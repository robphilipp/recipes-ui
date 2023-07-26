import {useRouter} from "next/router";

type Props = {
    token: string
}

export default function PasswordByToken(props: Props): JSX.Element {
    const {token} = props
    const router = useRouter()
    return <div>This is my token: {token ?? router.query.id}</div>
}