'use client'
import { Batch } from '@/interfaces/Interfaces'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Select, SelectItem, Tooltip } from '@heroui/react';
import { MdOutlineEdit, MdSearch } from 'react-icons/md';
import AddBatchButton from './AddBatchButton';
import FormModal from '../FormModal';

ModuleRegistry.registerModules([AllCommunityModule]);

interface BatchTableProps {
    data: Batch[]
}
const BatchTable: React.FC<BatchTableProps> = ({ data }) => {

    const [rowData, setRowData] = useState<Batch[]>()
    const [searchContent, setSearchContent] = useState("")

    const handleEdit = (batchData: Batch) => {

    }

    const customButtons = (props: any) => {
        return (
            <div className='p-1 flex gap-1'>
                <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
                    {/* <Button variant='light' size='sm' color='primary' onPress={(e) => handleEdit(props.data)}><MdOutlineEdit className='w-5 h-5' /></Button> */}
                    <Button variant='light' size='sm' color='primary' onPress={(e) => handleEdit(props.data)} endContent={<MdOutlineEdit className='w-5 h-5' />} />
                </Tooltip>
                <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
                    <FormModal table='batch' type='delete' id={props.data._id} />
                </Tooltip>
            </div>
        )
    }

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: "batch_name", headerName: "Batch Name", filter: true },
        {
            field: "full_name",
            headerName: "Faculty In Charge",
            valueGetter: (params: any) => {
                const firstName = params.data.faculty.first_name || '';
                const middleName = params.data.faculty.middle_name || '';
                const lastName = params.data.faculty.last_name || '';
                return `${firstName} ${middleName} ${lastName}`.trim();
            },
            sort: "asc"
        },
        { field: "semester", headerName: "Semester", filter: true },
        { field: "program.program_name", headerName: "Program", filter: true },
        { field: "start_date", headerName: "Start Date", filter: true },
        { field: "end_date", headerName: "End Date", filter: true },
        { field: "status", headerName: "Status", filter: true },
        { field: "actions", headerName: "Actions", cellRenderer: customButtons }
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
                    <AddBatchButton />
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
        </div>
    )
}

export default BatchTable