import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'
import { FaSpotify } from 'react-icons/fa'

import Loading from './Loading'

const Layout = () => {
  const { darkMode } = useDarkMode()
  const { isLoading } = useAuth()

  return (
    <div className={`layout w-full font-content ${darkMode ? 'dark' : ''} relative min-h-screen flex flex-col justify-between`}>
      {isLoading && (
        <Loading />
      )}
      <div className='h-16'>
        <Navbar />
      </div>
      <div className='font-normal w-full'>
        <Outlet />
      </div>
      {!isLoading && (
        <div className='w-full py-1 px-4 font-thin text-sm mt-12 flex flex-row justify-between'>
          <p className='flex flex-row gap-2'> <span className='my-auto'><FaSpotify /></span> Spotify</p>
          <p>Miles Eng</p>
        </div>
      )}
    </div>
  )
}

export default Layout