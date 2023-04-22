import Head from 'next/head'
import Link from 'next/link'

import styles from './layout.module.css'
import React from "react";

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
    // return (
    //     <div className={styles.container}>
    //         <Head>
    //             <title>{siteTitle}</title>
    //             <link rel="icon" href="/favicon.ico"/>
    //             <meta
    //                 name="description"
    //                 content="Recipe book"
    //             />
    //             <meta name="og:title" content={siteTitle} />
    //             <meta name="twitter:card" content="summary_large_image" />
    //         </Head>
    //         <main>{children}</main>
    //         {!home && (
    //             <div className={styles.backToHome}>
    //                 <Link href="/">
    //                     <a>← Back to home</a>
    //                 </Link>
    //             </div>
    //         )}
    //     </div>
    // )
}
