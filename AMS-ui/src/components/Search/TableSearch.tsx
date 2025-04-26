import React from 'react'
import { CiSearch } from 'react-icons/ci'
import GeneralInput from '../inputs/GeneralInput'

const TableSearch = () => {
    return (
        <GeneralInput name="search" variant='bordered' placeholder='Search....' icon={<CiSearch />} radius='full'/>
    )
}

export default TableSearch