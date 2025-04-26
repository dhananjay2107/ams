'use client'
import { Button } from '@heroui/react'
import { useDisclosure } from '@heroui/react'
import AddStudentModal from './AddStudentModal';
import { FaPlus } from 'react-icons/fa';
const AddStudentButton = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <div>
            <Button onPress={onOpen} className='p-3 border bg-primary hover:bg-secondary rounded-lg text-white duration-300' endContent={<FaPlus />}>Add Student</Button>
            <AddStudentModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
    )
}

export default AddStudentButton