import { Buffer } from 'buffer'

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`

const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET || ''
const REFRESH_TOKEN = process.env.VITE_SPOTIFY_REFRESH_TOKEN || ''

const getAccessToken = async (client_id: string, client_secret: string, refresh_token: string) => {
  const basic = (Buffer.from(`${client_id}:${client_secret}`)).toString("base64");
  const params = new URLSearchParams()
  params.append('grant_type', "refresh_token")
  params.append('refresh_token', REFRESH_TOKEN)

  const payload = {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: CLIENT_ID
    }),
  }

  const response = await fetch(TOKEN_ENDPOINT, payload)
    
  return await response.json();
}

export const getSpotifyTrack = async (track_id: string) => {
  const { access_token } = await getAccessToken(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)

  return await fetch(`https://api.spotify.com/v1/tracks/${track_id.split(":")[2]}`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
}