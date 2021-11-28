import fs from 'fs'
import path from "path"
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import {GetStaticPaths} from "next";
import {ParsedUrlQuery} from "querystring";

const postsDirectory = path.join(process.cwd(), 'posts')
type BlogPost = {
    date: string
    title: string
}

export function getSortedPostsData(): Array<BlogPost> {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPosts = fileNames.map(fileName => {
        const id = fileName.replace(/\.md/, '')

        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        const matterResult = matter(fileContents)

        return {
            id,
            ...(matterResult.data as BlogPost)
        }
    })

    return allPosts.sort((a, b) => {
        if (a.date < b.date) return 1
        if (a.date > b.date) return -1
        return 0
    })
}

export type PostIdParam = { params: {id: string} }

export function getAllPostIds(): Array<PostIdParam> {
    const filenames = fs.readdirSync(postsDirectory)
    return filenames.map(filename => ({
        params: {
            id: filename.replace(/\.md/, '')
        }
    }))
}

export type PostData = { id: string, contentHtml: string } & BlogPost

export async function getPostData(id: string): Promise<PostData> {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents)

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const contentHtml = processedContent.toString()

    return {
        id,
        contentHtml,
        ...(matterResult.data as BlogPost)
    }
}
