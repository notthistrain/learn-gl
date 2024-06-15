import { RouteObject } from "react-router-dom";
import { Root } from '@/ui/routes/root'
import { Ring } from '@/ui/routes/ring'
import { Heart } from '@/ui/routes/heart'

export const root_children = [
    {
        id: '环',
        path: 'ring',
        element: <Ring />
    },
    {
        id: '爱心',
        path: 'heart',
        element: <Heart />
    }
]

export const routes: RouteObject[] = [
    {
        id: 'root',
        path: '/',
        element: <Root />,
        children: root_children
    }
]