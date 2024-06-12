import { Header } from '@/ui/components/header'
import { Outlet } from 'react-router-dom'

export function Root() {
	return <div className=" w-full h-full overflow-hidden flex flex-col justify-center items-center">
		<Header />
		<div className=' w-full shrink grow overflow-auto'>
			<Outlet />
		</div>
	</div>
}