import SetPassword from "../../../emails/SetPassword";
import {useRouter} from "next/router";
import {useQuery} from "@tanstack/react-query";
import axios, {AxiosResponse} from "axios";
import {emptyUser, RecipesUser} from "../../../components/users/RecipesUser";
import {Typography} from "@mui/material";
import React, {useState} from "react";
import {UrlEnrichedPasswordResetToken} from "../../../components/passwords/PasswordResetToken";
import {useSession} from "next-auth/react";
import Button from '@mui/material/Button'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

/**
 * Page from which to send email (Sendgrid wouldn't give me a free account as promised
 * on their website, and this is easier than setting up a mail server. So, for now its
 * this...we can't always be proud of our solutions....ugh)
 * @constructor
 */
export default function EmailViewer(): JSX.Element {
    const router = useRouter()
    const {data: session} = useSession()

    const userId = router.query.id as string
    const userByIdQuery = useQuery<AxiosResponse<RecipesUser>>(
        ['users-by-id'],
        () => axios.get<RecipesUser>(`/api/users?user_id=${userId}`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject(emptyUser())
            })
    )

    const tokenByIdQuery = useQuery<AxiosResponse<Array<UrlEnrichedPasswordResetToken>>>(
        ['user-by-token-id'],
        () => axios
            .get<Array<UrlEnrichedPasswordResetToken>>(`/api/passwords/tokens/${userId}`)
            .catch(async reason => {
                console.error(reason)
                await router.push("/api/auth/signin")
                return Promise.reject("")
            })
    )

    const [copied, setCopied] = useState<boolean>(false)
    const [emailBody, setEmailBody] = useState<string>()

    function handleCopyEmailToClipboard(): void {
        const emailDom = document.querySelector('#recipes-reset-password-email-html')
        if (emailDom !== null) {
            const serializer = new XMLSerializer()
            const serializeDom = serializer.serializeToString(emailDom)
            const type = "text/html";
            const blob = new Blob([serializeDom], {type});
            const data = [new ClipboardItem({[type]: blob})];
            navigator.clipboard.write(data)
                .then(result => {
                    setCopied(true)
                    setEmailBody(serializeDom)
                })
                .catch(reason => {
                    console.error(reason)
                    setCopied(false)
                    setEmailBody(undefined)
                })
        } else {
            setCopied(false)
            setEmailBody(undefined)
        }
    }

    if (userByIdQuery.isLoading || tokenByIdQuery.isLoading) {
        return <Typography>Looking for the user that Booboo bit...</Typography>
    }
    if (userByIdQuery.isError || tokenByIdQuery.isError) {
        return <Typography>Looking for a band-aide...</Typography>
    }

    const user = userByIdQuery.data?.data
    if (user === undefined || user === null) {
        return <Typography>Could not find user...</Typography>
    }

    const resetPasswordTokens = tokenByIdQuery.data.data
    if (resetPasswordTokens.length === 0) {
        return <Typography>Could not find reset token...</Typography>
    }

    // grab the most recent token and construct the URL for the reset page
    const latestToken = resetPasswordTokens
        .sort((t1, t2) => t2.expiration - t1.expiration)[0]
    const resetPasswordLink = new URL(`${latestToken.url}/passwords/token/${latestToken.resetToken}`)

    return (
        <div style={{paddingTop: 75, paddingLeft: 10}}>
            <SetPassword resetPasswordLink={resetPasswordLink} username={session?.user.email ?? 'Your admin'}/>
            {copied ?
                <div style={{
                    display: 'grid',
                    height: '100%',
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    placeItems: 'center',
                }}>
                    Email copied to clipboard.
                    <a autoFocus={true} href={`mailto:${user.email}?subject=Invitation to City Recipes`}>
                        Open email app, paste email, and send (ugh).
                    </a>
                </div> :
                <div
                    style={{
                        display: 'grid',
                        height: '100%',
                        width: '100%',
                        margin: 0,
                        padding: 0,
                        placeItems: 'center',
                    }}
                >
                    <Button
                        autoFocus
                        startIcon={<ContentCopyIcon/>}
                        sx={{textTransform: 'none'}}
                        onClick={handleCopyEmailToClipboard}
                    >
                        Copy email
                    </Button>
                </div>
            }
        </div>
    )
}

