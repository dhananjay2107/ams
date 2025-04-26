'use client'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ColDef, ModuleRegistry, RowSelectionOptions, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy } from 'ag-grid-community';
import React, { useEffect, useMemo, useState } from 'react'

type GridComponentProps<T> = {
    data: T[]
    columns: ColDef[]
    search?: string
}

ModuleRegistry.registerModules([AllCommunityModule]);

const GridComponent = <T,>({ data, columns, search }: GridComponentProps<T>) => {

    const [rowData, setRowData] = useState<T[]>([])
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([])
    const [searchContent, setSearchContent] = useState<string>("")

    useEffect(() => {
        if (data && columns) {
            setRowData(data)
            setColumnDefs(columns)
        }
    }, [data, columns])

    useEffect(()=>{
        if(search){
            setSearchContent(search)
        }
    },[search])

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
        <div className='ag-theme-quartz flex flex-col gap-3'>
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

export default GridComponent