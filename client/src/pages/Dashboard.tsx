import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Stream } from '../types/user.type'
import { FormEvent } from 'react'

import StreamTile from '../components/StreamTile'

const Dashboard = () => {
  const { user, isLoading, setIsLoading } = useAuth()

  const [file, setFile] = useState<File | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [uploaded, setUploaded] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minMsPlayed, setMinMsPlayed] = useState<number | null>(null)
  const [maxMsPlayed, setMaxMsPlayed] = useState<number | null>(null)
  const [artistName, setArtistName] = useState<string>('')
  const [trackName, setTrackName] = useState<string>('')
  const [albumName, setAlbumName] = useState<string>('')
  const [page, setPage] = useState<number>(1)

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

      setUploadLoading(true)

      const res = await axios.post('/api/user/streams', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        }
      }) 

      setUploadLoading(false)

      console.log(res)

      if (res.status == 201) {
        console.log('file uploaded')
        setUploaded(true)
        fetchUserStreams(null)
      } else {
        console.log('error uploading file')
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message)
      }
      setUploadLoading(false)
    }
  }

  const fetchUserStreams = async (e: FormEvent | null) => {
    try {
      e?.preventDefault()

      const params = new URLSearchParams()

      if (e) {
        params.append('startDate', startDate ? startDate : new Date('1970-01-01').toISOString())
        params.append('endDate', endDate ? endDate : new Date().toISOString())
        if (minMsPlayed !== null) params.append('minMsPlayed', minMsPlayed.toString())
        if (maxMsPlayed !== null) params.append('maxMsPlayed', maxMsPlayed.toString())
        if (artistName) params.append('artistName', artistName)
        if (trackName) params.append('trackName', trackName)
        if (albumName) params.append('albumName', albumName)
        if (page) params.append('page', page.toString())
      }

      console.log('Fetching user streams with params:', params.toString())

      setIsLoading(true)

      const res = await axios.get('/api/user/streams', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        },
        params
      })

      setIsLoading(false)

      if (res.status == 200) {
        // console.log(res.data)
        setStreams([...res.data])
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message)
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchUserStreams(null)
  }, [user])

  return (
    <div className='outlet-container relative min-h-[85vh]'>
      { user ? (
        <div className='min-h-[85vh] content-container w-full mx-auto flex flex-col gap-4'>
          <div className='inline-flex gap-12 items-center pb-4'>
            <h1 className='text-4xl font-bold font-header uppercase tracking-wider'>Your Dashboard</h1>
            <p className='py-1 px-4 border-2 border-green-600 rounded-lg'>@{ user.username }</p>
            {/* <p>{ user.email }</p> */}
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

          <form onSubmit={handleUploadJSON} className='flex flex-col gap-4'>
              <input type="file" onChange={handleUpdateFile} /> 
              <button type='submit' className='w-36 bg-stone-700 hover:bg-stone-600 transition-all py-1 rounded-sm'>Upload</button>
          </form>
          
          { uploadLoading && (
            <div role="status" className='flex flex-row gap-4'>
              <svg aria-hidden="true" className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className='my-auto'>Uploading file, please do not refresh the page. This may take 3-5 minutes.</span>
            </div>
          )}
          { !uploadLoading && uploaded && (
            <div role="status" className='flex flex-row gap-4'>
              <svg className="w-6 h-6 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
              </svg>
              <span className='my-auto'>File successfully uploaded.</span>
            </div>
          )}
          <div className='flex flex-col'>
            { (streams.length > 0 && !isLoading) ? (
                <>
                  { streams.map((stream: Stream, index: number) => (
                    <StreamTile key={index} stream={stream} />
                  ))}
                </>
            ) : (!isLoading && (
              <div>
                <p>You have no streaming history. Upload a JSON file to visualize your data.</p>
              </div>
            ))}
          </div>
        </div>
      ) : ( !isLoading && (
        <div className='text-2xl tracking-wide font-thin min-h-[80vh] flex flex-col justify-center'>
          <p className='mx-auto my-auto text-center'>
          You must be <Link className='inline-link' to='/login'>logged in</Link> to view this page.
          </p>
        </div>
      ))}
    </div>
  )
}

export default Dashboard