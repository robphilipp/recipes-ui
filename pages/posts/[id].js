import Head from 'next/head'
import Layout from "../../components/layout";
import {getAllPostIds, getPostData} from "../../lib/posts";
import Date from "../../components/Date";
import utilStyles from '../../styles/utils.module.css'

export default function Post({postData}) {
    return (
        <Layout>
            <Head><title>{postData.title}</title></Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                {/*<div className={utilStyles.lightText}>{postData.id}</div>*/}
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
    const postData = getPostData(params.id)
    return {
        props: {
            postData
        }
    }
}