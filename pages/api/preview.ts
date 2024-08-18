import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query
    if (typeof filename === 'string') {
        const fileContent = await utils.getFileContent(filename)
        res.status(200).send(fileContent)
        return
    } else {
        res.status(400).json({ error: 'Invalid filename' })
    }
}