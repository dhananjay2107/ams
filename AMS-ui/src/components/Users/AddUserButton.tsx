'use client'
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import AddUserModal from './AddUserModal';

const AddUserButton = () => {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <Button onPress={onOpen} className='p-3 border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<FaPlus />}>Add User</Button>
      <AddUserModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  )
}

export default AddUserButton