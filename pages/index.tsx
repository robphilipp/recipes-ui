import Head from 'next/head'
import Layout from '../components/Layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import Date from '../components/Date'
import React, {useEffect, useState} from "react";
import {Button, Chip, IconButton, List, ListItem, Typography} from "@mui/material";
import {useSearch} from "../lib/useSearch";
import axios from 'axios'
import {useStatus} from "../lib/useStatus";
import {MenuBook} from "@mui/icons-material";
import {RecipeSummary} from "../components/Recipe";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import {useRouter} from "next/router";

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

    const router = useRouter()

    const {accumulated, deleteAccumulated} = useSearch()
    const {inProgress} = useStatus()

    const [recipeCount, setRecipeCount] = useState<number>(0)
    const [recipes, setRecipes] = useState<Array<RecipeSummary>>([])
    const [confirmDelete, setConfirmDelete] = useState<Array<string>>([])

    useEffect(
        () => {
            axios.get('/api/recipes/count').then(response => setRecipeCount(response.data))
        },
        []
    )

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
            .then(response => {
                setRecipes(current => current.filter(recipe => recipe._id !== response.data._id))
                setConfirmDelete([])
            })
    }

    function renderDelete(recipeId: string): JSX.Element {
        if (confirmDelete.findIndex(id => id === recipeId) >= 0) {
            return (
                <>
                    <Button
                        key={`${recipeId}-confirm`}
                        startIcon={<DeleteIcon/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => handleDeleteRecipe(recipeId)}
                    >
                        Confirm
                    </Button>
                    <Button
                        key={`${recipeId}-cancel`}
                        startIcon={<CancelIcon/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => setConfirmDelete(current => current.filter(id => id !== recipeId))}
                    >
                        Cancel
                    </Button>
                </>
            )
        }
        return (
            <IconButton
                key={`${recipeId}-delete`}
                onClick={() => setConfirmDelete(current => [...current, recipeId])}
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
                <div>
                    {accumulated.map(search => (
                        <Chip key={search} label={search} size='small' style={{marginRight: 7}}
                              onDelete={() => deleteAccumulated(search)}/>
                    ))}
                </div>
                <Typography paragraph sx={{fontSize: '0.7em', marginTop: '0.25em'}}>
                    Showing {recipes.length} of {recipeCount} recipes
                </Typography>
                <List>
                    {recipes.map(recipe => (
                        <ListItem
                            key={`${recipe.name}-li`}
                            secondaryAction={renderDelete(recipe._id.toString())}
                        >
                            <div>
                            {inProgress(recipe._id.toString()) ?
                                <MenuBook fontSize='small' style={{marginLeft: 7, paddingTop: 5}}/> : <span/>}
                            <Button onClick={() => router.push(`/recipes/${recipe._id}`)}>
                                {recipe.name}
                            </Button>
                            {recipe.tags.map(tag => (
                                <span style={{paddingLeft: 7}} key={`${recipe.name}-tag-${tag}`}>
                                    <Chip label={tag} variant='outlined' size='small'/>
                                </span>
                            ))}
                            <div>
                            <Typography paragraph sx={{fontSize: '0.7em', marginLeft: '1em', marginTop: '-0.2em'}}>
                                <Date epochMillis={
                                    (recipe.modifiedOn !== null ? recipe.modifiedOn : recipe.createdOn) as number
                                }/>
                            </Typography>
                            </div>
                            </div>
                        </ListItem>
                    ))}
                </List>
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

