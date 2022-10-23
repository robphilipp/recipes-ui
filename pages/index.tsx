import Head from 'next/head'
import Layout from '../components/Layout'
import Date from '../components/Date'
import React, {useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    Rating,
    Typography,
    useTheme
} from "@mui/material";
import {useSearch} from "../lib/useSearch";
import axios from 'axios'
import {useStatus} from "../lib/useStatus";
import {MenuBook} from "@mui/icons-material";
import {ratingsFrom, RecipeSummary} from "../components/Recipe";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import {useRouter} from "next/router";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Link from 'next/link'
import {useQuery} from "@tanstack/react-query";

// import {ParseType, toIngredients, toRecipe} from "@saucie/recipe-parser"
//
// const {result: ingredients, errors} = toIngredients(`dough
//             1 1/2 cp all-purpose flour
//             1 tsp vanilla extract,
//             sauce
//             1 cup milk
//             1 egg`,
//     {deDupSections: true}
// )
//
// console.log("recipe", ingredients)

type Props = {}

/**
 * The main page
 * @param props
 * @constructor
 */
export default function Home(props: Props): JSX.Element {
    const {} = props

    const router = useRouter()
    const theme = useTheme()

    const {accumulated, deleteAccumulated} = useSearch()
    const {inProgress} = useStatus()

    // const [recipeCount, setRecipeCount] = useState<number>(0)
    // const [recipes, setRecipes] = useState<Array<RecipeSummary>>([])
    const [confirmDelete, setConfirmDelete] = useState<Array<string>>([])

    // useEffect(
    //     () => {
    //         axios.get('/api/recipes/count').then(response => setRecipeCount(response.data))
    //     },
    //     []
    // )

    // loads the summaries that match one or more of the accumulated search terms
    // useEffect(
    //     () => {
    //         if (accumulated.length > 0) {
    //             const queries = accumulated.map(acc => `name=${acc}`).join("&")
    //             axios
    //                 .get(`/api/recipes/summaries?${queries}`)
    //                 .then(response => setRecipes(response.data))
    //         } else {
    //             setRecipes([])
    //         }
    //     },
    //     [accumulated]
    // )
    const countQuery = useQuery(['recipeCount'], () => axios.get('/api/recipes/count'))
    const recipesQuery = useQuery(['recipes', accumulated], () => {
        return axios.get(
            `/api/recipes/summaries`,
            {
                params: accumulated,
                paramsSerializer: params => params.map(acc => `name=${acc}`).join("&")
            })
    })

    if (countQuery.isLoading || recipesQuery.isLoading) {
        return <span>Loading...</span>
    }
    if (countQuery.isError || recipesQuery.isError) {
        return <span>
            {countQuery.isError ? <span>Count Error: ${countQuery.error}</span> : <span/>}
            {recipesQuery.isError ? <span>Recipes Error: ${recipesQuery.error}</span> : <span/>}
        </span>
    }

    const recipeCount: number = countQuery.data.data
    const recipes: Array<RecipeSummary> = recipesQuery.data.data || []

    // todo replace with useMutation
    function handleDeleteRecipe(recipeId: string): void {
        axios
            .delete(`/api/recipes/${recipeId}`)
            .then(response => {
                // setRecipes(current => current.filter(recipe => recipe._id !== response.data._id))
                setConfirmDelete([])
            })
    }

    function renderEditDelete(recipeId: string): JSX.Element {
        if (confirmDelete.findIndex(id => id === recipeId) >= 0) {
            return (
                <>
                    <Button
                        key={`${recipeId}-confirm`}
                        startIcon={<DeleteIcon sx={{width: 18, height: 18}}/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => handleDeleteRecipe(recipeId)}
                    >
                        Confirm
                    </Button>
                    <Button
                        key={`${recipeId}-cancel`}
                        startIcon={<CancelIcon sx={{width: 18, height: 18}}/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => setConfirmDelete(current => current.filter(id => id !== recipeId))}
                    >
                        Cancel
                    </Button>
                </>
            )
        }
        return (
            <>
                <IconButton
                    onClick={() => router.push(`/recipes/edit?id=${recipeId}`)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton>
                <IconButton
                    key={`${recipeId}-delete`}
                    onClick={() => setConfirmDelete(current => [...current, recipeId])}
                    color='primary'
                    size='small'
                >
                    <DeleteIcon sx={{width: 18, height: 18}}/>
                </IconButton>
            </>
        )
    }

    return (
        <Layout home>
            <Head>
                <title>{process.env.siteName}</title>
            </Head>
            <section>
                <div>
                    {accumulated.map(search => (
                        <Chip
                            key={search}
                            label={search}
                            size='small'
                            style={{marginRight: 7}}
                            onDelete={() => deleteAccumulated(search)}
                        />
                    ))}
                </div>

                <Typography
                    paragraph
                    sx={{fontSize: '0.7em', marginTop: '0.25em'}}
                >
                    Showing {recipes.length} of {recipeCount} recipes
                </Typography>

                {recipes.map(recipe => {
                    const rating = ratingsFrom(recipe)
                    return (
                        <Card
                            key={`${recipe.name}-li`}
                            variant="outlined"
                            sx={{
                                maxWidth: {
                                    xs: 500,
                                    md: 500
                                },
                                marginBottom: 1
                            }}
                        >
                            <CardHeader
                                avatar={inProgress(recipe._id.toString()) ?
                                    <Avatar sx={{bgcolor: theme.palette.primary.main}}><MenuBook/></Avatar> :
                                    <span/>
                                }
                                title={<Link href={`/recipes/${recipe._id}`}>
                                    <a style={{textDecoration: 'none', color: theme.palette.primary.main}}>
                                        {recipe.name.toUpperCase()}
                                    </a>
                                </Link>}
                                subheader={<div>
                                    <Typography sx={{fontSize: '0.7em', marginTop: '-0.2em'}}>
                                        <Date epochMillis={
                                            (recipe.modifiedOn !== null ?
                                                    recipe.modifiedOn :
                                                    recipe.createdOn
                                            ) as number
                                        }/>
                                    </Typography>
                                    <Typography sx={{fontSize: '0.7em', marginTop: '-0.2em'}}>
                                        {recipe.author ?
                                            <span style={{marginRight: 25}}>Author: {recipe.author}</span> :
                                            <span/>
                                        }
                                        {recipe.addedBy ?
                                            <span>Added By: {recipe.addedBy}</span> :
                                            <span/>
                                        }
                                    </Typography>
                                </div>}
                                action={renderEditDelete(recipe._id.toString())}
                            />
                            <CardContent>
                                <Box
                                    sx={{
                                        width: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: 1,
                                        marginBottom: 1,
                                        marginTop: -1
                                    }}
                                >
                                    <Rating
                                        name="recipe-rating"
                                        defaultValue={0}
                                        precision={1}
                                        value={rating.mean}
                                        readOnly
                                    />
                                    <Box sx={{paddingLeft: 1, fontSize: '0.8em'}}>
                                        ({rating.ratings})
                                    </Box>
                                </Box>

                                {recipe.tags.map(tag => (
                                    <span style={{paddingLeft: 7}} key={`${recipe.name}-tag-${tag}`}>
                                    <Chip label={tag} variant='outlined' size='small'/>
                                </span>
                                ))}
                            </CardContent>
                        </Card>
                    )
                })}
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

