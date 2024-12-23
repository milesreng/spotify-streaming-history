import mongoose from 'mongoose'

export interface IStream extends mongoose.Document {
  timestamp: Date,
  platform: string | null,
  ms_played: number,
  conn_country: string | null,
  ip_addr: string | null,
  track_name: string | null,
  album_artist_name: string | null,
  album_name: string | null,
  spotify_track_uri: string | null,
  episode_name: string | null,
  episode_show_name: string | null,
  spotify_episode_uri: string | null,
  reason_start: string | null,
  reason_end: string | null,
  shuffle: boolean,
  skipped: boolean,
  offline: boolean,
  offline_timestamp: string | null,
  incognito_mode: boolean,
  track_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId
}

export const streamSchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    required: true 
  },
  platform: { 
    type: String 
  },
  ms_played: { 
    type: Number, 
    required: true 
  },
  conn_country: { 
    type: String 
  },
  ip_addr: { 
    type: String 
  },
  track_name: { 
    type: String 
  },
  album_artist_name: { 
    type: String 
  },
  album_name: { 
    type: String 
  },
  spotify_track_uri: { 
    type: String 
  },
  episode_name: { 
    type: String 
  },
  episode_show_name: { 
    type: String 
  },
  spotify_episode_uri: { 
    type: String 
  },
  reason_start: { 
    type: String 
  },
  reason_end: { 
    type: String 
  },
  shuffle: { 
    type: Boolean, 
    required: true 
  },
  skipped: { 
    type: Boolean, 
    required: true 
  },
  offline: { 
    type: Boolean, 
    required: true 
  },
  offline_timestamp: { 
    type: String 
  },
  incognito_mode: { 
    type: Boolean, 
    required: true 
  },
  track_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Track',
    required: true
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true })

export const Stream = mongoose.model<IStream>('Stream', streamSchema)