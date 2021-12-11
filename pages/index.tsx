import Head from 'next/head'
import Layout from '../components/Layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Date from '../components/Date'
import {RecipeSummary} from "../lib/recipes";
import React, {useEffect, useState} from "react";
import {Chip} from "@mui/material";
import {useSearch} from "../lib/useSearch";
import axios from 'axios'
import {useStatus} from "../lib/useStatus";
import {MenuBook} from "@mui/icons-material";

type Props = {
    // allPostsData: Array<PostData>
    // recipes: Array<RecipeSummary>
    // search: string | null
    // recipes: Array<Recipe>
}

export default function Home(props: Props): JSX.Element {
    const {
        // recipes,
        // search
    } = props

    const {accumulated, deleteAccumulated} = useSearch()
    const {inProgress} = useStatus()

    const [recipes, setRecipes] = useState<Array<RecipeSummary>>([])

    useEffect(
        () => {
            if (accumulated.length > 0) {
                const queries = accumulated.map(acc => `name=${acc}`).join("&")
                axios
                    .get(`/api/recipes/summaries?${queries}`)
                    .then(response => setRecipes(response.data))
            } else {
                setRecipes([])
            }
        },
        [accumulated]
    )

    return (
        <Layout home>
            <Head>
                <title>{process.env.siteName}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.recipePadding}`}>
                <div style={{marginBottom: 15}}>
                {accumulated.map(search => (
                    <Chip key={search} label={search} size='small' style={{marginRight: 7}} onDelete={() => deleteAccumulated(search)}/>
                ))}
                </div>
                <ul className={utilStyles.list}>
                    {recipes.map(recipe => (
                        <li className={utilStyles.recipeListItem} key={`${recipe.name}-li`}>
                            <Link href={`/recipes/${recipe._id}`}><a>{recipe.name}</a></Link>
                            {inProgress(recipe._id) ? <MenuBook fontSize='small' style={{marginLeft: 7, paddingTop: 5}}/> : <span/>}
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

// export const getStaticProps: GetStaticProps = async () => {
//     // const {name} = context.query
//     const recipes = await recipeSummaries()
//     return {
//         props: {
//             recipes,
//             // search: name || null
//         }
//     }
// }

