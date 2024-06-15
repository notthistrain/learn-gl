import Dropdown from 'antd/es/dropdown'
import Button from 'antd/es/button'
import { DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd/es/menu'
import { useNavigate } from 'react-router-dom'
import { memo, useMemo } from 'react'
import { root_children } from '@/ui/routes'

export const Header = memo(function () {
    const navigate = useNavigate()

    const menu: MenuProps = useMemo(() => {
        return {
            items: root_children.map((r) => ({ label: r.id, key: r.path })),
            onClick: ({ key }) => {
                navigate(`${key}`)
            }
        }
    }, [])

    return <div className=" w-full h-7 shrink-0 grow-0 flex items-center">
        <Dropdown menu={menu} trigger={['click']}>
            <a className=' cursor-pointer mx-2' onClick={(e) => e.preventDefault()}>
                切换
                <DownOutlined />
            </a>
        </Dropdown>
        <Button onClick={() => postMessage('render')} size='small'>render</Button>
    </div>
})