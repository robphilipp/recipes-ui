import Head from 'next/head'
import Layout from "../../components/Layout";
import {getAllPostIds, getPostData, PostData, PostIdParam} from "../../lib/posts";
import utilStyles from '../../styles/utils.module.css'
import {
    GetStaticPaths,
    GetStaticPathsResult,
    GetStaticProps,
    GetStaticPropsContext,
    GetStaticPropsResult,
    PreviewData
} from "next";
import {ParsedUrlQuery} from "querystring";

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

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: getAllPostIds(),
    fallback: false
})

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
    const postData = await getPostData(context.params.id as string)
    return {
        props: {
            postData
        }
    }
}
