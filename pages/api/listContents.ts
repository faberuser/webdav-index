import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { dir, deep } = req.query
    if (typeof dir === 'string') {
        const dirContents = await utils.listContents(dir, deep === 'true')
        res.status(200).json(dirContents)
    } else {
        res.status(400).json({ error: 'Invalid dir' })
    }
}