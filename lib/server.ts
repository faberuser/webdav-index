import { root_dir, remoteURL, username, password, fuzzy } from "@/config"
import { createClient } from "webdav"
import NodeCache from 'node-cache'
import https from 'https'
import sharp from "sharp"
const fuzz = require('fuzzball')

const contentsCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 })
const agent = new https.Agent({ rejectUnauthorized: false })


const client = createClient(remoteURL, {
    username: username,
    password: password,
    httpsAgent: agent,
})


function generateRandomString(length: number, parts: number) {
    let result = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const segmentLength = Math.floor(length / parts)
    for (let i = 0; i < length; i++) {
        if (i > 0 && i % segmentLength === 0 && result.length < length - 1) {
            result += '-'
        } else {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
    }
    return result
}


export async function getContentsCache() {
    let dirContents: any = contentsCache.get("contents")

    if (!dirContents) {
        dirContents = await client.getDirectoryContents(root_dir, { deep: true })
        contentsCache.set("contents", dirContents)
    }

    return dirContents
}


export async function listContents(dir: string, deep: boolean = false, countItems: boolean = false) {
    let dirContents: any = await getContentsCache()

    // dirContents = dirContents.map(obj => {
    //   if (obj.type !== 'directory') return obj

    //   const dirName = obj.filename
    //   const count = dirContents.reduce((acc, item) => {
    //     const isSubItem = item.filename.startsWith(dirName + '/') && item.filename.split('/').length === dirName.split('/').length + 2
    //     return isSubItem ? acc + 1 : acc
    //   }, 0)

    //   return { ...obj, items: count }
    // })

    if (dir.startsWith(root_dir)) {
        dir = dir.replace(root_dir, "")
    }

    const fullPath = root_dir + dir

    if (deep) {
        return dirContents
            .filter((_dir: any) => {
                return _dir.filename.startsWith(fullPath + '/')
            })
            .map((_dir: any) => {
                return {
                    ..._dir,
                    filename: _dir.filename.replace(root_dir, '')
                }
            })

    } else {
        const partsLength = fullPath.split('/').length

        return dirContents
            .filter((_dir: any) => {
                return _dir.filename.startsWith(fullPath + '/') && _dir.filename.split('/').length === partsLength + 1
            })
            .map((_dir: any) => {
                let thumbnailPath = null
                if (_dir.type === 'directory') {
                    const imageFile = dirContents.find((file: any) =>
                        file.filename.startsWith(_dir.filename + '/') &&
                        file.filename.split('/').length === _dir.filename.split('/').length + 1 &&
                        file.type === 'file' &&
                        ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'].includes(file.mime)
                    )
                    if (imageFile) {
                        thumbnailPath = imageFile.filename.replace(root_dir, '')
                    }
                }
                if (!_dir.etag) {
                    const randomStrings = generateRandomString(30, 3)
                    _dir.etag = randomStrings
                }
                return {
                    ..._dir,
                    filename: _dir.filename.replace(root_dir, ''),
                    hasThumbnail: thumbnailPath
                }
            })
    }

}


export async function getFileContent(filename: string) {
    return await client.getFileContents(root_dir + filename)
}


export async function getPreview(filename: string) {
    const fileContents = await getFileContent(root_dir + filename) as Buffer
    const image = sharp(fileContents)
    const metadata = await image.metadata()

    if (metadata.width && metadata.height) {
        if (metadata.width > 256 || metadata.height > 256) {
            if (metadata.width > metadata.height) {
                return await image.resize(256, null).toBuffer()
            } else {
                return await image.resize(null, 256).toBuffer()
            }
        } else {
            return fileContents
        }
    } else {
        return await image.resize(256, 256).toBuffer()
    }
}


export async function getDownloadURL(filename: string) {
    return client.getFileDownloadLink(root_dir + filename)
}


export async function getTextContent(filename: string) {
    return await client.getFileContents(root_dir + filename, { format: "text" })
}


async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: any[] = []
    for await (const chunk of readableStream) {
        chunks.push(chunk)
    }
    return Buffer.concat(chunks)
}


export async function getVideoThumbnail(filename: string) {
    const videoStream = client.createReadStream(
        root_dir + filename,
        { range: { start: 0, end: 1 } }
    )

    const videoContent = await streamToBuffer(videoStream)

    return videoContent
}

export async function search(query: string) {
    const dirContents = await getContentsCache()

    if (fuzzy) {
        const basenames = dirContents.map((item: any) => item.basename)
        return fuzz.extract(query, basenames, { scorer: fuzz.token_set_ratio })
            .filter((item: any) => item[1] >= 80)
            .map((item: any) => {
                return dirContents.find((element: any) => element.basename === item[0])
            })
            .map((item: any) => {
                return {
                    ...item,
                    filename: item.filename.replace(root_dir, '')
                }
            })
    } else {
        return dirContents
            .filter((item: any) => {
                return item.basename.toLowerCase().includes(query.toLowerCase())
            })
            .map((item: any) => {
                return {
                    ...item,
                    filename: item.filename.replace(root_dir, '')
                }
            })
    }
}