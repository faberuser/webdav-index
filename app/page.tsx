import dynamic from 'next/dynamic';
import { title } from '@/config'

const Client = dynamic(() => import('./client'), { ssr: false })

export default function Page() {
  return (
    <Client title={title} />
  )
}
