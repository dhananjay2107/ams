import Link from 'next/link';
import React from 'react'

type MenuItem = {
  name: string
  href: string
  icon?: React.ElementType
  children?: MenuItem[]
}

type SidebarLinksProps = {
  menuItems: MenuItem[]
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ menuItems }) => {
  return (
    <>
      {menuItems.map((link) => {
        const IconComponent = link.icon
        return (
          <div key={link.name}>
            <Link
              href={link.href}
              className='flex items-center h-[40px] grow gap-2 rounded-md p-3 text-sm text-white hover:bg-secondary hover:duration-300'
            >
              {IconComponent && <IconComponent className='w-5 h-5' />}
              <p>{link.name}</p>
            </Link>
            {
              link.children && (
                <div className="ml-4">
                  {link.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="flex items-center h-[30px] gap-2 rounded-md p-3 text-sm text-gray-400 hover:bg-secondary hover:text-white"
                    >
                      <p>{child.name}</p>
                    </Link>
                  ))}
                </div>
              )
            }
          </div>
        )
      })}

    </>
  )
}

export default SidebarLinks