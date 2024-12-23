import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SongStats } from '../types/track.type'
import { getSpotifyTrack } from '../hooks/SpotifyAPI'

interface Props {
  songStats: SongStats,
  idx: number,
  tileSize: number
}

const TrackInfo = ({ songStats, idx, tileSize }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [spotifyURL, setSpotifyURL] = useState<string | null>(null)

  // listenDays: Math.floor(res.data.songStats[0].totalDuration / 86400000),
  const listenHours = Math.floor((songStats.totalDuration) / 3600000)
  const listenMinutes = Math.floor((songStats.totalDuration % 3600000) / 60000)
  const listenSeconds = Math.floor((songStats.totalDuration % 60000) / 1000)
  const totalPlays = songStats.totalPlays

  const fetchSpotifyTrackInfo = async () => {
    if (songStats.trackInfo && songStats.trackInfo.spotify_uri) {

      setIsLoading(true)
      const res = await getSpotifyTrack(songStats.trackInfo.spotify_uri)
      setIsLoading(false)

      if (res.status === 200) {
        const song = await res.json()
        if (song.album.images.length > 0) {
          setImageURL(song.album.images[0].url)
        }
        setSpotifyURL(song.external_urls.spotify)
      } else {
        console.error('Failed to fetch Spotify track info')
      }
    }
  }

  useEffect(() => {
    fetchSpotifyTrackInfo()
  }, [songStats])

  return (
    <Link to={`/track/${songStats.trackInfo ? songStats.trackInfo._id : ''}`} className={`py-4 flex flex-row gap-4 h-fit hover:bg-stone-200 dark:hover:bg-stone-700 transition-all border-b-2 border-b-stone-300 dark:border-b-stone-600 hover:cursor-pointer ${tileSize === 0 ? 'py-1' : (tileSize === 1 ? 'py-2' : 'py-4')}`}>
      {songStats.trackInfo && (
        <>
        <div className={`my-auto font-thin w-8 pl-2 ${tileSize === 0 ? 'text-md' : (tileSize === 1 ? 'text-lg' : 'text-xl')}`}>
          {idx + 1}
        </div>
            <div className={` border-[2px] border-stone-200 dark:border-none ${tileSize === 0 ? 'w-12 h-12' : (tileSize === 1 ? 'w-20 h-20' : 'w-28 h-28')}`}>
            {!isLoading && imageURL && (
              <img src={imageURL} alt='Album cover' />
          )}
            </div>
            <div className={`flex flex-col justify-between ${tileSize === 0 ? 'h-12' : (tileSize === 1 ? 'h-20' : 'h-28')}`}>
              <h1 className={`font-bold font-header uppercase tracking-wide ${tileSize === 0 ? 'text-md' : (tileSize === 1 ? 'text-lg' : 'text-xl')}`}>{songStats.trackInfo.name}</h1>
              { tileSize > 0 && (<p className='text-sm'>{songStats.trackInfo.artist} &mdash; {songStats.trackInfo.album}</p>)}
              <div className={`${tileSize === 0 ? 'text-sm' : (tileSize === 1 ? 'text-md' : 'text-lg')}`}>
                { tileSize > 1 ? (
                  <>
                    <h1>You played this song <span className='font-bold'>{songStats.totalPlays}</span> times</h1>
                    <h1>for a total of {listenHours > 0 && (`${listenHours} hour${listenHours > 1 ? 's' : ''},`)} {listenMinutes} minute{`${listenMinutes != 1 ? 's' : ''}`}, {listenSeconds} second{`${listenSeconds != 1 ? 's' : ''}`}</h1>
                  </>
                ) : (
                  <>
                    <h1><span className='font-bold'>{songStats.totalPlays}</span> plays | {listenHours > 0 && (`${listenHours} hour${listenHours > 1 ? 's' : ''},`)} {listenMinutes} minute{`${listenMinutes != 1 ? 's' : ''}`}, {listenSeconds} second{`${listenSeconds != 1 ? 's' : ''}`}</h1>
                  </>
                )}
              </div>
          </div>
        </>
      )}
    </Link>
  )
}

export default TrackInfo