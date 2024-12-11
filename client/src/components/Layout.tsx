import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'

const Layout = () => {
  const { darkMode } = useDarkMode()
  const { isLoading } = useAuth()

  return (
    <div className={`layout w-full font-content ${darkMode ? 'dark' : ''} relative min-h-screen`}>
      {isLoading && (<div className="absolute bg-white bg-opacity-20 z-10 h-full w-full flex items-center justify-center">
        <div className="flex items-center">
          <span className="text-3xl mr-4 font-header">Loading</span>
          <svg className="animate-spin h-8 w-8 text-stone-800" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
          </svg>
        </div>
      </div>)}
      <div>

      </div>
      <Navbar />
      <div className='px-8 md:px-24 font-normal flex min-h-[85vh]'>
        <Outlet />
      </div>
    </div>
  )
}

export default Layout