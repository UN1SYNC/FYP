import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const page = () => {

    const router = useRouter()
    const { name } = router.query
  return (
    <div>University details configurations {name} <Link href={`/config/systems`}>Next</Link></div>
  )
}

export default page