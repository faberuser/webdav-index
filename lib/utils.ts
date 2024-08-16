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

  // let updatedDirContents = dirContents.map(obj => {
  //   if (obj.type === 'directory') {
  //     const dirName = obj.filename;
  //     const count = dirContents.filter(item => {
  //       const itemParts = item.filename.split('/');
  //       const dirParts = dirName.split('/');
  //       return item.filename.startsWith(dirName + '/') && itemParts.length === dirParts.length + 2;
  //     }).length;
  //     return { ...obj, items: count };
  //   }
  //   return obj;
  // })

  // dirContents = updatedDirContents

  if (dir.startsWith(root_dir)) {
    dir = dir.replace(root_dir, "")
  }

  if (deep) {
    return dirContents
      .filter((_dir: any) => {
        return _dir.filename.startsWith(root_dir + dir + '/')
      })
      .map((_dir: any) => {
        return {
          ..._dir,
          filename: _dir.filename.replace(root_dir, '')
        };
      })

  } else {
    const partsLength = (root_dir + dir).split('/').length
    const dirParts = (root_dir + dir).split('/')

    return dirContents
      .filter((_dir: any) => {
        const parts = _dir.filename.split('/')
        return parts.length === partsLength + 1 && parts[parts.length - 2] === dirParts[dirParts.length - 1]
      })
      .map((_dir: any) => {
        return {
          ..._dir,
          filename: _dir.filename.replace(root_dir, '')
        };
      })
  }

}