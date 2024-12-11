import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { DarkModeProvider } from './context/DarkModeProvider'

import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

import Login from './pages/Login'
import Register from './pages/Register'

const router = createBrowserRouter(createRoutesFromElements([
  <Route path='/' element={<Layout />}>
    <Route path='/' element={<Home />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/dashboard' element={<Dashboard />} />
  </Route>
]))

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <RouterProvider router={router} />
      </DarkModeProvider>
    </AuthProvider>
  )
}

export default App
