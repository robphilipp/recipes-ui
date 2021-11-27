import Link from 'next/link'
import Head from "next/head";
import Layout from "../../components/layout";
import {useEffect, useState} from "react";
import axios from "axios";

export default function FirstPost() {

    const [recipes, setRecipes] = useState([])

    useEffect(
        () => {
            axios
                .get('http://localhost:9090/rest/v1/recipes')
                .then(response => setRecipes(response.data))
        },
        []
    )

    return (
        <>
            <Layout>
                <Head>
                    <title>First Post</title>
                </Head>
                <h1>First Post</h1>
                <div>This is my first post.</div>
                {recipes.map(recipe => <div key={recipe.name}>{recipe.name}</div>)}
            </Layout>
        </>
    )
}