import { createContext, useContext } from 'react'

export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {}
})

export const useDarkMode = () => useContext(DarkModeContext)