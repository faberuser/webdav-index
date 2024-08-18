import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "webdav"
import NodeCache from 'node-cache'
import https from 'https'

import { root_dir, remoteURL, username, password } from "@/config"

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
        return {
          ..._dir,
          filename: _dir.filename.replace(root_dir, '')
        }
      })
  }

}

export async function getFileContent(filename: string) {
  const buff: Buffer = await client.getFileContents(root_dir + filename)
  return buff
}

export async function getDownloadURL(filename: string) {
  // return await client.getFileDownloadLink(root_dir + filename)
  const buff: Buffer = await client.getFileContents(root_dir + filename)
  return buff
}