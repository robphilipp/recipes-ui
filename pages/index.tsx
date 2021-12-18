import Head from 'next/head'
import Layout from '../components/Layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Date from '../components/Date'
import React, {useEffect, useState} from "react";
import {Button, Chip, IconButton} from "@mui/material";
import {useSearch} from "../lib/useSearch";
import axios from 'axios'
import {useStatus} from "../lib/useStatus";
import {MenuBook} from "@mui/icons-material";
import {RecipeSummary} from "../components/Recipe";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";

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
    const [confirmDelete, setConfirmDelete] = useState(false)

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

    function handleDeleteRecipe(recipeId: string): void {
        axios
            .delete(`/api/recipes/${recipeId}`)
            .then(response => setRecipes(current => current.filter(recipe => recipe._id !== response.data._id)))
    }

    function renderDelete(recipeId: string): JSX.Element {
        if (confirmDelete) {
            return (
                <>
                <Button
                    startIcon={<DeleteIcon/>}
                    sx={{textTransform: 'none'}}
                    onClick={() => handleDeleteRecipe(recipeId)}
                >
                    Confirm
                </Button>
                <Button
                    startIcon={<CancelIcon/>}
                    sx={{textTransform: 'none'}}
                    onClick={() => setConfirmDelete(false)}
                >
                    Cancel
                </Button>
                </>
            )
        }
        return (
            <IconButton
                onClick={() => setConfirmDelete(true)}
                color='primary'
                size='small'
            >
                <DeleteIcon sx={{width: 18, height: 18}}/>
            </IconButton>
        )
    }

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
                            {inProgress(recipe._id.toString()) ? <MenuBook fontSize='small' style={{marginLeft: 7, paddingTop: 5}}/> : <span/>}
                            {recipe.tags.map(tag => (
                                <span style={{paddingLeft: 7}} key={`${recipe.name}-tag-${tag}`}>
                                    <Chip label={tag} variant='outlined' size='small'/>
                                </span>
                            ))}
                            {renderDelete(recipe._id.toString())}
                            <div className={utilStyles.recipeListItemDate} key={`${recipe.name}-date`}>
                                <Date epochMillis={(recipe.modifiedOn !== null ? recipe.modifiedOn : recipe.createdOn) as number}/>
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

