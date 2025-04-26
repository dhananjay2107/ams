'use client'
import { Batch, Course, Faculty, Program, Student, User } from '@/interfaces/Interfaces'
import ActionButton from './Buttons/ActionButton'
import { Form, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/react'
import GeneralButton from './Buttons/GeneralButton'
import { deleteBatch, importBatches } from '@/services/api/batch'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { deleteCourse, importCourses } from '@/services/api/course'
import { deleteProgram, importPrograms } from '@/services/api/program'
import { MdOutlineCloudUpload } from 'react-icons/md'
import { importFaculties, importStudents } from '@/services/api/users'

const deleteActionMap = {
    batch: deleteBatch,
    course: deleteCourse,
    program: deleteProgram,
    student: deleteProgram,
    faculty: deleteProgram
}

const importActionMap = {
    student: importStudents,
    faculty: importFaculties,
    course: importCourses,
    program: importPrograms,
    batch: importBatches
}

const FormModal = ({ table, type, data, id }: {
    table: "batch" | "course" | "program" | "student" | "faculty"
    type: "create" | "update" | "delete" | "import" | "view"
    data?: Student | Faculty | Course | Program | Batch | User
    id?: string
}) => {

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const header_name = type === "create" ? `Add New ${table}` : type === "update" ? `Edit ${table}` : type === "delete" ? `Delete ${table}` : type === "import" ? "Select File to import" : ""

    const Forms = () => {

        const [deleteState, deleteAction] = useActionState(deleteActionMap[table], {
            success: false,
            error: false,
            message: ""
        })
        const [importState, importAction] = useActionState(importActionMap[table], {
            success: false,
            error: false,
            message: ""
        })
        const [selectedFile, setSelectedFile] = useState<File | null>(null);

        const router = useRouter()

        useEffect(() => {
            if (deleteState.success) {
                toast.success(deleteState.message)
                onClose()
                router.refresh();
            }
            else if (deleteState.error) {
                toast.error(deleteState.message)
                router.refresh();
            }
        }, [deleteState])

        useEffect(() => {
            if (importState.success) {
                toast.success(importState.message)
                onClose()
                router.refresh();
            }
            else if (importState.error) {
                toast.error(importState.message)
                router.refresh();
            }
        }, [importState])

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                setSelectedFile(file);
            }
        }

        const handleResetImportForm = () => {
            setSelectedFile(null);
            onClose();
        }

        return type === "delete" && id ? (
            <Form action={deleteAction} onReset={onClose}>
                <span>You are about to delete the {table} permanently. <b>Are you sure you want to continue?</b></span>
                <input type='text' name='id' defaultValue={id} hidden />
                <div className='flex w-full justify-between gap-3 p-2'>
                    <GeneralButton name='Cancel' variant='light' type='reset' />
                    <GeneralButton name='Delete' color='danger' variant='solid' type='submit' />
                </div>
            </Form>
        ) : type === "import" ? (
            <Form action={importAction} onReset={handleResetImportForm}>
                <div className="flex flex-col items-center justify-center w-full gap-2">
                    <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <MdOutlineCloudUpload className='h-16 w-16 text-gray-700' />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">csv or xslx</p>
                        </div>
                        <input id="dropzone-file" name="file" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                    <div className='flex w-full justify-between gap-3 p-2'>
                        <GeneralButton name='Cancel' variant='light' type='reset' />
                        <GeneralButton name='Submit' color='primary' variant='solid' type='submit' />
                    </div>
                </div>
            </Form>
        ) : (
            "Create or update form"
        )
    }
    return (
        <>
            <ActionButton type={type} table={table} handlePress={onOpen} />
            <Modal isOpen={isOpen} placement="top-center" size='xl' scrollBehavior='inside' onOpenChange={onOpenChange} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{header_name}</ModalHeader>
                            <ModalBody>
                                <Forms />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default FormModal