import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/server'
import https from 'https'
import url from 'url'
import path from 'path'

export const config = {
    api: {
        responseLimit: false,
    },
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query
    if (typeof filename === 'string') {
        const fileURL = await utils.getDownloadURL(filename)
        const options = {
            ...url.parse(fileURL),
            rejectUnauthorized: false
        }
        https.get(options, (fileRes) => {
            res.setHeader('Content-Type', fileRes.headers['content-type'] || 'application/octet-stream')
            const encodedFilename = encodeURIComponent(path.basename(filename))
            const disposition = `attachment; filename*=UTF-8''${encodedFilename}`
            res.setHeader('Content-Disposition', disposition)
            fileRes.pipe(res)
        }).on('error', (err) => {
            console.error(`Error downloading file: ${err.message}`)
            res.status(500).send({ error: 'Error downloading file' })
        })
    } else {
        res.status(400).send({ error: 'Invalid filename' })
    }
    return
}