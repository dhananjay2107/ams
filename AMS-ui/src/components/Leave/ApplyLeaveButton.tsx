'use client'
import { Button, useDisclosure } from '@heroui/react';
import React from 'react'
import ApplyLeaveModal from './ApplyLeaveModal';
import { useUser } from '@/hooks/useUser';

const ApplyLeaveButton = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const user = useUser()

    return (
        <div>
            <Button onPress={onOpen} className='border bg-primary hover:bg-secondary rounded-lg text-white duration-300'>Apply Leave</Button>
            <ApplyLeaveModal isOpen={isOpen} onOpenChange={onOpenChange} user={user}/>
        </div>
    )
}

export default ApplyLeaveButton