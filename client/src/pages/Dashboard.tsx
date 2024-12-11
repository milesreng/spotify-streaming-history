import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Stream } from '../types/user.type'
import { FormEvent } from 'react'

import StreamTile from '../components/StreamTile'

const Dashboard = () => {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [streamLoading, setStreamLoading] = useState(false)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minMsPlayed, setMinMsPlayed] = useState<number | null>(null)
  const [maxMsPlayed, setMaxMsPlayed] = useState<number | null>(null)
  const [artistName, setArtistName] = useState<string>('')
  const [trackName, setTrackName] = useState<string>('')
  const [albumName, setAlbumName] = useState<string>('')

  const handleUpdateFile = (e: FormEvent) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
      console.log(target.files)
      setFile(target.files[0])
    }
  }

  const handleUploadJSON = async (e: FormEvent) => {
    e.preventDefault()

    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log(formData)
      const res = await axios.post('/api/user/streams', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        }
      }) 

      console.log(res)

      if (res.status == 200) {
        console.log('file uploaded')
        fetchUserStreams(null)
      } else {
        console.log('error uploading file')
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  const fetchUserStreams = async (e: FormEvent | null) => {
    try {
      e?.preventDefault()

      setStreamLoading(true)
      const params = new URLSearchParams()

      if (e) {
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (minMsPlayed !== null) params.append('minMsPlayed', minMsPlayed.toString())
        if (maxMsPlayed !== null) params.append('maxMsPlayed', maxMsPlayed.toString())
        if (artistName) params.append('artistName', artistName)
        if (trackName) params.append('trackName', trackName)
        if (albumName) params.append('albumName', albumName)
      }

      console.log(params)

      const res = await axios.get('/api/user/streams', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        },
        params
      })

      setStreamLoading(false)

      if (res.status == 200) {
        console.log(res.data)
        setStreams([...res.data].slice(0, 10))
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  useEffect(() => {
    fetchUserStreams(null)
  }, [user])

  return (
    <div className='w-full h-full relative pb-12'>
      { user ? (
        <div className='min-h-[70vh] w-11/12 md:w-5/6 xl:w-2/3 mx-auto pt-12 flex flex-col gap-4'>
          <h1 className='text-4xl font-bold font-header uppercase tracking-wider'>Dashboard</h1>
          <div>
            <p>{ user.username }</p>
            <p>{ user.email }</p>
          </div>
          <form className='w-2/3 flex flex-wrap' onSubmit={fetchUserStreams}>
            <div className="form-input-group group basis-1/2 pr-12">
              <input 
                type="date" 
                name="floating_startdate" 
                id="floating_startdate" 
                className="form-input peer" 
                placeholder=" " 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} />
              <label htmlFor="floating_startdate" className="form-input-label peer">Start date</label>
            </div>
            <div className="form-input-group group basis-1/2">
              <input 
                type="date" 
                name="floating_enddate" 
                id="floating_enddate" 
                className="form-input peer" 
                placeholder=" " 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} />
              <label htmlFor="floating_enddate" className="form-input-label peer">End date</label>
            </div>
            <div className="form-input-group group basis-1/2 pr-12">
              <input 
                type="text" 
                name="floating_artist" 
                id="floating_artist" 
                className="form-input peer" 
                placeholder=" " 
                value={artistName} 
                onChange={(e) => setArtistName(e.target.value)} />
              <label htmlFor="floating_artist" className="form-input-label peer">Artist name</label>
            </div>
            <div className="form-input-group group basis-1/2">
              <input 
                type="text" 
                name="floating_track" 
                id="floating_track" 
                className="form-input peer" 
                placeholder=" " 
                value={trackName} 
                onChange={(e) => setTrackName(e.target.value)} />
              <label htmlFor="floating_track" className="form-input-label peer">Track name</label>
            </div>
            <div className="form-input-group group basis-3/4 pr-12">
              <input 
                type="text" 
                name="floating_album" 
                id="floating_album" 
                className="form-input peer" 
                placeholder=" " 
                value={albumName} 
                onChange={(e) => setAlbumName(e.target.value)} />
              <label htmlFor="floating_album" className="form-input-label peer">Album name</label>
            </div>
            <button type="submit" className='basis-1/4 bg-green-500 hover:bg-green-400 transition-all hover:cursor-pointer h-[2rem] mt-2 rounded-lg'>Search</button>
          </form>
          <div>
            { streams.length > 0 ? (
                <div>
                  { streams.map((stream: Stream, index: number) => (
                    <StreamTile key={index} stream={stream} />
                  ))}
                </div>
            ) : (
              <div>
                <p>You have no streaming history. Upload a JSON file to visualize your data.</p>
              </div>
            )}
          </div>
          <form onSubmit={handleUploadJSON} className='flex flex-col gap-4'>
              <input type="file" onChange={handleUpdateFile} /> 
              <button type='submit' className='w-36 bg-stone-700 hover:bg-stone-600 transition-all py-1 rounded-sm'>Upload</button>
            </form>
        </div>
      ) : (
        <div className='text-2xl tracking-wide font-thin min-h-[80vh] flex flex-col justify-center'>
          <p className='mx-auto my-auto text-center'>
          You must be <Link className='text-green-400 underline hover:text-green-500 transition-all' to='/login'>logged in</Link> to view this page.
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard