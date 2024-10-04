import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/server'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query
    if (typeof filename === 'string') {
        const fileContent = await utils.getPreview(filename)
        res.status(200).send(fileContent)
    } else {
        res.status(400).json({ error: 'Invalid filename' })
    }
    return
}
