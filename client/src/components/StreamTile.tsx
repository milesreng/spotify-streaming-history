import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Stream } from '../types/user.type'

import { useAuth } from '../context/AuthContext'
import { getSpotifyTrack } from '../hooks/SpotifyAPI'

interface Props {
  stream: Stream
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const StreamTile = ({ stream }: Props) => {
  const { setIsLoading }  = useAuth()
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [spotifyURL, setSpotifyURL] = useState<string | null>(null)

  const timeString = new Date(stream.timestamp).toLocaleTimeString()
  const dateString = new Date(stream.timestamp).toLocaleDateString()
  const month = months[new Date(stream.timestamp).getMonth()]

  const fetchSpotifyTrackInfo = async () => {
    try {
      if (stream.spotify_track_uri) {
        console.log("Fetching Spotify track image")

        setIsLoading(true)
        const res = await getSpotifyTrack(stream.spotify_track_uri)
        setIsLoading(false)

        const song = await res.json()
        if (song.album.images.length > 0) {
          setImageURL(song.album.images[0].url)
        }
        setSpotifyURL(song.external_urls.spotify)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error)
      }
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // fetchSpotifyTrackInfo()
  }, [])

  return (
    <Link 
      className='border-b-2 border-stone-700 py-4 flex flex-row gap-4 stream-tile' 
      to={`/track/${stream.track_id}`}>
      {/* <div className='w-24 h-24'>
        { imageURL && (<img className='object-fill' src={imageURL} alt="" />)}
      </div> */}
      <div>
        <p>{ month } { new Date(stream.timestamp).getDate() }, { new Date(stream.timestamp).getFullYear() } at { timeString }</p>
        <p>{ stream.ip_addr }</p>
        <p>{ stream.ms_played } ms played</p>
        { stream.spotify_track_uri && (
          <div>
            <p>{ stream.album_artist_name } - { stream.track_name }</p>
            <p>{ stream.album_name }</p>
          </div>
        )}
      </div>
      
    </Link>
  )
}

export default StreamTile