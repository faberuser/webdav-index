import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/server'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req.query
    if (typeof query === 'string') {
        const searchResults = await utils.search(query)
        res.status(200).json(searchResults)
    } else {
        res.status(400).json({ error: 'Invalid' })
    }
    return
}
