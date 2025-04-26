'use client'
import { AgGridReact } from 'ag-grid-react'
import React, { useState } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

const TemporaryTimetableList = () => {
    const [rowData, setRowData] = useState<any[]>([
        { name: "1hr timing", is_default: "True" },
        { name: "45min timing", is_default: "False" },
        { name: "Fridays", is_default: "False" },
    ])

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'name', headerName: 'Name', filter: true, flex: 1 },
        { field: "date", headerName: "Date", filter: true, flex: 1 },
    ])

    return (
        <div style={{ height: 400 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                domLayout='normal'
            />
        </div>
    )
}

export default TemporaryTimetableList