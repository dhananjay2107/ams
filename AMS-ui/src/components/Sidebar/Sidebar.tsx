import React from 'react'
import SidebarLinks from './SidebarLinks'
import { MdOutlineSchedule } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { FiUsers, FiSettings, FiUserCheck } from "react-icons/fi";
import { FaRegCalendarTimes } from "react-icons/fa";
import Logo from './Logo';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { RiCalendarScheduleLine } from "react-icons/ri";

const menuItems = {
    admin: [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: RxDashboard
        },
        {
            name: 'People',
            href: '#',
            icon: FiUsers,
            children: [
                {
                    name: 'Users',
                    href: '/admin/users'
                },
                {
                    name: 'Students',
                    href: '/admin/students',
                },
                {
                    name: 'Faculties',
                    href: '/admin/faculties'
                },
            ]
        },
        {
            name: 'Manage Timetable',
            href: '/admin/timetable',
            icon: MdOutlineSchedule
        },
        {
            name: 'Settings',
            href: '#',
            icon: FiSettings,
            children: [
                {
                    name: 'Programs',
                    href: '/admin/program',
                },
                {
                    name: 'Courses',
                    href: '/admin/course'
                },
                {
                    name: 'Batches',
                    href: '/admin/batch'
                }
            ]
        },
    ],
    student: [
        {
            name: 'Dashboard',
            href: '/student/dashboard',
            icon: RxDashboard
        },
        {
            name: 'Timetable Schedule',
            href: '/student/myschedule',
            icon: RiCalendarScheduleLine
        },
        {
            name: 'Attendance',
            href: '/student/attendance',
            icon: FiUserCheck
        },
        {
            name: 'Leave',
            href: '/student/leave',
            icon: FaRegCalendarTimes
        },
    ],
    faculty: [
        {
            name: 'Dashboard',
            href: '/faculty/dashboard',
            icon: RxDashboard
        },
        {
            name: 'Timetable Schedule',
            href: '/faculty/myschedule',
            icon: RiCalendarScheduleLine
        },
        {
            name: 'Attendance',
            href: '/faculty/attendance',
            icon: RiCalendarScheduleLine
        },
        {
            name: 'Leave',
            href: '/faculty/leave',
            icon: FaRegCalendarTimes
        },
    ]
}

const Sidebar = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) {
        return redirect('/login');
    }
    const decoded_token: any = jwtDecode(token)

    let userMenuItems: any = [];
    if (decoded_token.role === 'admin') {
        userMenuItems = menuItems.admin;
    } else if (decoded_token.role === 'student') {
        userMenuItems = menuItems.student;
    } else if (decoded_token.role === 'faculty') {
        userMenuItems = menuItems.faculty;
    }

    return (
        <aside className='fixed h-screen z-40 top-0 left-0 bg-primary dark:bg-gray-800 md:w-52 md:translate-x-0 transition-transform -translate-x-full'>
            <div className='h-full px-3 py-4'>
                <div>
                    <Link href='#'><Logo /></Link>
                </div>
                <div className='flex flex-col pt-4 gap-2 w-full justify-center'>
                    <SidebarLinks menuItems={userMenuItems} />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar