import Head from 'next/head'
import Layout, { siteTitle } from '../components/Layout'
import utilStyles from '../styles/utils.module.css'
import {getSortedPostsData, PostData} from '../lib/posts'
import Link from 'next/link'
import Date from '../components/Date'
import {GetServerSideProps, GetStaticProps} from 'next'
import {allRecipes, Recipe, recipeSummaries, RecipeSummary} from "../lib/recipes";
import {Button, InputAdornment, TextField} from "@mui/material";
import React from "react";

type Props = {
    // allPostsData: Array<PostData>
    recipes: Array<RecipeSummary>
    // recipes: Array<Recipe>
}

export default function Home(props: Props): JSX.Element {
    const {
        // allPostsData,
        recipes
    } = props

    return (
        <Layout home>
            <Head>
                <title>{process.env.siteName}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
                <ul className={utilStyles.list}>
                    {recipes.map(recipe => (
                        <li className={utilStyles.listItem} key={recipe.name}>
                            <Link href={`/recipes/${recipe.name}`}><a>{recipe.name}</a></Link>
                            <br/>
                            <small className={utilStyles.lightText}>
                                <Date epochMillis={recipe.createdOn}/>
                            </small>
                        </li>
                    ))}
                </ul>
            </section>
            {/*<section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>*/}
            {/*    <h2 className={utilStyles.headingLg}>Blog</h2>*/}
            {/*    <ul className={utilStyles.list}>*/}
            {/*        {allPostsData.map(({ id, date, title }) => (*/}
            {/*            <li className={utilStyles.listItem} key={id}>*/}
            {/*                <Link href={`/posts/${id}`}>*/}
            {/*                    <a>{title}</a>*/}
            {/*                </Link>*/}
            {/*                <br />*/}
            {/*                <small className={utilStyles.lightText}>*/}
            {/*                    <Date dateString={date} />*/}
            {/*                </small>*/}
            {/*            </li>*/}
            {/*        ))}*/}
            {/*    </ul>*/}
            {/*</section>*/}
        </Layout>
    )
}

// export const getStaticProps: GetStaticProps = async () => {
//     const allPostsData = getSortedPostsData()
//     const recipes = await allRecipes()
//     return {
//         props: {
//             allPostsData,
//             recipes
//         }
//     }
// }

export const getServerSideProps: GetServerSideProps = async context => {
    const recipes = await recipeSummaries()
    return {
        props: {
            recipes
        }
    }
}