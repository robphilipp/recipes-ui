import Head from 'next/head'
import Layout from '../components/Layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Date from '../components/Date'
import {GetServerSideProps, GetServerSidePropsContext, GetStaticPaths, GetStaticProps} from 'next'
import {allRecipePaths, allRecipes, recipeSummaries, recipeSummariesByName, RecipeSummary} from "../lib/recipes";
import React from "react";
import {ParsedUrlQuery} from "querystring";
import {Chip} from "@mui/material";

type Props = {
    // allPostsData: Array<PostData>
    recipes: Array<RecipeSummary>
    // search: string | null
    // recipes: Array<Recipe>
}

export default function Home(props: Props): JSX.Element {
    const {
        recipes,
        // search
    } = props


    return (
        <Layout home>
            <Head>
                <title>{process.env.siteName}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.recipePadding}`}>
                {/*<div>{search}</div>*/}
                {/*<Chip label={search} variant='outlined' size='small'/>*/}
                <ul className={utilStyles.list}>
                    {recipes.map(recipe => (
                        <li className={utilStyles.recipeListItem} key={`${recipe.name}-li`}>
                            <Link href={`/recipes/${recipe._id}`}><a>{recipe.name}</a></Link>
                            {recipe.tags.map(tag => (
                                <span style={{paddingLeft: 7}} key={`${recipe.name}-tag-${tag}`}>
                                    <Chip label={tag} variant='outlined' size='small'/>
                                </span>
                            ))}
                            <div className={utilStyles.recipeListItemDate} key={`${recipe.name}-date`}>
                                <Date epochMillis={recipe.modifiedOn !== null ? recipe.modifiedOn : recipe.createdOn}/>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </Layout>
    )
}

// export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext<ParsedUrlQuery, string | false | object>) => {
//     const {name} = context.query
//     const recipes = await recipeSummariesByName([name as string])
//     return {
//         props: {
//             recipes,
//             search: name || null
//         }
//     }
// }

export const getStaticProps: GetStaticProps = async () => {
    // const {name} = context.query
    const recipes = await recipeSummaries()
    return {
        props: {
            recipes,
            // search: name || null
        }
    }
}

