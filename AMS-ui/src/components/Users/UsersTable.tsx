'use client'
import { Button, Input, Tooltip } from '@heroui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { MdOutlineEdit, MdSearch } from 'react-icons/md'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import { FaRegTrashAlt } from 'react-icons/fa'
import AddUserButton from './AddUserButton'
import { User } from '@/interfaces/Interfaces'

ModuleRegistry.registerModules([AllCommunityModule]);

interface UserTableProps {
  data: User[]
}

const UsersTable: React.FC<UserTableProps> = ({ data }) => {

  const customButtons = (props: any) => {
    const handleEdit = () => {

    }
    const handleDelete = () => {

    }
    return (
      <div className='p-1 flex gap-1'>
        <Tooltip content='Edit' showArrow={true} color='primary' delay={1000} closeDelay={100} offset={-2}>
          <Button variant='light' size='sm' color='primary' onPress={handleEdit}><MdOutlineEdit className='w-5 h-5' /></Button>
        </Tooltip>
        <Tooltip content='Delete' showArrow={true} color='danger' delay={1000} closeDelay={100} offset={-2}>
          <Button variant='light' size='sm' color='danger' onPress={handleDelete}><FaRegTrashAlt className='w-5 h-5' /></Button>
        </Tooltip>
      </div>
    )
  }

  const [searchContent, setSearchContent] = useState("")
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
    { field: "role", headerName: "Role", filter: true },
    { field: "status", headerName: "Status", filter: true },
    { field: "actions", headerName: "Actions", cellRenderer: customButtons }
  ])
  const [rowData, setRowData] = useState<User[]>([])
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

  return (
    <div className='ag-theme-quartz flex flex-col gap-3' >
      <div className='flex justify-between'>
        <div className='flex gap-2 items-center p-2'>
          <Input
            className='border w-64 rounded-lg'
            startContent={<MdSearch />}
            placeholder='Search here...'
            type='text'
            isClearable
            onChange={(e) => setSearchContent(e.target.value)}
          />
          <AddUserButton />
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

export default UsersTable