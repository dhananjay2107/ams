'use client'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Select, SelectItem, Tooltip, useDisclosure } from '@heroui/react';
import { MdOutlineEdit, MdOutlineRemoveRedEye, MdSearch } from "react-icons/md";
import AddCourseButton from './AddCourseButton';
import { Course } from '@/interfaces/Interfaces';
import EditCourseModal from './EditCourseModal';
import Link from 'next/link';
import AssignCourseModal from './AssignCourseModal';
import FormModal from '../FormModal';

ModuleRegistry.registerModules([AllCommunityModule]);

interface CourseTableProps {
    data: Course[]
}

const CourseTable: React.FC<CourseTableProps> = ({ data}) => {

    const [rowData, setRowData] = useState<Course[]>()
    const [searchContent, setSearchContent] = useState("")
    const [selectedCourse, setSelectedCourse] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [assignModalOpen, setAssignModalOpen] = useState(false)

    const handleEdit = (courseData: any) => {
        setSelectedCourse(courseData);
        onOpen()
    }

    const handleAssign = (courseData: any) => {
        setSelectedCourse(courseData)
        setAssignModalOpen(true)
    }

    const assignButton = (props: any) => {
        return (
            <Tooltip content='Assign' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                <Button variant='solid' size='sm' color='primary' onPress={(e) => handleAssign(props.data)}>Assign</Button>
            </Tooltip>
        )
    }

    const actionButtons = (props: any) => {
        return (
            <div className='p-1 flex gap-1'>
                <Tooltip content='View' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Link className='flex p-2 hover:bg-primary-100 rounded-lg px-5' href={`/admin/course/${props.data._id}`}><MdOutlineRemoveRedEye className='w-5 h-5' /></Link>
                </Tooltip>
                <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Button variant='light' size='sm' color='primary' onPress={(e) => handleEdit(props.data)}><MdOutlineEdit className='w-5 h-5' /></Button>
                </Tooltip>
                <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                    <FormModal table='course' type='delete' id={props.data._id} />
                </Tooltip>
            </div>
        )
    }

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: "course_code", headerName: "Course Code", filter: true },
        { field: "course_name", headerName: "Course Name", filter: true },
        { field: "semester", headerName: "Semester", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "assign", headerName: "Assign to", cellRenderer: assignButton },
        { field: "actions", headerName: "Actions", cellRenderer: actionButtons }
    ])

    useEffect(() => {
        setRowData(data);
    }, [data])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return {
            mode: "multiRow",
            enableClickSelection: true,
        };
    }, []);

    const autoSizeStrategy = useMemo<
        | SizeColumnsToFitGridStrategy
        | SizeColumnsToFitProvidedWidthStrategy
        | SizeColumnsToContentStrategy
    >(() => {
        return {
            type: "fitCellContents",
        };
    }, []);

    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50, 100];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form_data = Object.fromEntries(new FormData(e.currentTarget))
        const operation = parseInt(form_data.operation as string)
        console.log(operation)
        if (operation == 1) {
            console.log("Edit operation to be performed")
        }
        else {
            console.log("Delete operation to be performed")
        }
    }

    return (
        <div className='ag-theme-quartz flex flex-col gap-3' >
            <div className='flex justify-between'>
                <Form onSubmit={handleSubmit}>
                    <div className='flex items-center'>
                        <Select
                            isDisabled={true}
                            className="w-56 p-2"
                            label="Operation"
                            placeholder="Select Operation"
                            variant='bordered'
                            name='operation'
                            size='sm'
                        >
                            <SelectItem key={1}>Bulk Edit</SelectItem>
                            <SelectItem key={2}>Bulk Delete</SelectItem>
                        </Select>
                        <Button type='submit' variant='solid' color='primary'>Go</Button>
                    </div>
                </Form>
                <div className='flex gap-2 items-center p-2'>
                    <Input
                        className='border w-64 rounded-lg'
                        startContent={<MdSearch />}
                        placeholder='Search here...'
                        type='text'
                        isClearable
                        onChange={(e) => setSearchContent(e.target.value)}
                    />
                    <FormModal table='course' type='import'/>
                    <AddCourseButton />
                </div>
            </div>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                quickFilterText={searchContent}
                domLayout='autoHeight'
                pagination={true}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                rowSelection={rowSelection}
                autoSizeStrategy={autoSizeStrategy}
            />

            {selectedCourse && (<EditCourseModal
                isOpen={isOpen}
                onOpenChange={onClose}
                courseData={selectedCourse} />)}

            {selectedCourse && (<AssignCourseModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                data={selectedCourse} />
            )}
        </div>
    )
}

export default CourseTable