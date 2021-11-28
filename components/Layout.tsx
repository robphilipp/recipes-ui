import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import React from "react";
import {Input} from "@mui/material";

// const name = 'Shitty Year'
const name = process.env.bookTitle
export const siteTitle = process.env.siteName

type Props = {
    children: React.ReactNode
    home?: boolean
}

export default function Layout(props: Props): JSX.Element {
    const {children, home} = props

    return (
        <div className={styles.container}>
            <Head>
                <title>{siteTitle}</title>
                <link rel="icon" href="/favicon.ico"/>
                <meta
                    name="description"
                    content="Recipe book"
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <header className={styles.header}>
                {home ? (
                    <>
                        {/*<Input>Test</Input>*/}
                        {/*<h1 className={utilStyles.heading2Xl}>Shitty Year</h1>*/}
                        {/*<Image*/}
                        {/*    priority*/}
                        {/*    src="/images/2020.jpg"*/}
                        {/*    className={utilStyles.borderCircle}*/}
                        {/*    height={144}*/}
                        {/*    width={144}*/}
                        {/*    alt={name}*/}
                        {/*/>*/}
                        {/*<h1 className={utilStyles.heading2Xl}>{name}</h1>*/}
                    </>
                ) : (
                    <>
                        <Link href="/">
                            <a>
                                <Image
                                    priority
                                    src="/images/2020.jpg"
                                    className={utilStyles.borderCircle}
                                    height={108}
                                    width={108}
                                    alt={name}
                                />
                            </a>
                        </Link>
                        <h2 className={utilStyles.headingLg}>
                            <Link href="/">
                                <a className={utilStyles.colorInherit}>{name}</a>
                            </Link>
                        </h2>
                    </>
                )}
            </header>
            <main>{children}</main>
            {!home && (
                <div className={styles.backToHome}>
                    <Link href="/">
                        <a>← Back to home</a>
                    </Link>
                </div>
            )}
        </div>
    )
}