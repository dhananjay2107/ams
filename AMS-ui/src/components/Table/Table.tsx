import React from 'react'

interface TableProps<T> {
    columns: { key: string; label: string; className?: string }[];
    data: T[];
    renderRow: (item: T) => React.ReactNode;
}

export default function Table<T>({ columns, data, renderRow }: TableProps<T>) {
    return (
        <table className="w-full mt-4">
            <thead>
                <tr className="text-left text-gray-500 text-sm">
                    {columns.map((col) => (
                        <th key={col.key} className={col.className}>{col.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{data.map((item) => renderRow(item))}</tbody>
        </table>
    )
}
