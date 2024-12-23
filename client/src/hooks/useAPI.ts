/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Stream } from '../types/user.type'

const headers = { 'Content-Type': 'application/json',  'Access-Control-Allow-Credentials': true }

export const useResource = (
  resourceUrl: string, 
  body: unknown = undefined) => {
    const [streamingHistory, setStreamingHistory] = useState<Stream[]>([])
    const [resource, setResource] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        const res = await axios.get(resourceUrl, {
          headers
        })

        if (res.status == 200) {
          if (resourceUrl === '/api/user/streaming-history') {
            setStreamingHistory(res.data.streamingHistory)
          } else {
            setResource(res.data)
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err)
        }
      }

      setIsLoading(false)
    }

    useEffect(() => {
      fetchData()
    }, [resourceUrl])

    return { streamingHistory, resource, isLoading, error }
}