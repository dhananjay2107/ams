'use client'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react';
import Cookies from 'js-cookie';
import { getFullName } from '@/utilities/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { LuMessageSquareQuote } from 'react-icons/lu';
import { MdOutlineNotifications } from 'react-icons/md';

const Header = () => {
    const router = useRouter()
    const user = useUser()

    const handleLogout = () => {
        Cookies.remove('access_token')
        router.push("/login")
    }

    return (
        <div className='flex items-center justify-end p-4'>
            <div className='flex items-center gap-6 justify-end w-full'>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
                    <LuMessageSquareQuote className='h-5 w-5' />
                </div>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
                    <MdOutlineNotifications className='h-6 w-6' />
                    <div className='absolute -top-2 -right-3 w-4 h-4 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs'>1</div>
                </div>
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
    )
}

export default Header