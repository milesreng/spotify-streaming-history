/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, Dispatch, SetStateAction } from 'react'
import { MongoUser } from '../types/user.type'

interface AuthContextType {
  user: MongoUser | null,
  setUser: Dispatch<SetStateAction<MongoUser | null>>,
  fetchUser: () => Promise<void>,
  login: (email: string, password: string) => Promise<void>,
  logout: () => Promise<void>,
  register: (username: string, email: string, firstName: string, password: string) => Promise<void>,
  isLoading: boolean,
  error: string
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  fetchUser: async () => {},
  login: async (email: string, password: string) => {},
  logout: async () => {},
  register: async (username: string, email: string, firstName: string, password: string) => {},
  isLoading: false,
  error: ''
})

export const useAuth = () => useContext(AuthContext)
