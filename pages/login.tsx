import {Button, FormControl, FormGroup, Stack, styled, TextField} from "@mui/material";
import React from "react";
import Centered from "../components/Centered";
import SaveIcon from "@mui/icons-material/Save";
import {getCsrfToken} from "next-auth/react";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";

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
export default function Login({csrfToken}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Centered>
            <form method="post" action="/api/auth/callback/recipes-provider-mongo-credentials">
                <input name="csrfToken" type="hidden" defaultValue={csrfToken}/>
                <FormGroup style={{maxWidth, width: maxWidth}}>
                    <UserFormControl>
                        <TextField
                            label="Email"
                            name="email"
                            maxRows={80}
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
                            startIcon={<SaveIcon/>}
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
    return {
        props: {
            csrfToken: await getCsrfToken(context),
        },
    }
}

// import {Button, FormControl, FormGroup, Stack, styled, TextField} from "@mui/material";
// import React, {useState} from "react";
// import Centered from "../components/Centered";
// import SaveIcon from "@mui/icons-material/Save";
// import {getCsrfToken, signIn} from "next-auth/react";
// import {Provider} from "next-auth/providers";
// import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
//
// const UserFormControl = styled(FormControl)(() => ({
//     marginTop: 10,
// }))
//
// type Props = {
//     // maxWidth?: number
//     providers: Array<Provider>
// }
//
// const maxWidth = 400
//
// /**
//  * Form for adding a new user
//  * @param props The component properties
//  * @return A {@link JSX.Element}
//  * @constructor
//  */
// export default function LoginIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
//     // const {providers} = props
//
//     const [email, setEmail] = useState<string>('')
//     const [password, setPassword] = useState<string>('')
//
//     return (<Centered>
//         <FormGroup style={{maxWidth, width: maxWidth}}>
//             <UserFormControl>
//                 <TextField
//                     label="Email"
//                     maxRows={80}
//                     value={email}
//                     onChange={event => setEmail(event.target.value)}
//                 />
//             </UserFormControl>
//
//             <UserFormControl>
//                 <TextField
//                     label="Password"
//                     type="password"
//                     minRows={80}
//                     maxRows={80}
//                     value={password}
//                     onChange={event => setPassword(event.target.value)}
//                 />
//             </UserFormControl>
//
//             <Stack direction='row' style={{justifyContent: 'right', paddingTop: 20}}>
//                 <Button
//                     startIcon={<SaveIcon/>}
//                     size='small'
//                     sx={{textTransform: 'none'}}
//                     onClick={() => signIn("recipes-provider-mongo-credentials", {csrfToken}, {email, password})}
//                 >
//                     Login
//                 </Button>
//             </Stack>
//         </FormGroup>
//     </Centered>)
// }
//
// export async function getServerSideProps(context: GetServerSidePropsContext) {
//     return {
//         props: {
//             csrfToken: await getCsrfToken(context),
//         },
//     }
// }
