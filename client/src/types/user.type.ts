export interface MongoUser {
  _id: string,
  username: string,
  email: string,
  password: string | null,
  googleId: string | null,
  firstName: string,
  lastName: string,
  streamingHistory: string[]
}

export interface Stream {
  timestamp: string,
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
  userId: string
}