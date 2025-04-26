'use client'
import { Button, Form, Input, Select, SelectItem, Tooltip, useDisclosure } from '@heroui/react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import React, { useEffect, useMemo, useState } from 'react'
import { MdOutlineEdit, MdSearch, MdOutlineRemoveRedEye } from 'react-icons/md'
import { FaRegTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AddStudentButton from './AddStudentButton';
import Link from 'next/link';
import { Student} from '@/interfaces/Interfaces';
import EditStudentModal from './EditStudentModal';
import FormModal from '../FormModal';

ModuleRegistry.registerModules([AllCommunityModule]);

interface StudentTableProps {
    data: Student[]
}

const StudentsTable: React.FC<StudentTableProps> = ({ data }) => {

    const [selectedStudent, setSelectedStudent] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleEdit = (studentData: any) => {
        setSelectedStudent(studentData)
        onOpen()
    }

    const handleDelete = (studentData: any) => {
        toast.error("Delete Clicked")
    }
    const actionButtons = (props: any) => {
        return (
            <div className='p-1 flex gap-1 items-center'>
                <Tooltip content='View' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Link className='flex p-2 hover:bg-primary-100 rounded-lg px-5' href={`/admi/students/${props.data._id}`}><MdOutlineRemoveRedEye className='w-5 h-5' /></Link>
                </Tooltip>
                <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    <Button variant='light' size='sm' color='primary' onPress={(e) => handleEdit(props.data)}><MdOutlineEdit className='w-5 h-5' /></Button>
                </Tooltip>
                <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                    <Button variant='light' size='sm' color='danger' onPress={(e) => handleDelete(props.data)}><FaRegTrashAlt className='w-5 h-5' /></Button>
                </Tooltip>
            </div>
        )
    }

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: "full_name",
            headerName: "Name",
            valueGetter: (params: any) => {
                const firstName = params.data.first_name || '';
                const middleName = params.data.middle_name || '';
                const lastName = params.data.last_name || '';
                return `${firstName} ${middleName} ${lastName}`.trim();
            },
            sort: "asc"
        },
        { field: "email", headerName: "Email", filter: true },
        { field: "phone_no", headerName: "Phone Number", filter: true },
        { field: "batch.batch_name", headerName: "Batch", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "join_date", headerName: "Joining Date", filter: true },
        { field: "adm_year", headerName: "Admission Year", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "actions", headerName: "Actions", cellRenderer: actionButtons }
    ])
    const [searchContent, setSearchContent] = useState<string>("")
    const [rowData, setRowData] = useState<Student[]>([])

    useEffect(() => {
        setRowData(data)
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

    const handleSubmit = () => {

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
                    <FormModal table='student' type='import'/>
                    <AddStudentButton />
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
            {selectedStudent && (<EditStudentModal 
                isOpen={isOpen}
                onOpenChange={onClose}
                studentData={selectedStudent}
            />)}
        </div>
    )
}

export default StudentsTable