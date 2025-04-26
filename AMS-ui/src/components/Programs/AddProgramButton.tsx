import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import AddProgramModal from './AddProgramModal';

const AddProgramButton = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div>
        <Button onPress={onOpen} className='border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<FaPlus />}>Add Program</Button>
        <AddProgramModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  )
}

export default AddProgramButton