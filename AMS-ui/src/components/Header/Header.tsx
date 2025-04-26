'use client'
import Link from 'next/link'
import Logo from './Logo'
import { HiMenuAlt2 } from "react-icons/hi";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react';
import Cookies from 'js-cookie';
import { getFullName } from '@/utilities/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

const Header = () => {
    const router = useRouter()
    const user = useUser()

    const handleLogout = () => {
        Cookies.remove('access_token')
        router.push("/login")
    }

    return (
        <div className='fixed z-30 top-0 w-full border-b drop-shadow-md dark:bg-gray-800 bg-white'>
            <div className='p-2'>
                <div className='flex justify-between'>
                    <div className='flex items-center justify-start rtl:justify-end gap-2'>
                        <button type='button' className='inline-flex items-center w-10 h-10 p-2 rounded-md text-xl hover:bg-secondary hover:text-white focus:ring-gray-200 md:hidden duration-300'>
                            <HiMenuAlt2 />
                        </button>
                        <Link href='#'>
                            <Logo />
                        </Link>
                    </div>
                    <div className='flex items-center mr-1'>
                        <Dropdown placement="bottom-start">
                            <DropdownTrigger>
                                <User
                                    avatarProps={{
                                        name: getFullName(user?.first_name, user?.middle_name, user?.last_name),
                                        color: "primary",
                                        size: "sm",
                                        isBordered: true,
                                    }}
                                    description={user?.role ?? ""}
                                    name={getFullName(user?.first_name, user?.middle_name, user?.last_name)}
                                    as="button"
                                    className="transition-transform"
                                />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="User Actions" variant="flat">
                                <DropdownItem key="settings" href='#'>My Profile</DropdownItem>
                                <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                                    Log Out
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header