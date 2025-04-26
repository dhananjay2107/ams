'use client'
import { Input } from '@heroui/react'
import React from 'react'
import { MdSearch } from 'react-icons/md'

const SearchBar = () => {
    return (
        <Input
            isClearable
            placeholder='Search by name...'
            className="border max-w-[44%] rounded-lg"
            startContent={<MdSearch />}
        />
    )
}

export default SearchBar