import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { useResource } from '../hooks/useAPI'
import { SongStats } from '../types/track.type'
import { useAuth } from '../context/AuthContext'

import { MdDensitySmall, MdDensityMedium, MdDensityLarge } from 'react-icons/md'

import TrackInfo from '../components/TrackInfo'

const TopTracks = () => {
  const { setIsLoading } = useAuth()

  const [topTracks, setTopTracks] = useState<SongStats[]>([])
  const [sortBy, setSortBy] = useState<string>('totalPlays')
  const [tileSize, setTileSize] = useState<number>(1)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minMsPlayed, setMinMsPlayed] = useState<number | null>(null)
  const [maxMsPlayed, setMaxMsPlayed] = useState<number | null>(null)
  const [artistName, setArtistName] = useState<string>('')
  const [trackName, setTrackName] = useState<string>('')
  const [albumName, setAlbumName] = useState<string>('')
  const [topX, setTopX] = useState<number>()

  const fetchTopTracks = async (e: FormEvent | null) => {
    try {
      e?.preventDefault()

      const params = new URLSearchParams()

      params.append('sort_by', sortBy as string)

      if (e) {
        params.append('startDate', startDate ? startDate : new Date('1970-01-01').toISOString())
        params.append('endDate', endDate ? endDate : new Date().toISOString())
        if (minMsPlayed !== null) params.append('minMsPlayed', minMsPlayed.toString())
        if (maxMsPlayed !== null) params.append('maxMsPlayed', maxMsPlayed.toString())
        if (artistName) params.append('artistName', artistName)
        if (trackName) params.append('trackName', trackName)
        if (albumName) params.append('albumName', albumName)
        if (topX) {
          params.append('limit', topX.toString())
          console.log(topX)
        } else {
          params.append('limit', '10')
          console.log(10)
        }
      }

      setIsLoading(true)
      const res = await axios.get('/api/streaming/top-tracks', {
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        },
        params
      })
      setIsLoading(false)
  
      if (res.status === 200) {
        setTopTracks(res.data)
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  const toggleSortBy = () => {
    if (sortBy === 'totalPlays') {
      setSortBy('totalDuration')
    } else {
      setSortBy('totalPlays')
    }
  }

  useEffect(() => {
    fetchTopTracks(null)
  }, [])

  return (
    <div className='relative w-full content-container'>
      <h1 className='text-4xl font-bold py-4'>Your Top Tracks</h1>
      <div className='flex flex-col gap-8'>
        <label className="inline-flex items-center cursor-pointer">
          <span className="me-3 text-sm text-gray-900 dark:text-gray-300">total plays</span>
          <input type="checkbox" checked={sortBy !== 'totalPlays'} onChange={toggleSortBy} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-700 rounded-full peer dark:bg-stone-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-blue-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-green-600 peer-checked:bg-green-600"></div>
          <span className="ms-3 text-sm text-gray-900 dark:text-gray-300">total duration</span>
        </label>
        <form className='w-2/3 flex flex-wrap' onSubmit={fetchTopTracks}>
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
          <div className="form-input-group group basis-1/2 pr-12">
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
          <div className="form-input-group group basis-1/4 pr-12">
            <input 
              type="number" 
              name="floating_limit" 
              id="floating_limit" 
              className="form-input peer" 
              placeholder=" " 
              value={topX} 
              onChange={(e) => setTopX(e.target.value as unknown as number)} />
            <label htmlFor="floating_limit" className="form-input-label peer">Limit</label>
          </div>
          <button type="submit" className='basis-1/4 bg-green-500 hover:bg-green-400 transition-all hover:cursor-pointer h-[2rem] mt-2 rounded-lg'>Search</button>
        </form>
      </div>
      <div className='flex flex-row gap-8 pb-4'>
        <div className='tile-size-btn' onClick={() => {setTileSize(0)}}>
          <MdDensitySmall />
        </div>
        <div className='tile-size-btn' onClick={() => {setTileSize(1)}}>
          <MdDensityMedium />
        </div>
        <div className='tile-size-btn' onClick={() => {setTileSize(2)}}>
          <MdDensityLarge />
        </div>
      </div>
      <div className='flex flex-col min-h-[50vh]'>
        { topTracks ? topTracks.map((track: SongStats, idx: number) => (
          <TrackInfo songStats={track} key={idx} idx={idx} tileSize={tileSize} />
        )) : (
          <p>No tracks found</p>
        ) }
      </div>
    </div>
  )
}

export default TopTracks