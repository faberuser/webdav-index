import { useRouter } from 'next/router'
import { Main } from '@/app/main'
import { title } from '@/config'

const Slug = () => {
    const router = useRouter();
    const { slug = [] }: any = router.query;
    const currentPath = slug.join('/');
    return <Main currentPath={currentPath} title={title} />
};

export default Slug;