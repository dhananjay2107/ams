import BatchTable from '@/components/Batch/BatchTable'
import Card from '@/components/Cards/Card'
import { getBatches } from '@/services/api/batch'
import React from 'react'
import { FaUserGroup } from "react-icons/fa6";

const BatchesPage = async () => {

  const batches = await getBatches()
  return (
    <div className='flex flex-col gap-3 bg-white p-2 rounded-lg'>
      <div className='flex gap-3 items-center p-2'>
        <h2 className='font-bold text-3xl'>Batches</h2>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        <Card icon={<FaUserGroup className='h-6 w-6' />} title="Total Batches" value={batches.length} />
      </div>
      <BatchTable data={batches} />
    </div>
  )
}

export default BatchesPage