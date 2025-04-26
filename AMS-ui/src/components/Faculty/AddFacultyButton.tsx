'use client'
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import AddFacultyModal from './AddFacultyModal';
import { FaPlus } from 'react-icons/fa';

const AddFacultyButton = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <div>
            <Button onPress={onOpen} className='p-3 border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<FaPlus />}>Add Faculty</Button>
            <AddFacultyModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
    )
}

export default AddFacultyButton