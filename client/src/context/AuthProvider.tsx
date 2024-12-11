import { useState, useEffect } from 'react'
import axios from 'axios'
import { axiosConfig, AuthProps } from './axiosConfig'
import { AuthContext } from './AuthContext'

import { MongoUser } from '../types/user.type'

export const AuthProvider = ({ children }: AuthProps) => {

  const [user, setUser] = useState<Partial<MongoUser> | null>(null)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    
    console.log('logging in')
    
    setIsLoading(true)

    try {
      const res = await axios.post('/api/auth/login', {
        email, password
      }, {
        headers: {
          'Content-Type': 'application/json',  
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        }, 
      })

      console.log(res.data)

      if (res.status == 200) {
        const body = res.data

        setUser({...body})

      } 
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error)
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  const register = async (username: string, email: string, firstName: string, password: string) => {
    setIsLoading(true)

    try {
      const res = await axios.post('/api/auth/register', { username, email, firstName, password })

      if (res.status == 200) {
        const body = res.data
        console.log(body)
        console.log('user successfully registered')
      } 
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }

    setIsLoading(false)
  } 

  const fetchUser = async () => {
    if (user) return

    setIsLoading(true)

    try {

      const res = await fetch('/api/user', {
        credentials: 'include'
      })
        
      if (res.ok) {
        const body = await res.json()

        console.log('fetch user', body)
        setUser(body)
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    
    try {
      const res = await axios.post('/api/auth/logout', axiosConfig)
      setUser(null)

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  const context = { user, setUser, fetchUser, login, logout, register, isLoading, error }

  useEffect(() => {
    if (!user) fetchUser()
  }, [user])

  return (
    <AuthContext.Provider value={ context }>
      { children }
    </AuthContext.Provider>
  )
}