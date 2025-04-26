'use client'
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import { MdImportExport } from 'react-icons/md';
import ImportUserModal from './ImportUsersModal';

const ImportUserButton = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <div>
        <Button onPress={onOpen} className='p-3 border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<MdImportExport />}>Import</Button>
        <ImportUserModal isOpen={isOpen} onOpenChange={onOpenChange}/>
    </div>
    
  )
}

export default ImportUserButton