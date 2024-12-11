import { useState, useEffect, ReactNode } from 'react'
import { DarkModeContext } from './DarkModeContext'

interface Props {
  children: ReactNode
}
export const DarkModeProvider = ({ children }: Props) => {
  const [darkMode, setDarkMode] = useState(false)
  
  const toggleDarkMode = () => {
    localStorage.setItem('DARK_MODE', (!darkMode).toString())
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    const savedMode = localStorage.getItem('DARK_MODE')
    if (savedMode) {
      setDarkMode(true)
    } else {
      localStorage.setItem('DARK_MODE', (false).toString())
    }
  }, [])
  
  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      { children }
    </DarkModeContext.Provider>
  )
}