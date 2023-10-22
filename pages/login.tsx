import {Alert, Button, FormControl, FormGroup, Stack, styled, TextField} from "@mui/material";
import React from "react";
import Centered from "../components/Centered";
import {getCsrfToken} from "next-auth/react";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {LockOpen} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "./api/auth/[...nextauth]";

const UserFormControl = styled(FormControl)(() => ({
    marginTop: 10,
}))

const maxWidth = 400

/**
 * Form for adding a new user
 * @param props The component properties
 * @return A {@link JSX.Element}
 * @constructor
 */
export default function Login({csrfToken, error}: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return (
        <Centered>
            <form method="post" action="/api/auth/callback/recipes-provider-mongo-credentials">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken}/>
                <FormGroup style={{maxWidth, width: maxWidth}}>
                    {error ? <Alert severity="error">Unable to authorize. Stop it! Please try again.</Alert>: <></>}
                    <UserFormControl>
                        <TextField
                            label="Email"
                            name="email"
                            maxRows={80}
                            // set focus on the input text field
                            inputRef={input => input && input.focus()}
                        />
                    </UserFormControl>

                    <UserFormControl>
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            minRows={80}
                            maxRows={80}
                        />
                    </UserFormControl>

                    <Stack direction='row' style={{justifyContent: 'right', paddingTop: 20}}>
                        <Button
                            startIcon={<LockOpen/>}
                            size='small'
                            sx={{textTransform: 'none'}}
                            type="submit"
                        >
                            Login
                        </Button>
                    </Stack>
                </FormGroup>
            </form>
        </Centered>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // if the user is already logged in, redirect.
    if (session) {
        return { redirect: false };
        // return { redirect: { destination: "/" } };
    }

    const {error} = context.query
    return {
        props: {
            csrfToken: await getCsrfToken(context),
            error: error ?? null
        },
    }
}
