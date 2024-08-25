import { root_dir, remoteURL, username, password } from "@/config"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "webdav"
import NodeCache from 'node-cache'
import https from 'https'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const agent = new https.Agent({ rejectUnauthorized: false })

const client = createClient(remoteURL, {
  username: username,
  password: password,
  httpsAgent: agent,
})

const contentsCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 })

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

export async function getDownloadURL(filename: string) {
  const downloadLink: string = client.getFileDownloadLink(root_dir + filename)
  return URL.createObjectURL(new Blob([downloadLink]))
}

export async function getTextContent(filename: string) {
  return await client.getFileContents(root_dir + filename, { format: "text" })
}