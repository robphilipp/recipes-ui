import fs from 'fs'
import path from "path"
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPosts = fileNames.map(fileName => {
        const id = fileName.replace(/\.md/, '')

        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        const matterResult = matter(fileContents)

        return {
            id,
            ...matterResult.data
        }
    })

    return allPosts.sort(({date: a}, {date: b}) => {
        if (a < b) return 1
        if (a > b) return -1
        return 0
    })
}

export function getAllPostIds() {
    const filenames = fs.readdirSync(postsDirectory)
    return filenames.map(filename => ({
        params: {
            id: filename.replace(/\.md/, '')
        }
    }))
}

export function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents)

    return {
        id,
        ...matterResult.data
    }
}
