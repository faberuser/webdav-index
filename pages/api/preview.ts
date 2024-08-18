import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { type, filename } = req.query
    if (typeof filename === 'string') {
        if (type === 'image') {
            const preview = await utils.getImagePreview(filename)
            res.status(200).send(preview)
            return
        } else if (type === 'video') {
            const preview = await utils.getVideoPreview(filename)
            res.status(200).json(preview)
            return
        } else if (type === 'text') {
            const preview = await utils.getTextPreview(filename)
            res.status(200).json(preview)
            return
        }
    } else {
        res.status(400).json({ error: 'Invalid dir' })
    }
}