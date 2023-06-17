import Head from 'next/head'
import Link from 'next/link'

import styles from './layout.module.css'
import React, {JSX} from "react";

const name = process.env.bookTitle
export const siteTitle = process.env.siteName

type Props = {
    children: React.ReactNode
    home?: boolean
}

export default function Layout(props: Props): JSX.Element {
    const {children, home} = props

    return (
        <div>
            {children}
            {!home && (
                <div>
                    <Link href="/">← Back to home</Link>
                </div>
            )}
        </div>
    )
}
