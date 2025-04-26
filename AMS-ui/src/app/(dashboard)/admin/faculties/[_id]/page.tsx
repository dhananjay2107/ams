import React from 'react'

const FacultyDetailsPage = async ({ params }: { params: Promise<{ _id: string }> }) => {
  const { _id } = await params
  return (
    <div>FacultyDetailsPage of {_id}</div>
  )
}

export default FacultyDetailsPage