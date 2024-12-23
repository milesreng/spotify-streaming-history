export interface Track {
  _id: string,
  name: string,
  artist: string,
  album: string,
  year: number | null,
  length: number | null,
  genre: string | null,
  image_url: string | null,
  spotify_uri: string | null,
}

export interface SongStats {
  totalPlays: number,
  totalSkips: number,
  totalDuration: number,
  averageDuration: number,
  firstListened: Date,
  lastListened: Date,
  listenDays: number,
  listenHours: number,
  listenMinutes: number,
  listenSeconds: number,
  trackInfo: Track | null
}