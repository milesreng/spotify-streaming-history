import { useState, useEffect, Dispatch, SetStateAction } from 'react'

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar, Rectangle } from 'recharts'
import { SongStats, Track } from '../types/track.type'

type Props = {
  track: Track,
  songStats: Partial<SongStats>,
  streamsByDate: any[],
  imageURL: string | null,
  setActiveStreamDate: Dispatch<SetStateAction<string>>,
  streams: any[]
}

const TrackCharts = ({ track, songStats, imageURL, streams, setActiveStreamDate, streamsByDate }: Props) => {
  const [showBarStreams, setShowBarStreams] = useState(false)

  const handleToggleStreams = () => {
    setShowBarStreams(!showBarStreams)
  }

  const handleClickDate = (data: any, index: number) => {
    console.log(data.timestamp)
    const date = new Date(data.timestamp)
    date.setHours(0, 0, 0, 0)
    setActiveStreamDate(date.toISOString())
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      { streamsByDate && (
        <div className='w-full text-stone-800 md:pr-8 z-0'>
          <ResponsiveContainer width='100%' height={400} className='mx-4 z-0 chart'>  
            <BarChart data={streamsByDate} margin={{ top: 10 }} className='z-10'>
              <CartesianGrid strokeDasharray="3 3" className='z-0' />
              <XAxis dataKey='timestamp' className='pt-2' padding={{ left: 20, right: 20 }} />
              <YAxis />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar type='monotone' dataKey='Times Played' fill='#22c55e' activeBar={<Rectangle fill='#166534' />} onClick={handleClickDate} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div>
        { streams && streams.map((stream: any, idx: number) => {
          const dateString = new Date(stream.timestamp).toLocaleDateString()
          const timeString = new Date(stream.timestamp).toLocaleTimeString()

          const minutes = Math.floor(stream.ms_played / 60000)
          const seconds = ((stream.ms_played % 60000) / 1000).toFixed(0)
          const duration = minutes + ':' + (parseInt(seconds) < 10 ? '0' : '') + seconds
          return ( 
          <div key={idx}>
            { dateString }, { timeString } for { minutes } min { seconds } sec
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrackCharts