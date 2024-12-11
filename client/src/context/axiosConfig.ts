import { ReactNode } from 'react'

const headers = { 
  'Content-Type': 'application/json',  
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': 'http://localhost:5173'

}

export const axiosConfig = {
  headers,
  withCredentials: true 
}

export interface AuthProps {
  children?: ReactNode
}