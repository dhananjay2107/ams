import React from 'react'
import { HiAcademicCap } from "react-icons/hi";

const Logo = () => {
  return (
    <div className='flex flex-row items-center leading-none text-secondary'>
      <HiAcademicCap className='h-10 w-10' />
      <p className='text-[24px] ml-1 font-bold'>AMS</p>
    </div>
  )
}

export default Logo