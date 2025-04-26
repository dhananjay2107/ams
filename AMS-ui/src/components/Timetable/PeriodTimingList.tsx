'use client'
import { AgGridReact } from 'ag-grid-react'
import React, { useState } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const PeriodTimingList = () => {

    const [rowData, setRowData] = useState<any[]>([
        { timing_name: "1hr timing" },
        { timing_name: "45min timing" },
        { timing_name: "Fridays" },
    ])

    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { field: 'timing_name', headerName: 'Name', filter: true, flex: 1 },
        { field: 'is_default', headerName: 'Default', filter: true, flex: 1 },
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

export default PeriodTimingList