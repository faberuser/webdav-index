import { useRouter } from 'next/router';
import type { Metadata } from "next"
import { Main } from '@/app/main';
import { title } from '@/config'

export const metadata: Metadata = {
    title: title,
    description: "Interface Indexer for " + title,
}

const Slug = () => {
    const router = useRouter();
    const { slug = [] }: any = router.query;
    const currentPath = slug.join('/');
    return <Main currentPath={currentPath} title={title} />
};

export default Slug;