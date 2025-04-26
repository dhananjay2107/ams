'use client'
import { Button, Input, Tooltip, useDisclosure } from '@heroui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { MdOutlineEdit, MdSearch } from 'react-icons/md'
import AddProgramButton from './AddProgramButton'
import { Program } from '@/interfaces/Interfaces';
import EditProgramModal from './EditProgramModal';
import FormModal from '../FormModal';

ModuleRegistry.registerModules([AllCommunityModule]);

interface ProgramsTableProps {
  data: Program[]
}

const ProgramsTable: React.FC<ProgramsTableProps> = ({ data }) => {

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchContent, setSearchContent] = useState("")
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleEdit = (programData: any) => {
    setSelectedProgram(programData)
    onOpen()
  }

  const actionButtons = (props: any) => {
    return (
      <div className='p-1 flex gap-1'>
        <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
          <Button variant='light' size='sm' color='primary' onPress={(e) => handleEdit(props.data)}><MdOutlineEdit className='w-5 h-5' /></Button>
        </Tooltip>
        <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
          <FormModal table='program' type='delete' id={props.data._id} />
        </Tooltip>
      </div>
    )
  }

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { field: 'program_name', headerName: 'Program', filter: true, flex: 1 },
    { field: "actions", headerName: "Actions", cellRenderer: actionButtons }
  ])

  const [rowData, setRowData] = useState<Program[]>()
  useEffect(() => {
    setRowData(data)
  }, [data])

  const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
    return {
      mode: "multiRow",
      enableClickSelection: true,
    };
  }, []);

  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 20, 50, 100];

  return (
    <div className='ag-theme-quartz flex flex-col gap-3' >
      <div className='flex justify-between'>
        <Input
          className='border max-w-[44%] rounded-lg'
          startContent={<MdSearch />}
          placeholder='Search here...'
          type='text'
          isClearable
          onChange={(e) => setSearchContent(e.target.value)}
        />
        <FormModal table='program' type='import'/>
        <AddProgramButton />
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
      />
      {selectedProgram && (<EditProgramModal
        isOpen={isOpen}
        onOpenChange={onClose}
        programData={selectedProgram} />)}

    </div>
  )
}

export default ProgramsTable