import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useResource } from '../hooks/useAPI'

const Home = () => {
  const { resource, isLoading } = useResource('/api/user/test')

  useEffect(() => {
    console.log('resource', resource)
  }, [resource])

  return (
    <div>
      <Link to='/dashboard'>Dashboard</Link>
    </div>
  )
}

export default Home