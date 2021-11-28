import {allRecipes, Recipe, recipeSummaries} from "../../lib/recipes";
import Layout from "../../components/Layout";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next";
import Date from '../../components/Date'

type Props = {
    recipe: Recipe
}
export default function RecipeView(props: Props): JSX.Element {
    const {recipe} = props

    return (
        <Layout>
            <Head><title>{recipe.name}</title></Head>
            <article>
                <h1 className={utilStyles.headingXl}>{recipe.name}</h1>
                <div className={utilStyles.lightText}>Created On: <Date epochMillis={recipe.createdOn}/></div>
                <div className={utilStyles.lightText}>Modified On: <Date epochMillis={recipe.modifiedOn}/></div>
                <h2 className={utilStyles.headingMd}>Ingredients</h2>
                <div>
                    <ul className={utilStyles.list}>
                        {recipe.ingredients.map(ingredient => (
                            <li className={utilStyles.listItem} key={ingredient.name}>
                                {`${ingredient.amount.value} ${ingredient.amount.unit}   ${ingredient.name}`}
                            </li>
                        ))}
                    </ul>
                </div>
                <h2 className={utilStyles.headingMd}>Steps</h2>
                <div>
                    <ol className={utilStyles.list}>
                        {recipe.steps.map(step => (
                            <li className={utilStyles.listItem} key={step.text}>
                                {step.text}
                            </li>
                        ))}
                    </ol>
                </div>
            </article>
        </Layout>
    )

}

export const getServerSideProps: GetServerSideProps = async context => {
    const name = (context.params.recipeName as string).replace(/_/, ' ')
    const recipes = await allRecipes().then(response => response.filter(recipe => recipe.name === name))
    return {
        props: {
            recipe: recipes[0]
        }
    }
}