import Head from 'next/head'
import Layout from '../components/Layout'
import Date from '../components/Date'
import React, {JSX, useReducer, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {useSearch} from "../lib/useSearch";
import axios from 'axios'
import {useStatus} from "../lib/useStatus";
import {GroupAdd, MenuBook, People, PeopleOutline, Visibility} from "@mui/icons-material";
import {ratingsFrom, RecipeSummary} from "../components/recipes/Recipe";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import {useRouter} from "next/router";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Link from 'next/link'
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import RecipeRating from "../components/recipes/RecipeRating";
import {
    AccessRight,
    AccessRights,
    accessRightsFrom,
    RecipePermission,
    WithPermissions
} from "../components/recipes/RecipePermissions";
import {RecipesWithUsers} from "./api/recipes/search/users";
import {UserWithPermissions} from "../lib/recipes";
import {useSession} from "next-auth/react";
import {RoleType} from "../components/users/Role";
import RecipeUsersView from "../components/recipes/users/RecipeUsersView";
import {UpdateRecipesPermissionRequest} from "./api/permissions/recipe";
import {RecipeAddUsersView} from "../components/recipes/users/RecipeAddUsersView";

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

type RecipeUserState = {
    menuAnchor: HTMLElement | null
    currentRecipeId: string | null
    tooltipRecipeId: string | null
}

type RecipeUserAction = {
    recipeId: string | null // the recipe ID on which the action took place
    eventSource: HTMLElement | null // if the event was a toggle button, then that
    event: "toggle" | "mouse-enter" | "mouse-leave" | "menu-close" | "menu-click"
}

function recipeUserReducer(state: RecipeUserState, action: RecipeUserAction): RecipeUserState {
    switch (action.event) {
        case "toggle":
            // no menu is currently open (new click)
            if (state.currentRecipeId == null) {
                return {menuAnchor: action.eventSource, currentRecipeId: action.recipeId, tooltipRecipeId: null}
            }
            // menu is open for another recipe than the one for which the toggle was clicked
            if (state.currentRecipeId !== action.recipeId) {
                return {menuAnchor: action.eventSource, currentRecipeId: action.recipeId, tooltipRecipeId: null}
            }
            // must be a toggle of the same menu
            return {menuAnchor: null, currentRecipeId: null, tooltipRecipeId: action.recipeId}

        case "mouse-enter":
            return {...state, tooltipRecipeId: action.recipeId}

        case "mouse-leave":
            return {...state, tooltipRecipeId: null}

        case "menu-close":
            return {menuAnchor: null, currentRecipeId: null, tooltipRecipeId: null}

        case "menu-click":
            return {menuAnchor: null, currentRecipeId: state.currentRecipeId, tooltipRecipeId: null}

        default:
            return state
    }
}

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
    const session = useSession()

    const {accumulated, deleteAccumulated} = useSearch()
    const {inProgress} = useStatus()

    const [confirmDelete, setConfirmDelete] = useState<Array<string>>([])

    const [recipeUsers, updateRecipeUsers] = useReducer(
        recipeUserReducer,
        {menuAnchor: null, currentRecipeId: null, tooltipRecipeId: null}
    )
    const [showUsers, setShowUsers] = useState<boolean>(false)
    const [showAddUser, setShowAddUser] = useState<boolean>(false)

    const queryClient = useQueryClient()

    // loads the recipe count
    const countQuery = useQuery(
        ['recipeCount'],
        () => axios.get('/api/recipes/count')
    )

    // loads the summaries that match one or more of the accumulated search terms
    const recipesQuery = useQuery(
        ['recipes', accumulated],
        () => axios.get(
            '/api/recipes/summaries',
            {
                params: accumulated,
                paramsSerializer: params => params.map(acc => `name=${acc}`).join("&")
            })
    )

    const recipes: Array<WithPermissions<RecipeSummary>> = recipesQuery?.data?.data || []

    const recipeUsersQuery = useQuery(
        ['recipeUsers', recipes.map(recipe => recipe.id).join(":")],
        () => axios.post(
            '/api/recipes/search/users',
            {
                recipeIds: recipes
                    .filter(recipe => recipe.id != null)
                    .map(recipe => recipe.id as string),
                includeAdmins: false
            },
            {}
        )
    )

    // deletes a recipe upon confirmation
    const deleteQuery = useMutation(
        ['delete-recipe'],
        (recipeId: string) => axios.delete(`/api/recipes/${recipeId}`)
    )

    // const updatePermissionsQuery = useMutation() updateUserPermissionsTo()
    const updatePermissionsQuery = useMutation(
        ['update-recipe-permissions'],
        (request: UpdateRecipesPermissionRequest) => axios.post(
            '/api/permissions/recipe',
            request
        )
    )

    if (countQuery.isLoading || recipesQuery.isLoading || deleteQuery.isLoading || recipeUsersQuery.isLoading || updatePermissionsQuery.isLoading) {
        return <span>Loading...</span>
    }
    if (countQuery.isError || recipesQuery.isError || deleteQuery.isError || recipeUsersQuery.isError || updatePermissionsQuery.isError) {
        return <span>
            {countQuery.isError ? <span>Count Error: {(countQuery.error as Error).message}</span> : <span/>}
            {recipesQuery.isError ? <span>Recipes Error: {(recipesQuery.error as Error).message}</span> : <span/>}
            {deleteQuery.isError ? <span>Delete Recipe Error: {(deleteQuery.error as Error).message}</span> : <span/>}
            {recipeUsersQuery.isError ?
                <span>Recipe Users-Permissions Error: {(recipeUsersQuery.error as Error).message}</span> : <span/>}
        </span>
    }

    const recipeUsersRaw = (recipeUsersQuery?.data?.data ?? []) as Array<RecipesWithUsers>
    const recipesWithUsers = new Map<string, Array<UserWithPermissions>>(
        recipeUsersRaw.map(({recipeId, permissions}) => [recipeId, permissions])
    )

    const hasUsers = (recipeId: string | null): boolean => (recipesWithUsers.get(recipeId ?? "") ?? []).length > 0

    /**
     * Callback for when the confirm to delete button is clicked
     * @param recipeId The ID of the recipe to delete
     */
    function handleDeleteRecipe(recipeId: string): void {
        deleteQuery.mutate(recipeId, {
            onSuccess: async () => {
                setConfirmDelete([])
                await queryClient.invalidateQueries(['recipes', accumulated])
                await queryClient.invalidateQueries(['recipeCount'])
            }
        })
    }

    /**
     * Handles updating the user permissions for the specified recipe with the changes for
     * each user.
     * @param recipeId The ID to which all the changes refer
     * @param changes A map that associates the principal ID to a list of access rights.
     */
    function handleUpdatePermissions(recipeId: string, changes: Map<string, Array<AccessRight>>): void {
        const promises = Array.from(changes.entries())
            .map(([userId, rights]) => ({
                recipeId,
                userId,
                accessRights: accessRightsFrom(rights)
            }))
            .map((request: UpdateRecipesPermissionRequest) => updatePermissionsQuery.mutateAsync(request))

        Promise.all(promises)
            .then(() => queryClient.invalidateQueries(['recipeUsers']))
    }

    /**
     * Renders the user icon for recipes that this user owns, or if this user is an admin, then
     * all recipes. For recipes with no users, displays an outlined users icon, otherwise displays a
     * solid users icon.
     * @param recipeId The recipe ID of the current card
     * @param access The access rights this user has to the recipe
     * @param users An (optional) array of users with permissions to this recipe
     * @return An icon button with a tooltip, or nothing
     */
    function maybeRenderUserWithAccess(recipeId: string, access: AccessRights, users: Array<UserWithPermissions> = []): JSX.Element {
        if (session.data?.user.role.name === RoleType.ADMIN || (access.read && users.length > 0)) {

            const tooltip = users.length === 0 ?
                "No users have access to this recipe." :
                users.length === 1 ?
                    "One user has access to this recipe." :
                    `There are ${users.length} users with access to this recipe.`

            const numUsersWithAccess = recipesWithUsers.get(recipeId)?.length || 0
            return (
                <>
                    <Tooltip
                        title={`${tooltip} Click for more options.`}
                        disableHoverListener={true}
                        open={recipeUsers.tooltipRecipeId === recipeId}
                        onMouseEnter={() => updateRecipeUsers({recipeId, eventSource: null, event: "mouse-enter"})}
                        onMouseLeave={() => updateRecipeUsers({
                            recipeId: null,
                            eventSource: null,
                            event: "mouse-leave"
                        })}
                    >
                        <IconButton
                            onClick={event => updateRecipeUsers({
                                recipeId,
                                eventSource: event.currentTarget,
                                event: "toggle"
                            })}
                            color='primary'
                            size='small'
                        >
                            {users.length > 0 ?
                                <People sx={{width: 18, height: 18}}/> :
                                <PeopleOutline sx={{width: 18, height: 18}}/>}
                            {numUsersWithAccess > 0 && <Typography sx={{fontSize: '0.7em', marginTop: '-0.2em'}}>({numUsersWithAccess})</Typography>}
                        </IconButton>
                    </Tooltip>
                </>
            )

        }
        return <></>
    }

    /**
     * Renders the edit and delete buttons in the recipe card with the specified ID. If the
     * ID is being deleted, replaces the edit and delete buttons with confirm and cancel
     * buttons.
     * @param recipeId The ID of the recipe
     * @param access The rights the user has for this recipe (i.e. CRUD)
     * @param users An optional list of users that have access to the recipe
     * @return The edit and delete, or the confirm and cancel buttons.
     */
    function renderActionButtons(recipeId: string, access: AccessRights, users?: Array<UserWithPermissions>): JSX.Element {
        if (confirmDelete.findIndex(id => id === recipeId) >= 0) {
            return (
                <>
                    {access.update && <Button
                        key={`${recipeId}-confirm`}
                        startIcon={<DeleteIcon sx={{width: 18, height: 18}}/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => handleDeleteRecipe(recipeId)}
                    >
                        Confirm
                    </Button>}
                    {access.delete && <Button
                        key={`${recipeId}-cancel`}
                        startIcon={<CancelIcon sx={{width: 18, height: 18}}/>}
                        sx={{textTransform: 'none'}}
                        onClick={() => setConfirmDelete(current => current.filter(id => id !== recipeId))}
                    >
                        Cancel
                    </Button>}
                </>
            )
        }
        return (
            <>
                {maybeRenderUserWithAccess(recipeId, access, users)}
                {access.update && <Tooltip title="Click here to edit this recipe."><IconButton
                    onClick={() => router.push(`/recipes/edit?id=${recipeId}`)}
                    color='primary'
                    size='small'
                >
                    <ModeEditIcon sx={{width: 18, height: 18}}/>
                </IconButton></Tooltip>}
                {access.delete && <Tooltip title="Click here to delete recipe."><IconButton
                    key={`${recipeId}-delete`}
                    onClick={() => setConfirmDelete(current => [...current, recipeId])}
                    color='primary'
                    size='small'
                >
                    <DeleteIcon sx={{width: 18, height: 18}}/>
                </IconButton></Tooltip>}
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
                    Showing {recipes.length} of {countQuery?.data?.data || 0} recipes
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
                                avatar={inProgress(recipe.id) ?
                                    <Avatar sx={{bgcolor: theme.palette.primary.main}}><MenuBook/></Avatar> :
                                    <span/>
                                }
                                title={<Link href={`/recipes/${recipe.id}`}
                                             style={{textDecoration: 'none', color: theme.palette.primary.main}}>
                                    {recipe.name.toUpperCase()}
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
                                        <span style={{marginRight: 25}}>Owner: {recipe.ownerId}</span>
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
                                action={recipe.id ?
                                    renderActionButtons(recipe.id, recipe.accessRights, recipesWithUsers.get(recipe.id)) :
                                    <></>}
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
                                    <RecipeRating rating={rating}/>
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
            <Menu
                id="user-menu"
                open={Boolean(recipeUsers.menuAnchor)}
                anchorEl={recipeUsers.menuAnchor}
                onClose={() => updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-close"})}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 150,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                            width: 300, maxWidth: '100%'
                        },
                    }
                }}
                transformOrigin={{horizontal: 'center', vertical: 'top'}}
                anchorOrigin={{horizontal: 'center', vertical: 'bottom'}}
            >
                {hasUsers(recipeUsers.currentRecipeId) ?
                    <MenuItem>
                        <ListItemIcon>
                            <Visibility fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText onClick={() => {
                            setShowUsers(true)
                            updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-click"})
                        }}>
                            View/Update users
                        </ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ({recipesWithUsers.get(recipeUsers.currentRecipeId ?? "")?.length})
                        </Typography>
                    </MenuItem> :
                    <></>}
                <MenuItem>
                    <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
                    <ListItemText onClick={() => {
                        setShowAddUser(true)
                        updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-click"})
                    }}>
                        Give user access
                    </ListItemText>
                </MenuItem>
            </Menu>
            <RecipeUsersView
                users={recipesWithUsers.get(recipeUsers.currentRecipeId ?? "") ?? []}
                requester={session.data!.user}
                open={showUsers}
                onClose={() => {
                    setShowUsers(false)
                    updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-close"})
                }}
                onSave={(changed: Map<string, Array<AccessRight>>) => {
                    setShowUsers(false)
                    handleUpdatePermissions(recipeUsers.currentRecipeId!, changed)
                    updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-close"})
                }}
            />
            <RecipeAddUsersView
                // recipeName={"recipes"}
                requester={session.data!.user}
                open={showAddUser}
                onClose={() => {
                    setShowAddUser(false)
                    updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-close"})
                }}
                onSave={(permissions: RecipePermission) => {
                    setShowAddUser(false)
                    // handleUpdatePermissions(recipeUsers.currentRecipeId!, changed)
                    updateRecipeUsers({recipeId: null, eventSource: null, event: "menu-close"})
                }}
            />
        </Layout>
    )
}

// export async function getServerSideProps(context) {
// export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext<ParsedUrlQuery, string | false | object>) => {
//     return {
//         props: {}, // Will be passed to the page component as props
//     }
// }

// export const getServerSideProps = withSession(async function ({ req, res }) {
//     const { user } = req.session
//
//     if (!user) {
//         return {
//             redirect: {
//                 destination: '/login',
//                 permanent: false,
//             },
//         }
//     }
//
//     return {
//         props: { user },
//     }
// })

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

