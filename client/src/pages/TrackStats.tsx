import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useParams } from 'react-router'
import { getSpotifyTrack } from '../hooks/SpotifyAPI'
import { FaSpotify } from 'react-icons/fa'

import TrackCharts from '../components/TrackCharts'
import { Stream } from '../types/user.type'
import { Track, SongStats } from '../types/track.type'
import { useAuth } from '../context/AuthContext'

const TrackStats = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setIsLoading } = useAuth()
  const [trackInfo, setTrackInfo] = useState<Track | null>(null)
  const [songStats, setSongStats] = useState<Partial<SongStats> | null>(null)
  const [streams, setStreams] = useState<Stream[] | null>(null)
  const [trackTimestamps, setTrackTimestamps] = useState<string[]>([])
  const [timeDist, setTimeDist] = useState<number | null>(null)

  const [imageURL, setImageURL] = useState<string | null>(null)
  const [spotifyURL, setSpotifyURL] = useState<string | null>(null)
  const [showTrackCharts, setShowTrackCharts] = useState<boolean>(false)

  const [trackError, setTrackError] = useState<string | null>(null)

  const [streamStartFilter, setStreamStartFilter] = useState<string>('')
  const [streamEndFilter, setStreamEndFilter] = useState<string>('')
  const [interval, setInterval] = useState<string>('day')

  const [activeStreamDate, setActiveStreamDate] = useState<string>('')
  const [filteredStreams, setFilteredStreams] = useState<Stream[]>([])

  const [streamsByDate, setStreamsByDate] = useState<Stream[]>([])

  const [trackLength, setTrackLength] = useState<number | null>(null)

  const fetchTrackInfo = async () => {
    try {
      const params = new URLSearchParams()

      params.append('track_id', id as string)

      setIsLoading(true)

      const res = await axios.get('/api/user/track-stats/', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        },
        params
      })
      setIsLoading(false)

      if (res.status === 200) {
        if (res.data.track) {
          setTrackInfo(res.data.track[0])
        }
        if (res.data.songStats) {
          setSongStats(res.data.songStats[0])
          // consider adjusting based on IP address of stream
          const firstListened = new Date(res.data.songStats[0].firstListened as string)
          const lastListened = new Date(res.data.songStats[0].lastListened as string)

          setTrackTimestamps([firstListened.toDateString(), lastListened.toDateString()])

          setSongStats({ 
            ...songStats, 
            // listenDays: Math.floor(res.data.songStats[0].totalDuration / 86400000),
            listenHours: Math.floor((res.data.songStats[0].totalDuration) / 3600000),
            listenMinutes: Math.floor((res.data.songStats[0].totalDuration % 3600000) / 60000),
            listenSeconds: Math.floor((res.data.songStats[0].totalDuration % 60000) / 1000),
            averageDuration: res.data.songStats[0].averageDuration,
            totalSkips: res.data.songStats[0].totalSkips,
            totalPlays: res.data.songStats[0].totalPlays
          })
        }
        if (res.data.streams) {
          setStreams(res.data.streams)
        }
      } else if (res.status === 401) {
        setTrackError('login')
      } else if (res.status === 404) {
        setTrackError('not found')
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message)
        if (e.message === 'Request failed with status code 401') {  
          setTrackError('login')
        } else {
          setTrackError('not found')
        }
      }
      setIsLoading(false)
      navigate('/login')
    }
  }

  const fetchSpotifyTrackInfo = async () => {
    try {
      if (trackInfo && trackInfo.spotify_uri) {
        console.log("Fetching Spotify track image")

        setIsLoading(true)
        const res = await getSpotifyTrack(trackInfo.spotify_uri)
        setIsLoading(false)

        const song = await res.json()
        console.log(song)
        if (song.duration_ms) {
          console.log(song.duration_ms)
          setTrackLength(song.duration_ms)
          console.log(trackInfo)
        }
        if (song.album.images.length > 0) {
          setImageURL(song.album.images[0].url)
        }
        setSpotifyURL(song.external_urls.spotify)
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message)
      }
      setIsLoading(false)
    }
  }

  const handleUpdateStreamFilter = async (e: FormEvent | null) => {
    e?.preventDefault()

    if (!streams) return
    if (!streamStartFilter) setStreamStartFilter(new Date(trackTimestamps[0]).toISOString().split("T")[0])
    if (!streamEndFilter) setStreamEndFilter(new Date(trackTimestamps[1]).toISOString().split("T")[0])

    const byDate: any = []

    if (interval === 'day') {
      const currentDate = new Date(streamStartFilter);
      const endDate = new Date(streamEndFilter);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!byDate.find((entry: any) => entry.timestamp === dateStr)) {
          byDate.push({
            name: trackInfo?.name,
            'Times Played': 0,
            timestamp: dateStr
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (interval === 'week') {
      const currentDate = new Date(streamStartFilter);
      const endDate = new Date(streamEndFilter);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!byDate.find((entry: any) => entry.timestamp === dateStr)) {
          byDate.push({
            name: trackInfo?.name,
            'Times Played': 0,
            timestamp: dateStr
          });
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (interval === 'month') {
      const currentDate = new Date(new Date(streamStartFilter).getFullYear(), new Date(streamStartFilter).getMonth(), 1);
      const endDate = new Date(streamEndFilter);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!byDate.find((entry: any) => entry.timestamp === dateStr)) {
          byDate.push({
            name: trackInfo?.name,
            'Times Played': 0,
            timestamp: dateStr
          });
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      const currentDate = new Date(new Date(streamStartFilter).getFullYear(), 0, 1);
      const endDate = new Date(streamEndFilter);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!byDate.find((entry: any) => entry.timestamp === dateStr)) {
          byDate.push({
            name: trackInfo?.name,
            'Times Played': 0,
            timestamp: dateStr
          });
        }
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    streams.forEach((stream: Stream) => {
      const streamDate = new Date(stream.timestamp).toISOString().split("T")[0];
      for (let i = 0; i < byDate.length; i++) {
        if (i < byDate.length - 1 && 
            new Date(byDate[i].timestamp).getTime() <= new Date(streamDate).getTime() &&
            new Date(streamDate).getTime() < new Date(byDate[i + 1].timestamp).getTime()) {
          byDate[i]['Times Played'] += 1;
          break;
        } else if (i === byDate.length - 1) {
          byDate[i]['Times Played'] += 1;
        }
      }
    });

    byDate.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const totalStreams = byDate.reduce((acc: number, entry: any) => acc + entry['Times Played'], 0)

    if (totalStreams != songStats?.totalPlays) {
      console.error('Total streams do not match')
    }

    setStreamsByDate(byDate)
  }

  useEffect(() => {
    if (!imageURL && songStats) {
      fetchSpotifyTrackInfo()
    }
  }, [songStats])

  useEffect(() => {
    if (streams) {
      handleUpdateStreamFilter(null)
    }
  }, [streams])

  useEffect(() => {
    if (trackTimestamps[1]) {
      setTimeDist(new Date(trackTimestamps[1]).getTime() - new Date(trackTimestamps[0]).getTime())
    }
  }, [trackTimestamps])

  useEffect(() => {
    if (activeStreamDate && streams) {
      const intervalEndDate = new Date(activeStreamDate);
      if (interval === 'day') {
        intervalEndDate.setDate(intervalEndDate.getDate() + 1);
      } else if (interval === 'week') {
        intervalEndDate.setDate(intervalEndDate.getDate() + 7);
      } else if (interval === 'month') {
        intervalEndDate.setMonth(intervalEndDate.getMonth() + 1);
      } else if (interval === 'year') {
        intervalEndDate.setFullYear(intervalEndDate.getFullYear() + 1);
      }

      const streamsOnDate = streams.filter(
        (stream) =>
          new Date(stream.timestamp).getTime() >= new Date(activeStreamDate).getTime() &&
          new Date(stream.timestamp).getTime() < intervalEndDate.getTime() 
      );
      setFilteredStreams(streamsOnDate)
    }
  }, [activeStreamDate, streams, interval])

  useEffect(() => {
    fetchTrackInfo()
  }, [])

  return (
    <div className='outlet-container relative'>
      { trackInfo ? ( showTrackCharts && songStats && trackInfo && streamsByDate ? (
        <div className='flex flex-row w-full content-container'>
          <div className='arrow-button' onClick={() => { setShowTrackCharts(false) }}>
            <p className='my-auto'>&larr;</p>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <div className='flex flex-row px-4 py-2 min-w-[40vh] w-fit max-w-2/3 justify-center mt-4 rounded-xl bg-stone-200 dark:bg-stone-900 h-28 mx-auto'>
              <div className='my-auto basis-1/3'>
                { imageURL && (
                  <img src={imageURL} className='w-20 h-20 aspect-square mx-auto my-auto object-fill' alt="" />
                )}
              </div>
              <div className='my-auto basis-2/3 pl-4 font-content min-w-[15vh]'>
                <h1 className='text-xl uppercase tracking-wide truncate'>{trackInfo.name}</h1>
                <h3>{trackInfo.artist}</h3>
              </div>
            </div>
            <div className='flex mx-auto'>
              <div className={`interval-btn interval-btn-start ${interval === 'day' ? 'active-interval-btn' : ''}`}
                onClick={() => { setInterval("day") }}>
                Day
              </div>
              <div className={`interval-btn  ${interval === 'week' ? 'active-interval-btn' : ''}`}
                onClick={() => { setInterval("week") }}>
                Week
              </div>
              <div className={`interval-btn  ${interval === 'month' ? 'active-interval-btn' : ''}`}
                onClick={() => { setInterval("month") }}>
                Month
              </div>
              <div className={`interval-btn interval-btn-end  ${interval === 'year' ? 'active-interval-btn' : ''}`}
                onClick={() => { setInterval("year") }}>
                Year
              </div>
            </div>
            <div className='mx-auto w-full mt-4'>
              <form onSubmit={handleUpdateStreamFilter} className='flex flex-row mx-auto my-auto justify-between md:px-12 align-bottom'>
                <div className="form-input-group group basis-5/12 pr-12">
                  <input 
                    type="date" 
                    name="floating_start_filter" 
                    id="floating_start_filter" 
                    className="form-input peer text-2xl chart-input" 
                    placeholder=" " 
                    value={streamStartFilter} 
                    onChange={(e) => setStreamStartFilter(e.target.value)} />
                  <label htmlFor="floating_start_filter" className="form-input-label peer">Start date</label>
                </div>
                <div className="form-input-group group basis-5/12 pr-12">
                  <input 
                    type="date" 
                    name="floating_end_filter" 
                    id="floating_end_filter" 
                    className="form-input peer  chart-input" 
                    placeholder=" " 
                    value={streamEndFilter} 
                    onChange={(e) => setStreamEndFilter(e.target.value)} />
                  <label htmlFor="floating_end_filter" className="form-input-label peer">End date</label>
                </div>
                  {/* <Select 
                    options={intervalOptions} 
                    className='form-input peer react-select-container chart-input form-input'
                    classNamePrefix='react-select' /> */}
                <button type='submit' className='bg-green-500 hover:bg-green-600 transition=all px-4 rounded-lg my-auto w-20 py-1'>&rarr;</button>
              </form>
            </div>
            <div className='w-full'>
              <TrackCharts songStats={songStats} track={trackInfo} streamsByDate={streamsByDate} imageURL={imageURL} streams={filteredStreams} setActiveStreamDate={setActiveStreamDate} />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-row w-full justify-between content-container h-[80vh]'>
          <div className='h-fit flex flex-col gap-4'>
          { trackInfo && (
            <div className='font-header'>
              <h1 className='text-3xl'>{trackInfo.name}</h1>
              <h3 className='text-xl'>{trackInfo.artist} &mdash; {trackInfo.album}</h3>
              <div className='w-72 mt-4'>
                { imageURL && (<img src={imageURL} alt="" />)}
                { spotifyURL && (<a href={spotifyURL} className='underline flex flex-row gap-2 pt-1'><FaSpotify className='my-auto' />View on Spotify</a>)}
              </div>
            </div>
          )}
          { songStats && (
            <div className='pt-4 w-full'>
              <p>
                <span className='text-green-400 text-6xl font-bold pr-2'>{songStats.totalPlays}</span> 
                <span>total streams</span>
                { trackTimestamps.length > 1 && (<span> between { trackTimestamps[0].split(",")[0] } and { trackTimestamps[1].split(",")[0] } </span>)}
              </p>
              <div className='py-4'>
                <p>Total Listening Time:</p>
                <div className='flex flex-row gap-8 align-bottom relative py-2'>
                  <p className='text-4xl'>
                  {/* { songStats.listenDays !== undefined && songStats.listenDays > 0 && (
                    <p className='text-green-400 text-4xl font-bold'>{songStats.listenDays} day{ songStats.listenDays == 1 ? '' : 's'}</p>
                  )} */}
                  { songStats.listenHours !== undefined && songStats.listenHours > 0 && (
                    <span className='pr-4 text-white'>{songStats.listenHours} hour{ songStats.listenHours == 1 ? '' : 's'}</span>
    
                  )}
                  { songStats.listenMinutes !== undefined && songStats.listenMinutes > 0 && (
                    <span className='text-white pr-4'>{songStats.listenMinutes} minute{ songStats.listenMinutes == 1 ? '' : 's'}</span>
                  )}
                  { songStats.listenSeconds !== undefined && songStats.listenSeconds > 0 && (
                    <span className='text-white pr-4'>{songStats.listenSeconds} second{ songStats.listenSeconds == 1 ? '' : 's'}</span>
                  )}
                  </p>
                </div>
              </div>
              {songStats.totalSkips && songStats.totalPlays && songStats.averageDuration && trackLength && (
                <div>
                  <p>
                    You skip this song { ((songStats.totalSkips * 100 / songStats.totalPlays).toFixed(2)) }% of the time
                  </p>
                  <p>
                    On average, you listen to { Math.floor(songStats.averageDuration % 360000 / 60000) } minutes and { Math.floor(songStats.averageDuration % 60000 / 1000) } seconds ({ ((songStats.averageDuration / trackLength) * 100).toFixed(2)}%) of this song 
                  </p>
                  <p>
                    You listen to this song all the way through { streams?.filter(stream => stream.ms_played === trackLength).length } times
                  </p>
              </div>)}
          </div>
      )}
        </div>
        <div onClick={() => { setShowTrackCharts(true)}} className='arrow-button'>
          <p className='my-auto'>&rarr;</p>
        </div>
        </div>
      )) : (
        <div>
          { trackError === 'login' && (
            <span>You must be <Link className='inline-link' to ='/login'>logged in</Link> to view this page.</span>
          )}
        </div>
      )}
    </div>
  )
}

export default TrackStats