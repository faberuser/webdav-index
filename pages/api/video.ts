import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/utils'

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query
    if (typeof filename === 'string') {
        const buffer: any = await utils.getFileContent(filename)
        const fileSize = buffer.length
        const range = req.headers.range

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head)
            res.end(buffer.slice(start, end + 1))
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            res.end(buffer)
        }
    } else {
        res.status(400).json({ error: 'Invalid filename' })
    }
}