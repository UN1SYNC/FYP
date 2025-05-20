import Link from 'next/link'
import React from 'react'

interface PageProps {
  params: {
    name: string
  }
}

const Page = ({ params }: PageProps) => {
  const { name } = params
  
  return (
    <div>University details configurations {name} <Link href={`/config/systems`}>Next</Link></div>
  )
}

export default Page