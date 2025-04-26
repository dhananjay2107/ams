'use client'
import { AgGridReact } from 'ag-grid-react'
import React, { useState } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const PermanentTimetableList = () => {
    const [rowData, setRowData] = useState<any[]>([
        { name: "2023-A-Sem-1", batch_name: "2023-A"},
        { name: "2023-B-Sem-1", batch_name: "2023-B" },
        { name: "2024-A-Sem-1", batch_name: "2024-A" },
        { name: "2024-B-Sem-1", batch_name: "2024-B" },
    ])

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'name', headerName: 'Name', filter: true, flex: 1 },
        { field: 'batch_name', headerName: 'Batch', filter: true, flex: 1 },
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

export default PermanentTimetableList