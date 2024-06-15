import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@/ui/css/styles.css"
import { routes } from '@/ui/routes'

export default async function init_render() {
	const root = document.createElement('div')
	root.id = 'root'
	document.body.appendChild(root)

	const router = createBrowserRouter(routes)

	createRoot(root).render(<RouterProvider router={router} />)
}