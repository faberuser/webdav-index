import type { NextApiRequest, NextApiResponse } from 'next'
import * as utils from '@/lib/server'


export const config = {
    api: {
        responseLimit: false,
    },
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query
    if (typeof filename === 'string') {
        const textContent = await utils.getTextContent(filename)
        res.status(200).send(textContent)
    } else {
        res.status(400).json({ error: 'Invalid filename' })
    }
    return
}