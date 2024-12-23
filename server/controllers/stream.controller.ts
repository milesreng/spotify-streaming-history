import { Request, Response } from 'express'
import mongoose from 'mongoose'
import fs from 'fs'

import { ObjectId } from 'mongodb'
import { MongoUser } from '../models/user.model'
import { ITrack, Track } from '../models/track.model'
import { IStream, Stream } from '../models/stream.model'
import { logger } from '..'

export const streamController = {
  getAllStreams: async (req: Request, res: Response) => {
    try {
      const streams = await Stream.find({ user_id: (req.user as MongoUser)._id })
      res.status(200).json(streams)
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  getTrackStats: async (req: Request, res: Response) => {
    try {
      const uid = new mongoose.Types.ObjectId((req.user as MongoUser)._id)

      const trackid = new ObjectId(req.query.track_id as string)

      logger.log('info', 'Getting track stats for ' + trackid)

      const track = await Track.find({ _id: trackid })
      const streams = await Stream.aggregate([
        { $match: { 
          user_id: uid, 
          track_id: trackid,
          // ms_played: { $gte: 5000 }
        } }
      ])

      console.log(track)
      console.log(streams)

      const songStats = await Stream.aggregate([
        { 
          $match: { 
            user_id: uid, 
            track_id: trackid,
            // ms_played: { $gte: 5000 }
          } 
        },
        {
          $group: {
            _id: null,
            totalPlays: { $sum: 1 },
            totalSkips: { $sum: { $cond: { if: { $eq: ['$skipped', true] }, then: 1, else: 0 } } },
            totalDuration: { $sum: '$ms_played' },
            averageDuration: { $avg: '$ms_played' },
            firstListened: { $min: '$timestamp' },
            lastListened: { $max: '$timestamp' }
          }
        },
      ])

      if (!songStats || songStats.length == 0) {
        res.status(404).json({ message: 'No stats found' })
        return
      }

      res.status(200).json({ track, songStats, streams })

    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  getTopTracks: async (req: Request, res: Response) => {
    try {
      const uid = new mongoose.Types.ObjectId((req.user as MongoUser)._id)

      const match: any = { user_id: uid };

      const filters = req.query

      console.log(JSON.stringify(filters))

      if (filters.startDate && filters.endDate) {
        match.timestamp = { $gte: new Date(filters.startDate as string), $lt: new Date(filters.endDate as string) };
      }

      if (filters.minMsPlayed !== undefined && filters.maxMsPlayed !== undefined) {
        match.ms_played = { $gte: filters.minMsPlayed, $lte: filters.maxMsPlayed };
      }

      if (filters.trackName) {
        match.track_name = { $regex: filters.trackName, $options: 'i' };
      }

      if (filters.albumName) {
        match.album_name = { $regex: filters.albumName, $options: 'i' };
      }

      if (filters.artistName) {
        match.album_artist_name = { $regex: filters.artistName, $options: 'i' };
      }

      if (!filters.sort_by) {
        res.status(400).json({ message: 'No sort_by parameter provided' })
        return
      }

      const sort_by = req.query.sort_by as string
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10

      const topTracks = await Stream.aggregate([
        { 
          $match: match
        },
        {
          $group: {
        _id: '$track_id',
        totalPlays: { $sum: 1 },
        totalDuration: { $sum: '$ms_played' },
        averageDuration: { $avg: '$ms_played' },
        firstListened: { $min: '$timestamp' },
        lastListened: { $max: '$timestamp' }
          }
        },
        {
          $sort: { [sort_by]: -1 }
        },
        {
          $limit: limit + 1
        },
        {
          $lookup: {
            from: 'tracks',
            localField: '_id',
            foreignField: '_id',
            as: 'trackInfo'
          }
        },
        {
          $unwind: '$trackInfo'
        }
      ])

      if (!topTracks || topTracks.length == 0) {
        res.status(404).json({ message: 'No tracks found' })
        return
      }

      res.status(200).json(topTracks)

    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  getStreamsByFilter: async (req: Request, res: Response) => {
    try {
      const filters = req.query

      console.log(filters)

      // filters will be start/end date, min/max ms_played, track name, album name, artist name, country, platform, type (track or episode)
      const uid = new mongoose.Types.ObjectId((req.user as MongoUser)._id)

      const match: any = { user_id: uid };

      if (filters.startDate && filters.endDate) {
        match.timestamp = { $gte: new Date(filters.startDate as string), $lt: new Date(filters.endDate as string) };
      }

      if (filters.minMsPlayed !== undefined && filters.maxMsPlayed !== undefined) {
        match.ms_played = { $gte: filters.minMsPlayed, $lte: filters.maxMsPlayed };
      } else {
        match.ms_played = { $gte: 15000 };
      }

      if (filters.trackName) {
        match.track_name = { $regex: filters.trackName, $options: 'i' };
      }

      if (filters.albumName) {
        match.album_name = { $regex: filters.albumName, $options: 'i' };
      }

      if (filters.artistName) {
        match.album_artist_name = { $regex: filters.artistName, $options: 'i' };
      }


      const page = filters.page ? parseInt(filters.page as string, 10) : 1;
      const limit = 50;
      const skip = (page - 1) * limit;

      const streams = await Stream.aggregate([
        { $match: match },
        { $sort: { timestamp: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      if (!streams || streams.length == 0) {
        res.status(404).json({ message: 'No streams found' })
        return
      }

      res.status(200).json(streams.slice(0, 50))

    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  uploadStreams: async (req: Request, res: Response) => {
    try {
      logger.log('info', 'Uploading streams')

      if (!req.file) {
        res.status(400).json({ message: 'File failed to upload' })
        return
      }

      const filePath = req.file.path;
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      // Parse the JSON
      const inStreams = jsonData.filter((stream: any) => {
        // For now, only adding tracks (get rid of episodes)
        return stream.master_metadata_track_name !== null && stream.master_metadata_album_artist_name !== null && stream.master_metadata_album_album_name !== null
      }).map((stream: any) => {
        return {
          timestamp: stream.ts,
          platform: stream.platform,
          ms_played: stream.ms_played,
          conn_country: stream.conn_country,
          ip_addr: stream.ip_addr,
          track_name: stream.master_metadata_track_name,
          album_artist_name: stream.master_metadata_album_artist_name,
          album_name: stream.master_metadata_album_album_name,
          spotify_track_uri: stream.spotify_track_uri,
          episode_name: stream.episode_name,
          episode_show_name: stream.episode_show_name,
          spotify_episode_uri: stream.spotify_episode_uri,
          reason_start: stream.reason_start,
          reason_end: stream.reason_end,
          shuffle: stream.shuffle,
          skipped: stream.skipped,
          offline: stream.offline,
          offline_timestamp: stream.offline_timestamp,
          incognito_mode: stream.incognito_mode,
          track_id: '',
          user_id: (req.user as MongoUser)._id
        }
      })

      const tracks = inStreams.map((stream: Partial<IStream>) => {
        return {
          name: stream.track_name,
          artist: stream.album_artist_name,
          album: stream.album_name,
          spotify_uri: stream.spotify_track_uri
        }
      })

      const uniqueTracks = Array.from(new Set(tracks.map((track: any) => track.spotify_uri)))
        .map(uri => {
          return tracks.find((track: any) => track.spotify_uri === uri);
        })

      // Avoid duplicates
      const uploadTracks = uniqueTracks.map((track: any) => ({
        $setOnInsert: {
          name: track.name,
          artist: track.artist,
          album: track.album,
          spotify_uri: track.spotify_uri
        }
      }))

      if (uploadTracks.length > 0) {
        console.log("TRACKS", uploadTracks)
        const bulkOps = uploadTracks.map((operation: any) => ({
          updateOne: {
            filter: { spotify_uri: operation.$setOnInsert.spotify_uri },
            update: operation,
            upsert: true
          }
        }))

        const newTracks = await Track.bulkWrite(bulkOps, { ordered: false })

        if (!newTracks) {
          res.status(500).json({ message: 'Error uploading tracks' })
          return
        }

        console.log('New tracks uploaded successfully')
      }

      // Make sure we don't duplicate songs
      const userStreams = await Stream.find({ user_id: (req.user as MongoUser)._id });

      const uploadStreams = inStreams.filter((stream: IStream) => {
        return !userStreams.some((userStream: any) => 
          userStream.timestamp === stream.timestamp && 
          userStream.user_id.toString() === stream.user_id.toString()
        );
      });

      // Append track _id to each stream
      const streamTracks = await Track.find({ 
        spotify_uri: { 
          $in: uploadStreams.map((stream: any) => stream.spotify_track_uri) 
        } 
      })

      uploadStreams.forEach((stream: any) => {
        const track = streamTracks.find((track: any) => track.spotify_uri === stream.spotify_track_uri)
        if (track) {
          stream.track_id = track._id
        }
      });

      if (uploadStreams.length == 0) {
        res.status(200).json({ message: 'No new streams to upload' });
        return;
      }

      console.log("STREAMS", uploadStreams);

      const streams = await Stream.insertMany(uploadStreams);

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      if (!streams) {
        res.status(500).json({ message: 'Error uploading streams' })
        return
      }

      res.status(201).json({ message: 'Streams and tracks uploaded successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
}