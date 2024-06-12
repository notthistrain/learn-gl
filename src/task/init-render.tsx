import { createRoot } from 'react-dom/client'
import { Root } from '@/ui/routes/root'
import { Ring } from '@/ui/routes/ring'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@/ui/css/styles.css"

export default async function init_render() {
	const root = document.createElement('div')
	root.id = 'root'
	document.body.appendChild(root)

	const router = createBrowserRouter([
		{
			id: 'root',
			path: '/',
			element: <Root />,
			children: [
				{
					path: 'ring',
					element: <Ring />
				}
			]
		}
	])

	createRoot(root).render(<RouterProvider router={router} />)
}