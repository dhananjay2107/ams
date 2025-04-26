import Card from '@/components/Cards/Card'
import UsersTable from '@/components/Users/UsersTable'
import { getUsers } from '@/services/api/users'
import React from 'react'
import { FaUser } from "react-icons/fa";

const UsersPage = async () => {
  const users = await getUsers()
  return (
    <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
      <div className='flex justify-between gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Users</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 '>
        <Card title="Total Users" value={users.length} icon={<FaUser className='h-6 w-6'/>}/>
      </div>
      <UsersTable data={users} />
    </div>
  )

}

export default UsersPage