import Head from 'next/head'
import Layout from "../../components/Layout";
import {getAllPostIds, getPostData, PostData, PostIdParam} from "../../lib/posts";
import utilStyles from '../../styles/utils.module.css'
import {GetStaticPaths} from "next";

type Props = {
    postData: PostData
}

export default function Post(props: Props) {
    const {postData} = props

    return (
        <Layout>
            <Head><title>{postData.title}</title></Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>{postData.date}</div>
                <div dangerouslySetInnerHTML={{__html: postData.contentHtml}}/>
            </article>
        </Layout>
    )
}

export async function getStaticPaths() {
    const ids = getAllPostIds()
    return {
        paths: ids,
        fallback: false
    }
}

export async function getStaticProps({params}) {
    const postData = await getPostData(params.id)
    return {
        props: {
            postData
        }
    }
}