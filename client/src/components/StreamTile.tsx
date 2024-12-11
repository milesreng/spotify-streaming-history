import React from 'react'
import { Stream } from '../types/user.type'

interface Props {
  stream: Stream
}

const StreamTile = ({ stream }: Props) => {
  return (
    <div className='border-b-2 border-stone-700 py-4'>
      <p>{ stream.timestamp }</p>
      <p>{ stream.ip_addr }</p>
      <p>{ stream.ms_played } ms played</p>
      { stream.spotify_track_uri && (
        <div>
          <p>{ stream.album_artist_name } - { stream.track_name }</p>
          <p>{ stream.album_name }</p>
        </div>
      )}
    </div>
  )
}

export default StreamTile