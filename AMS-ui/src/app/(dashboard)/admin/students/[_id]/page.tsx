import React from 'react'

const StudentDetailsPage = async ({ params }: { params: Promise<{ _id: string }> }) => {
    const { _id } = await params
    return (
        <div>{_id}</div>
    )
}

export default StudentDetailsPage