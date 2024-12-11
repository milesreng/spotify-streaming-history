import { Request, Response } from 'express'
import mongoose from 'mongoose'
import fs from 'fs'

import { MongoUser } from '../models/user.model'
import { IStream, Stream } from '../models/stream.model'

export const streamController = {
  getAllStreams: async (req: Request, res: Response) => {
    try {
      const streams = await Stream.find({ userId: (req.user as MongoUser)._id })
      res.status(200).json(streams)
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

      const match: any = { userId: uid };

      if (filters.startDate && filters.endDate) {
        match.timestamp = { $gte: filters.startDate, $lt: filters.endDate };
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

      const streams = await Stream.aggregate([
        { $match: match }
      ]);

      if (!streams || streams.length == 0) {
        res.status(404).json({ message: 'No streams found' })
        return
      }

      res.status(200).json(streams)

    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },
  uploadStreams: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'File failed to upload' })
        return
      }

      const filePath = req.file.path;
      const fileData = fs.readFileSync(filePath, 'utf-8');

      // Parse the JSON
      const jsonData = JSON.parse(fileData).map((stream: any) => {
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
          userId: (req.user as MongoUser)._id
        }
      })

      // Make sure we don't duplicate songs
      const userStreams = await Stream.find({ userId: (req.user as MongoUser)._id });

      const uploadStreams = jsonData.filter((stream: IStream) => {
        return !userStreams.some((userStream: any) => 
          userStream.timestamp === stream.timestamp && 
          userStream.userId.toString() === stream.userId.toString()
        );
      });

      if (uploadStreams.length == 0) {
        res.status(400).json({ message: 'No new streams to upload' });
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

      res.status(201).json({ message: 'Streams uploaded successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
}