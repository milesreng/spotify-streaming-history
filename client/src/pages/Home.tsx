import React, { useEffect } from 'react'
import { useResource } from '../hooks/useAPI'

const Home = () => {
  const { resource, isLoading } = useResource('/api/user/test')

  useEffect(() => {
    console.log('resource', resource)
  }, [resource])

  return (
    <div>
      
    </div>
  )
}

export default Home