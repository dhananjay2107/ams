'use client'
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import AddBatchModal from './AddBatchModal';
import { FaPlus } from 'react-icons/fa';

const AddBatchButton = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
      <div>
          <Button onPress={onOpen} className='border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<FaPlus />}>Create Batch</Button>
          <AddBatchModal isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    )
}

export default AddBatchButton